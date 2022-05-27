import common from "../../utils/common";
import logger from "../../utils/logger";
import { CommonPageResult } from "../model/CommonModel";
import { db } from "../../utils/database";


export interface QueryData {
  [index: string]: any;
}
export interface QueryWhereArg {
  field : string;
  valueOrOperator : string | QueryOperator;
  valueSecond ?: string;
}
export interface QueryResult {
  [index: string]: any;
}

/**
 * 查询比较运算符
 */
export type QueryOperator = ''|'='|'!='|'<'|'>'|'<>'|'<='|'>='|'is null'|'not null'|'like'|'between'|'in';
/**
 * 查询条件
 */
export type QueryCondition = 'and'|'or';

export type QuerySubWhereCallback = (query : QueryGenerator) => void;


interface QueryWhere {
  condition : QueryCondition;
  not: boolean;
  operator : QueryOperator;
  field: string;
  value: any;
  valueIsField?: boolean;
  valueIsRawSql?: boolean;
  valueChildren ?: QueryWhere[];
}
interface QueryOrderBy {
  field : string;
  direction : 'asc'|'desc';
  isRand: boolean;
}
class QuerySelectField {
  isRaw = false;
  field = '';

  public constructor(field : string, isRaw = false) {
    this.field = field;
    this.isRaw = isRaw;
  }
  public toString() {
    return this.isRaw ? this.field : 
      (
        this.field.contains('.') ? 
          this.field.split('.').map((d) => `\`${d}\``).join('.') : 
          `\`${this.field}\``
      )
  }
}

/**
 * 查询构造器
 */
export class QueryGenerator {

  /**
   * 当前表名
   */
  public tableName = '';
  public enableLogSQL = false;

  public enableLog() {
    this.enableLogSQL = true;
    return this;
  }

  public constructor(tableName : string) {
    this.tableName = tableName;
  }

  //#region 工具方法

  /**
   * 清空所有已生成的SQL
   */
  public emptyAll() {
    this.whereConditions = [];
    this.orderByConditions = [];
    this.groupByConditions = [];
    this.limitCondition = -1;
    this.offsetCondition = -1;
    this.lastLimitCondition = '';
    this.lastWhereCondition = '';
    this.addDistinct = false;

    
    return this;
  }

  private solveQueryArrayData(arr : any[]) {
    let sqlValues = new Array<string>();
    for(let i = 0; i < arr.length; i++) {
      if(typeof arr[i] !== 'undefined')
        sqlValues.push(this.solveQueryVar(arr[i]))
    }
    return sqlValues
  }
  private solveQueryData(param : QueryData, acceptFields : string[]) {
    let keys = Object.keys(param);
    let sqlKeys = new Array<string>();
    let sqlValues = new Array<string>();
    let key = '', emptyAccepts = acceptFields.length === 0, val : any = null;
    for(let i = 0; i < keys.length; i++) {
      key = keys[i], val = param[key];
      if((common.isDefined(val) && key !== 'id') && (emptyAccepts || acceptFields.indexOf(key) >= 0)) {
        sqlKeys.push(key);
        sqlValues.push(this.solveQueryVar(val))
      }
    }
    return { sqlKeys, sqlValues }
  }
  private solveQueryVar(v : any) {
    if(typeof v === 'string')
      return `'${v.replace(/\'/g,'\\\'').replace(/\`/g,'\\\`')}'`;
    else if(typeof v === 'number' || typeof v === 'bigint')
      return v.toString();
    else if(typeof v === 'object' && Object.prototype.toString.call(v) === '[object Date]')
      return `'${v.format()}'`;
    return ''+v;
  }
  private solveFields(arr : string[]) {
    let sqlValues = '';
    for(let i = 0; i < arr.length; i++) {
      if(i > 0) sqlValues += ',';
      sqlValues += '\`' + arr[i] + '\`';
    }
    return sqlValues
  }

  //#endregion

  //#region insert 子句

  /**
   * 插入操作
   * @param param 插入的参数
   * @returns Promise 不返回数据
   */
  public insert(param : QueryData | QueryData[], acceptFields : string[] = []) {
    return new Promise<void>((resolve, reject) => {
      if(param instanceof Array) {
        let promises : Promise<number>[] = [];
        param.forEach((v) => promises.push(this.doInsert(v, false, acceptFields)));
        Promise.all(promises).then(() => resolve()).catch(reject);
      } else this.doInsert(param, false, acceptFields).then(() => resolve()).catch(reject);
    });
  }
  /**
   * 执行插入操作并返回新插入记录的ID
   * @param param 插入的参数
   * @returns Promise 返回新插入记录的ID
   */
  public insertGetId(param : QueryData, acceptFields : string[] = []) { return this.doInsert(param, true, acceptFields); }

  //插入
  private doInsert(param : QueryData, returnId : boolean, acceptFields : string[]) {
    return new Promise<number>((resolve, reject) => {
      let { sqlKeys, sqlValues } = this.solveQueryData(param, acceptFields);
      let sql = `INSERT INTO \`${this.tableName}\` (${sqlKeys.join(',')}) VALUES (${sqlValues.join(',')})`;

      if(this.enableLogSQL) logger.log('Query', sql);

      db.exec(sql, (err) => {
        if(err) {
          logger.log('Query', sql);
          reject(err);
        }
        else {
          if(returnId) db.get(`SELECT last_insert_rowid() AS id`, (err, v) => {
            if(err) reject(err);
            else resolve(v);
          });
          else resolve(null);
        }
      });
    });
  }

  //#endregion

  //#region update 子句

  private keyValueToUpdateSql(keys : string[], sqlValues : string[]) {
    let str = '', v = '';
    for(let i = 0, c = keys.length; i < c; i++) {
      v = sqlValues[i];
      if(i > 0) str += ',';
      str += `\`${keys[i]}\`=${v}`;
    }
    return str;
  }

  /**
   * 更新查询器指定字段的记录
   * @param param 要更新的字段和值
   */
  public update(param : QueryData, acceptFields : string[] = []) {
    return new Promise<void>((resolve, reject) => {
      let whereCondition = this.makeWhereCondition();
      let limitCondition = this.makeLimitCondition();
      let { sqlKeys, sqlValues } = this.solveQueryData(param, acceptFields);
      let sql = `UPDATE \`${this.tableName}\` SET ${this.keyValueToUpdateSql(sqlKeys, sqlValues)}`;

      if(whereCondition !== '') sql += ' ' + whereCondition;
      if(limitCondition !== '') sql += ' ' + limitCondition;
      
      if(this.enableLogSQL) logger.log('Query', sql);

      db.exec(sql, (err) => {
        if(err) {
          logger.log('Query', sql);
          reject(err);
        }
        else resolve();
      }); 
    });
  }

  //#endregion

  //#region delete 子句

  /**
   * 删除当前查询器指定条件的记录
   */
  public delete() {
    return new Promise<void>((resolve, reject) => {
      let whereCondition = this.makeWhereCondition();
      let sql = `DELETE FROM \`${this.tableName}\` ${whereCondition}`;
      
      if(this.enableLogSQL) logger.log('Query', sql);
      db.exec(sql, (err) => {
        if(err) { 
          logger.log('Query', sql);
          reject(err);
        }
        else resolve();
      }); 
    });
  }

  //#endregion

  //#region get 子句

  private makeCondition() {
    let whereCondition = this.makeWhereCondition();
    let orderByCondition = this.makeOrderByCondition();
    let groupByCondition = this.makeGroupByCondition();
    let limitCondition = this.makeLimitCondition();

    return { whereCondition, orderByCondition, groupByCondition, limitCondition }
  }
  private makeSelectSql(sql: string, whereCondition: string, orderByCondition: string, groupByCondition: string, limitCondition: string, limitOne = false) {
    if(whereCondition !== '') sql += ' ' + whereCondition;  
    if(groupByCondition !== '') sql += ' ' + groupByCondition;
    if(orderByCondition !== '') sql += ' ' + orderByCondition;
    if(limitCondition !== '') sql += ' ' + limitCondition;
    else if(limitOne) sql += ' LIMIT 1';
    return sql;
  }

  private addDistinct = false;

  /**
   * 强制 SELECT 加上 DISTINCT
   */
  public distinct() {
    this.addDistinct = true;
    this.lastSelectCondition = '';
  }

  /**
   * 进行查询获取数据
   * @returns Promise 成功则返回数据数组
   */
  public get<T extends QueryResult>() {
    return new Promise<T[]>((resolve, reject) => {
      let { whereCondition, orderByCondition, groupByCondition, limitCondition } = this.makeCondition();
      let selectCondition = this.makeSelectCondition();
      let sql = this.makeSelectSql(`SELECT ${selectCondition} FROM \`${this.tableName}\``, 
        whereCondition, orderByCondition, groupByCondition, limitCondition);
      
      if(this.enableLogSQL) logger.log('Query', sql);
      db.all(sql, (err, results) => {
        if(err) { 
          logger.log('Query', sql);
          reject(err);
        }
        else resolve(results as T[]);
      }); 
    });
  }
  /**
   * 从数据表中获取单行数据
   * @returns Promise 成功则返回第一条数据
   */
  public first<T extends QueryResult>() {
    return new Promise<T>((resolve, reject) => {
      let { whereCondition, orderByCondition, groupByCondition, limitCondition } = this.makeCondition();
      let selectCondition = this.makeSelectCondition(); 
      let sql = this.makeSelectSql(`SELECT ${selectCondition} FROM \`${this.tableName}\``, 
        whereCondition, orderByCondition, groupByCondition, limitCondition, true);
      
      if(this.enableLogSQL) logger.log('Query', sql);
      db.get(sql, (err, result) => {
        if(err) { 
          logger.log('Query', sql);
          reject(err);
        }
        else resolve(result as T);
      }); 
    });
  }
  /**
   * 从记录中获取单个字段的值。
   * @param field 字段
   */
  public value<T extends QueryResult>(field : string) {
    return new Promise<T>((resolve, reject) => {
      let { whereCondition, orderByCondition, groupByCondition, limitCondition } = this.makeCondition();
      let sql = this.makeSelectSql(`SELECT \`${field}\` FROM \`${this.tableName}\``, 
        whereCondition, orderByCondition, groupByCondition, limitCondition);
      
      if(this.enableLogSQL) logger.log('Query', sql);
      db.get(sql, (err, result) => {
        if(err) { 
          logger.log('Query', sql);
          reject(err);
        }
        else resolve(result ? result[field] as T : null);
      }); 
    });
  }
  /**
   * 如果你想获取单列数据的集合。
   * @param fields 字段
   */
  public pluck(...fields : string[]) {
    return new Promise<any[]|{[index: string]:any[]}>((resolve, reject) => {
      let { whereCondition, orderByCondition, groupByCondition, limitCondition } = this.makeCondition();
      let sql = this.makeSelectSql(`SELECT \`${this.solveFields(fields)}\` FROM \`${this.tableName}\``, 
        whereCondition, orderByCondition, groupByCondition, limitCondition);

      if(this.enableLogSQL) logger.log('Query', sql);   
      db.all(sql, (err, results) => {
        if(err) { 
          logger.log('Query', sql);
          reject(err);
        }
        else {
          if(fields.length === 1) {
            let field = fields[0];
            let result : any[] = [];
            for(let i = 0; i < results.length; i++)
              result.push(results[i][field]);
            resolve(result);
          } else {
            let result : {[index: string]:any[]} = {};
            fields.forEach((field) => {
              let arr : any[] = [];
              for(let i = 0; i < results.length; i++)
                arr.push(results[i][field]);
              result[field] = arr;
            })
            resolve(result);
          }
        }
      }); 
    });
  }

  /**
   * 进行分页查询数据
   * @param pageNumber 页数，从1开始
   * @param pageSize 页大小
   */
  public paginate<T extends QueryResult>(pageNumber : number, pageSize : number) {
    return new Promise<CommonPageResult<T>>((resolve, reject) => {
      let { whereCondition, orderByCondition, groupByCondition, limitCondition } = this.makeCondition();
      let selectCondition = this.makeSelectCondition();
      let sql = this.makeSelectSql(`SELECT ${selectCondition} FROM \`${this.tableName}\``, 
        whereCondition, orderByCondition, groupByCondition, limitCondition);
      
      if(this.enableLogSQL) logger.log('Query', sql);
      db.all(sql, (err, results) => {
        if(err) { 
          logger.log('Query', sql);
          reject(err);
        }
        else {
          sql = `SELECT COUNT(1) AS count FROM \`${this.tableName}\``;
          db.get(sql, (err, v) => {
            if(err) {
              logger.error('Query.count', `SQL: ${sql} \n` + err.stack);
              reject(err);
            } else {
              resolve(new CommonPageResult<T>(results, pageNumber, pageSize, v.count));
            }
          }); 
        }
      }); 
    });
  }

  //#endregion

  //#region 聚合子句

  private commonAggregate(field : string, fun : string, distinct : boolean) {
    return new Promise<number>((resolve, reject) => {
      let { whereCondition, orderByCondition, groupByCondition, limitCondition } = this.makeCondition();
      let sql = this.makeSelectSql(`SELECT ${fun}(${distinct?'DISTINCT ':''}${field}) AS val FROM \`${this.tableName}\``, 
        whereCondition, orderByCondition, groupByCondition, limitCondition);
      
      if(this.enableLogSQL) logger.log('Query', sql); 
      db.all(sql, (err, results) => {
        if(err) reject(err);
        else resolve(results.length > 0 ? results[0].val : null);
      }); 
    });
  }

  /**
   * 统计当前查询记录数
   */
  public count(field = '1', distinct = false)  { return this.commonAggregate(field, 'COUNT', distinct); }
  public max(field : string, distinct = false)  { return this.commonAggregate(field, 'MAX', distinct); }
  public min(field : string, distinct = false) { return this.commonAggregate(field, 'MIN', distinct); }
  public avg(field : string, distinct = false) { return this.commonAggregate(field, 'AVG', distinct); }
  public sum(field : string, distinct = false) { return this.commonAggregate(field, 'SUM', distinct); }

  /**
   * 查询当前的构造器是否存在指定记录
   * @returns 
   */
  public exists() {
    return new Promise<boolean>((resolve, reject) => {
      let { whereCondition, orderByCondition, groupByCondition, limitCondition } = this.makeCondition();
      let sql = this.makeSelectSql(`SELECT COUNT(1) AS val FROM \`${this.tableName}\``, 
        whereCondition, orderByCondition, groupByCondition, limitCondition);
      
      if(this.enableLogSQL) logger.log('Query', sql); 
      db.all(sql, (err, results) => {
        if(err) { 
          logger.log('Query', sql);
          reject(err);
        }
        else resolve(results.length > 0 ? (results[0].val > 0) : false);
      }); 
    });
  }
  /**
   * 查询当前的构造器是否不存在指定记录
   * @returns 
   */
  public doesntExist() {
    return new Promise<boolean>((resolve, reject) => {
      let { whereCondition, orderByCondition, groupByCondition, limitCondition } = this.makeCondition();
      let sql = this.makeSelectSql(`SELECT COUNT(1) AS val FROM \`${this.tableName}\``, 
        whereCondition, orderByCondition, groupByCondition, limitCondition);
      
      if(this.enableLogSQL) logger.log('Query', sql); 
      db.all(sql, (err, results) => {
        if(err) { 
          logger.log('Query', sql);
          reject(err);
        }
        else resolve(results.length > 0 ? (results[0].val == 0) : false);
      }); 
    });
  }

  //#endregion

  //#region select 子句

  private selectFields = new Array<QuerySelectField>();
  private lastSelectCondition = '';

  private makeSelectCondition() {
    if(this.lastSelectCondition === '') {
      let anyNonRawCondition = false;
      for(let i = 0; i < this.selectFields.length; i++) {
        if(!this.selectFields[i].isRaw) anyNonRawCondition = true;
      }
      if(this.selectFields.length === 0) return `\`${this.tableName}\`.*`;

      let ols = this.selectFields.join(',');
      this.lastSelectCondition = 
        (this.addDistinct ? 'DISTINCT ' : '') + 
        (anyNonRawCondition ? '' : `\`${this.tableName}\`.*${(ols !== '' ? ',' : '')}`) + 
        ols;
    }
    return this.lastSelectCondition;
  }

  /**
   * 清空当前查询器上的select条件
   */
  public selectClear() {
    this.selectFields = [];
    this.lastSelectCondition = '';
  }
  /**
   * 添加select字段
   * @param args 字段
   */
  public select(...args : string[]) { args.forEach((a) => this.selectFields.push(new QuerySelectField(a))); return this; }
  /**
   * 添加原生select语句
   * @param args 语句
   */
  public selectRaw(...args : string[])  { args.forEach((a) => this.selectFields.push(new QuerySelectField(a, true))); return this; }

  //#endregion

  //#region where 子句

  private whereConditions = new Array<QueryWhere>();
  private lastWhereCondition = '';

  private clearWhereCondition() {
    if(this.lastWhereCondition !== '') 
      this.lastWhereCondition = '';
  }
  private QueryWhereToSQL(params: QueryWhere)  {
    if(params.valueIsRawSql)
      return ''+params.value;
    else {
      switch(params.operator) {
        case '<':
        case '<=':
        case '=':
        case '!=':
        case '<>':
        case '>':
        case '>=':
          return `\`${params.field}\`${params.not?' NOT ':''}${params.operator}` + (params.valueIsField ? `\`${params.value}\`` : `${this.solveQueryVar(params.value)}`);
        case 'like':
          return `\`${params.field}\` ${params.not?'NOT ':''}LIKE ${this.solveQueryVar(params.value)}`;
        case 'between':
          return `\`${params.field}\` ${params.not?'NOT ':''}BETWEEN ${this.solveQueryVar(params.value[0])} AND ${this.solveQueryVar(params.value[1])}`;
        case 'in':
          return `\`${params.field}\` ${params.not?'NOT ':''}IN (${this.solveQueryArrayData(params.value).join(',')})`;
        case 'is null':
          return `\`${params.field}\` IS NULL`;
        case 'not null':
          return `\`${params.field}\` IS NOT NULL`;
      }
    }
  };
  private makeWhereCondition() {
    if(this.lastWhereCondition !== '') 
      return this.lastWhereCondition;
    if(this.whereConditions.length === 0)
      return '';

    let loopForConditions = (whereConditions : QueryWhere[]) => {
      let index = 0;
      let base = '';

      whereConditions.forEach((condition) => {

        let sql : string = null;
        if(condition.valueChildren) 
          sql = `(${loopForConditions(condition.valueChildren)}`;
        else 
          sql = this.QueryWhereToSQL(condition);

        if(index == 0) base += ` ${sql}`;
        else base += ` ${condition.condition} ${sql}`;

        index++;
      });

      return base;
    }
    this.lastWhereCondition = 'WHERE' + loopForConditions(this.whereConditions);
    return this.lastWhereCondition;
  }

  /**
   * 清空当前查询器上的where条件
   */
  public whereClear() {
    this.whereConditions = [];
    this.lastWhereCondition = '';
  }

  /**
   * where条件语句
   * @param field 对应字段
   * @param valueOrOperator 可以是值；或当第三个参数填写，则改参数作为比较运算符
   * @param valueSecond 字段的值
   */
  public where(field : string | QueryWhereArg[] | QuerySubWhereCallback, valueOrOperator ?: QueryOperator | string|number|boolean, valueSecond ?: string|number|boolean, condition : QueryCondition = 'and', isCol = false) {
    if(typeof field === 'string') {
      this.whereConditions.push({
        condition: condition,
        operator: valueSecond ? valueOrOperator as QueryOperator : '=',
        value: valueSecond ? valueSecond : valueOrOperator,
        valueIsField: isCol,
        field: field,
        not: false,
      });
    } else if(typeof field === 'function') {
      let old = this.whereConditions;
      let valueChildren = [];
      this.whereConditions.push({
        condition: condition,
        operator: '',
        value: null,
        valueIsField: isCol,
        valueChildren: valueChildren,
        field: '',
        not: false,
      });
      this.whereConditions = valueChildren;//换成指定子的数组
      field(this);//调用回调
      this.whereConditions = old;//换回来
    } else {
      field.forEach((v) => {
        let valueSecond = v.valueSecond;
        let valueOrOperator = v.valueOrOperator;
        this.whereConditions.push({
          condition: condition,
          operator: valueSecond ? valueOrOperator as QueryOperator : '=',
          value: valueSecond ? valueSecond : valueOrOperator,
          field: v.field,
          valueIsField: isCol,
          not: false,
        });
      })
    }
    this.clearWhereCondition();
    return this;
  }
  /**
   * where条件语句但是使用or与前方的where进行拼接
   * @param field 对应字段
   * @param valueOrOperator 可以是值；或当第三个参数填写，则改参数作为比较运算符
   * @param valueSecond 字段的值
   */
  public orWhere(field : string | QueryWhereArg[] | QuerySubWhereCallback, valueOrOperator ?: QueryOperator | string|number|boolean, valueSecond ?: string|number|boolean) {
    return this.where(field, valueOrOperator, valueSecond, 'or');
  }

  /**
   * where条件语句,对比两个字段
   * @param field 对应字段
   * @param field2OrOperator 可以是值；或当第三个参数填写，则改参数作为比较运算符
   * @param field2 字段的值
   */
  public whereColumn(field : string | QueryWhereArg[], field2OrOperator ?: string | QueryOperator, field2 ?: string, condition : QueryCondition = 'and') {
    return this.where(field, field2OrOperator, field2, condition, true);
  }

  /**
   * 注入原生 where 子句
   * @param sql SQL子句。不需要加or或者and
   */
  public whereRaw(sql : string, condition : QueryCondition = 'and') {
    this.whereConditions.push({
      condition: condition,
      operator: '',
      value: sql,
      valueIsRawSql: true,
      field: '',
      not: false,
    });
    this.clearWhereCondition();
    return this;
  }
  /**
   * 注入原生 where 子句（OR连接）
   * @param sql SQL子句。不需要加or或者and
   */
  public orWhereRaw(sql : string) {
    return this.whereRaw(sql, 'or');
  }

  /**
   * 添加某字段值是否包含在一个数组中的条件
   * @param field 字段
   * @param values 可能的值
   */
  public whereIn(field : string, values : string[], condition : QueryCondition = 'and', not = false) {
    if(!Array.isArray(values) || values.length === 0)
      return this;
    this.whereConditions.push({
      condition: condition,
      operator: 'in',
      value: values,
      field: field,
      not: not,
    });
    this.clearWhereCondition();
    return this;
  }
  /**
   * 添加某字段值是否不包含在一个数组中的条件
   * @param field 字段
   * @param values 可能的值
   */
  public whereNotIn(field : string, values : string[], condition : QueryCondition = 'and') {
    return this.whereIn(field, values, condition, true);
  }

  /**
   * 字段为空条件
   * @param field 字段
   */
  public whereNull(field : string, condition : QueryCondition = 'and') {
    this.whereConditions.push({
      condition: condition,
      operator: 'is null',
      value: null,
      field: field,
      not: false,
    });
    this.clearWhereCondition();
    return this;
  }
  /**
   * 字段非空条件
   * @param field 字段
   */
  public whereNotNull(field : string, condition : QueryCondition = 'and') {
    this.whereConditions.push({
      condition: condition,
      operator: 'not null',
      value: null,
      field: field,
      not: false,
    });
    return this;
  }

  /**
   * 字段值在某个区间
   * @param field 字段
   * @param valueBetween 某个区间 [x,y]
   */
  public whereBetween(field : string, valueBetween : number[], condition : QueryCondition = 'and', not = false) {
    this.whereConditions.push({
      condition: condition,
      operator: 'between',
      value: valueBetween,
      field: field,
      not: not,
    });
    this.clearWhereCondition();
    return this;
  }
  /**
   * 字段值不在某个区间
   * @param field 字段
   * @param valueBetween 某个区间
   */
  public whereNotBetween(field : string, valueBetween : number[], condition : QueryCondition = 'and', not = false) {
    return this.whereNotBetween(field, valueBetween, condition, true);
  }
   
  //#endregion

  //#region when

  /**
   * 在给定值在请求中存在的情况下才执行某些查询。
   * @param condition 给定值
   * @param trueCallback 给定值为真时执行回调
   * @param falseCallback 给定值为假时执行回调
   */
  public when(condition : any, trueCallback : QuerySubWhereCallback, falseCallback ?: QuerySubWhereCallback) {
    if(condition) trueCallback(this);
    else if(typeof falseCallback === 'function') falseCallback(this);
  }

  //#endregion

  //#region limit 语句

  private limitCondition = -1;
  private offsetCondition = -1;
  private lastLimitCondition = '';

  private clearLimitCondition() {
    if(this.lastLimitCondition !== '') 
      this.lastLimitCondition = '';
  }
  private makeLimitCondition() {
    if(this.lastLimitCondition === '') {
      if(this.offsetCondition >= 0) this.lastLimitCondition = `LIMIT ${this.offsetCondition},${this.limitCondition}`;
      else if(this.limitCondition >= 0) this.lastLimitCondition = `LIMIT ${this.limitCondition}`;
      else this.lastLimitCondition = '';
    }
    return this.lastLimitCondition;
  }

  /**
   * limit 条件语句
   * @param sizeOrOffset 大小。如果第二个参数填写，则当前参数作为offset。
   * @param size 大小
   */
  public limit(sizeOrOffset : number, size ?: number) {
    if(typeof size === 'number') {
      this.offsetCondition = sizeOrOffset;
      this.limitCondition = size;
    } else this.limitCondition = sizeOrOffset;
    this.clearLimitCondition();
    return this;
  }
  /**
   * offset 条件语句
   * @param size 大小
   */
  public offset(size : number) {
    this.offsetCondition = size;
    this.clearLimitCondition();
    
    return this;
  }

  //#endregion

  //#region orderBy、groupBy 语句

  private orderByConditions = new Array<QueryOrderBy>();
  private groupByConditions = new Array<string>();

  private lastOrderByCondition = '';
  private lastGroupByCondition = '';

  private clearGroupByCondition() { if(this.lastGroupByCondition !== '') this.lastGroupByCondition = ''; }
  private makeGroupByCondition() {
    if(this.lastGroupByCondition !== '') return this.lastGroupByCondition;
    if(this.groupByConditions.length === 0) return '';

    let base = 'GROUP BY';
    for(let i = 0, c = this.orderByConditions.length; i < c; i++) 
      base += `${i > 0?',':''}\`${this.groupByConditions[i]}\``;

    this.lastGroupByCondition = base;
    return this.lastGroupByCondition;
  }
  private clearOrderByCondition() { if(this.lastOrderByCondition !== '') this.lastOrderByCondition = ''; }
  private makeOrderByCondition() {
    if(this.lastOrderByCondition !== '') return this.lastOrderByCondition;
    if(this.orderByConditions.length === 0) return '';

    let base = 'ORDER BY ';

    for(let i = 0, c = this.orderByConditions.length; i < c; i++) {
      let condition = this.orderByConditions[i];
      if(condition.isRand) {
        base += 'RAND()';
        break;
      }else {
        if(i > 0) base += ',';
        base += `\`${condition.field}\` ${condition.direction.toUpperCase()}`;
      }
    }

    this.lastOrderByCondition = base;
    return this.lastOrderByCondition;
  }

  /**
   * orderBy语句
   * @param field 字段
   * @param direction 排序方式
   */
  public orderBy(field : string, direction : 'asc'|'desc' = 'asc') {
    this.orderByConditions.push({ field: field, direction: direction, isRand: false });
    this.clearOrderByCondition();
    return this;
  }
  /**
   * groupBy rand() 语句，用于随机排序
   */
  public inRandomOrder() {
    this.orderByConditions = [];
    this.orderByConditions.push({ field: '', direction: 'asc', isRand: true });
    this.clearOrderByCondition();
    return this;
  }
  /**
   * groupBy 语句
   * @param field 字段
   */
  public groupBy(field : string) {
    this.groupByConditions.push(field);
    this.clearGroupByCondition();
    return this;
  }

  //#endregion

  //#region join子句

  public join(tableName : string) {
    
    return this;
  }

  //#endregion

}

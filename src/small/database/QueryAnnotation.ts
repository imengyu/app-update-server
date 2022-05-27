import logger from "../../utils/logger";
import { solveSqlPlaceholders, splicingSQL, SqlStatcParams } from "./DBUtils";
import { CommonPageResult } from "../model/CommonModel";
import { db } from "../../utils/database";

/**
 * SQL 查询器注解。
 * 可以配置参数和返回类型。
 * @param sql sql语句。语句中嵌入 {0} 表示参数，中间是函数参数的索引。
 * @param retType 返回类型：data，返回结果数组；single_data，返回单个数据，如果没有则返回null；last_insert_id，返回上次插入的ID；page_data，返回分页数据，分页模式必须传入index和size参数。
 * @param paramsIndex 指定参数的索引。page_data模式时指定index和size的参数位置。
 * @returns 
 */
export function SqlQuery<T>(sql : string, retType : 'data'|'single_data'|'last_insert_id'|'page_data' = 'data', paramsIndex : { [index: string]: number } = {}, staticParams : SqlStatcParams = {}) {

  let placeholders = solveSqlPlaceholders(sql);

  return function(target, propertyKey: string, descriptor: PropertyDescriptor) {
    const orginal = target[propertyKey];

    target[propertyKey] = function(...args: any[]) {

      let targetSql = splicingSQL(sql, placeholders, args, orginal, staticParams);

      //分页的逻辑，
      let index = 0, size = 0;
      if(retType === 'page_data') {
        index = paramsIndex['index'] || 0;
        size = paramsIndex['size'] || 1;
        //加上sql
        targetSql += ` LIMIT ${(index-1)*size},${size}`;
      } else if(retType === 'single_data') {
        targetSql += ' LIMIT 1';
      }

      return new Promise<any>((resolve, reject) => {
        db.all(targetSql, (err, results) => {
          if(err) {
            logger.error('SqlQuery', err.stack);
            logger.info('SqlQuery', 'SQL: ' + targetSql);
            reject(err);
            return;
          }
          switch(retType) {
            case 'data': resolve(results); break;
            case 'single_data': 
              if(Object.prototype.toString.call(results) === '[object Array]')
                resolve(results.length > 0 ? results[0] : 0);
              else resolve(results);
              break;
            case 'page_data': {
              const tableName = targetSql.indexOf('FROM ') > 0 ? targetSql.substring(targetSql.indexOf('FROM ')).split(' ')[1] : '';
              targetSql = `SELECT COUNT(1) AS count FROM \`${tableName}\``;
              db.get(targetSql, (err, v) => {
                if(err) {
                  logger.error('SqlQuery.Count', 'SQL: ' + targetSql + '\n' + err.stack);
                  reject(err);
                } else {
                  resolve(new CommonPageResult<T>(v, index, size, v.count));
                }
              });
              break;
            }
            case 'last_insert_id': 
              db.get(`SELECT last_insert_rowid() AS id`, (err, v) => {
                if(err) {
                  logger.error('SqlQuery ID', err.stack);
                  reject(err);
                } else 
                  resolve(v);
              });
              break;
          }
        });
      });
    }
    return target[propertyKey];
  }
}
import { db } from '../../utils/database';
import { solveSqlPlaceholders, splicingSQL, SqlStatcParams } from './DBUtils'
import { QueryGenerator } from './QueryGenerator';

/**
 * 数据库操作工具类 (SQLITE)
 * 如何使用：
 * DB.table('表名') 构造一个查询器
 * DB.select/update/insert/delete 进行SQL查询，其中：
 *      SQL中参数使用： {?} {参数索引} 来代表参数占位符，参数在args中传入
 */
export class DB {

  /**
   * 构造查询器
   * @param name 当前表名
   * @returns 返回构造查询器
   */
  static table(name : string) {
    return new QueryGenerator(name);
  }

  /**
   * 进行 select 查询
   * @param sql SQL语句
   * @param args 参数数组
   * @param staticParams 静态参数
   * @returns promise 成功则返回查询到的数组，错误则返回错误信息
   */
  static select<T>(sql : string, args : any[], staticParams : SqlStatcParams = {}) {
    return new Promise<T[]>((resolve, reject) => {
      let placeholders = solveSqlPlaceholders(sql);
      let targetSql = splicingSQL(sql, placeholders, args, null, staticParams);
      db.all(targetSql, (err, result) => {
        if(err) reject(err);
        else resolve(result);
      })
    });
  }
  /**
   * 执行 update 查询
   * @param sql SQL语句
   * @param args 参数数组
   * @returns promise 成功则返回受影响的行数，错误则返回错误信息
   */
  static update(sql : string, args : any[]) {
    return new Promise<void>((resolve, reject) => {
      let placeholders = solveSqlPlaceholders(sql);
      let targetSql = splicingSQL(sql, placeholders, args, null, {});
      db.exec(targetSql, (err) => {
        if(err) reject(err);
        else resolve();
      })
    });
  }
  /**
   * 执行 insert 查询
   * @param sql SQL语句
   * @param args 参数数组
   * @returns promise 成功则返回新插入的ID，错误则返回错误信息
   */
  static insert(sql : string, args : any[]) {
    return new Promise<number>((resolve, reject) => {
      let placeholders = solveSqlPlaceholders(sql);
      let targetSql = splicingSQL(sql, placeholders, args, null, {});
      db.exec(targetSql, (err) => {
        if(err) reject(err);
        else {
          db.get(`SELECT last_insert_rowid() AS id`, (err, v) => {
            if(err) reject(err);
            else resolve(v);
          });
        }
      })
    });
  }
  /**
   * 执行 delete 查询
   * @param sql SQL语句
   * @param args 参数数组
   * @returns promise 成功则返回受影响的行数，错误则返回错误信息
   */
  static delete(sql : string, args : any[]) {
    return new Promise<void>((resolve, reject) => {
      let placeholders = solveSqlPlaceholders(sql);
      let targetSql = splicingSQL(sql, placeholders, args, null, {});
      db.exec(targetSql, (err) => {
        if(err) reject(err);
        else resolve();
      })
    });
  }

  /**
   * 手动开始事务
   */
  static beginTransaction() {
    return this.actionSql('BEGIN');
  }
  /**
   * 回滚事务
   */
  static rollBack() {
    return this.actionSql('ROLLBACK');
  }
  /**
   * 提交事务
   */
  static commit() {
    return this.actionSql('COMMIT');
  }
  static actionSql(sql : string) {
    return new Promise<void>((resolve, reject) => {
      db.exec(sql, (err) => {
        if(err) reject(err);
        else resolve();
      })
    });
  }
}
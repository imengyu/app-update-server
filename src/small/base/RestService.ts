import { Request } from 'express';
import { DB } from "../database/DB";
import { CommonPageResult } from "../model/CommonModel";
import { PromiseResponseRejectInfo, ResposeCode } from "../utils/http-response";
import logger from "../../utils/logger";
import { BaseService } from "./Service";
import { IQuerySearchParams } from "./RestController";
import common from "../../utils/common";
import { QueryGenerator } from "../database/QueryGenerator";

/**
 * RESTful API 通用资源处理服务
 */
export class RestService<T> extends BaseService {

  private tableName = '';

  protected selectableFields : string[] = [];
  protected updateableFields : string[]  = [];
  protected selectSolve : (req: Request, query : QueryGenerator) => void;
  protected updateSolve : (req: Request, query : QueryGenerator) => void;
  protected insertSolve : (req: Request, query : QueryGenerator) => void;
  protected deleteSolve : (req: Request, query : QueryGenerator) => void;
  protected afterUpdate : (req: Request, id: number, data: T) => void;
  protected afterInsert : (req: Request, id: number, data: T) => void;
  protected beforeDelete : (req: Request, id: number, data: T) => void;
  protected afterDelete : (req: Request, id: number) => void;
  protected listField : string = 'name';

  public constructor(tableName : string, listField?: string) {
    super();
    this.tableName = tableName;
    if(listField) this.listField = listField;
  }

  private solveQuerySearchParams(query : QueryGenerator, params ?: IQuerySearchParams) {
    if(params) {
      for(let key in params.search) {
        let v = params.search[key];
        if(typeof v === 'object') {
          if(v.fuzzy) query.where(key, 'like', `%${v.value}%`);
          else query.where(key, v.value);
        } else 
          query.where(key, v);
      }
      if(!common.isNullOrEmpty(params.sort.field)) {
        if(params.sort.order === 'ascend') 
          query.orderBy(params.sort.field, 'asc');
        else if(params.sort.order === 'descend') 
          query.orderBy(params.sort.field, 'desc');
      }
      for(let key in params.filter) 
        query.whereIn(key, params.filter[key]);
    }
    return query;
  }

  public getList(req: Request, params?: IQuerySearchParams, full = false) {
    return new Promise<T[]>((resolve, reject) => {
      let query = DB.table(this.tableName); 
      if(!full) 
        query.select('id', this.listField)
      else
        query.select(...this.selectableFields);
      this.solveQuerySearchParams(query, params);
      if(typeof this.selectSolve === 'function')
        this.selectSolve(req, query);
      query.get<T>().then((result) => {
        resolve(result);
      }).catch((err) => {
        logger.error('RestService.get', err);
        reject({ errCode: ResposeCode.DATA_BASE_ERROR } as PromiseResponseRejectInfo)
      })
    });
  }
  public get(req: Request, id: number, field?: string) {
    return new Promise<T>((resolve, reject) => {
      let query = DB.table(this.tableName).where('id', id);
      if(field) query.select(field);
      else query.select(...this.selectableFields);
      if(typeof this.selectSolve === 'function')
        this.selectSolve(req, query);
      query.first<T>().then((result) => {
        if(result) resolve(result);
        else reject({ errCode: ResposeCode.RES_NOT_FOUND } as PromiseResponseRejectInfo)
      }).catch((err) => {
        logger.error('RestService.get', err);
        reject({ errCode: ResposeCode.DATA_BASE_ERROR } as PromiseResponseRejectInfo)
      })
    });
  }
  public exists(req: Request, id: number) {
    return new Promise<boolean>((resolve, reject) => {
      let query = DB.table(this.tableName).where('id', id);
      query.exists().then((result) => {
        resolve(result);
      }).catch((err) => {
        logger.error('RestService.get', err);
        reject({ errCode: ResposeCode.DATA_BASE_ERROR } as PromiseResponseRejectInfo)
      })
    });
  }
  public getPage(req: Request, index: number, size: number, params?: IQuerySearchParams) {
    return new Promise<CommonPageResult<T>>((resolve, reject) => {
      let query = DB.table(this.tableName).select(...this.selectableFields).limit((index - 1) * size, size)
      this.solveQuerySearchParams(query, params);
      if(typeof this.selectSolve === 'function') 
        this.selectSolve(req, query);
      query.paginate<T>(index, size).then((data) => {
        resolve(data);
      }).catch((err) => {
        logger.error('RestService.getPage', err);
        reject({ errCode: ResposeCode.DATA_BASE_ERROR } as PromiseResponseRejectInfo)
      })
    });
  }
  public update(req: Request, id: number, data : T) {
    return new Promise<void>((resolve, reject) => {
      let query = DB.table(this.tableName).where('id', id);
      if(typeof this.updateSolve === 'function')
        this.updateSolve(req, query);
      query.exists().then((exists) => {
        if(exists) {
          query.update(data, this.updateableFields)
            .then(() => {
              if(typeof this.afterUpdate === 'function')
                this.afterUpdate(req, id, data);
              resolve();
            })
            .catch((err) => {
              logger.error('RestService.update', err);
              reject({ errCode: ResposeCode.DATA_BASE_ERROR } as PromiseResponseRejectInfo)
            })
        } else {
          reject({ errCode: ResposeCode.RES_NOT_FOUND } as PromiseResponseRejectInfo)
        }
      }).catch((err) => {
        logger.error('RestService.update.exists', err);
        reject({ errCode: ResposeCode.DATA_BASE_ERROR } as PromiseResponseRejectInfo)
      })
    });
  }
  public insert(req: Request, data : T) {
    return new Promise<number>((resolve, reject) => {
      let query = DB.table(this.tableName);
      if(typeof this.insertSolve === 'function')
        this.insertSolve(req, query);
      query.insertGetId(data, this.updateableFields).then((id) => {
        if(typeof this.afterUpdate === 'function')
          this.afterInsert(req, id, data);
        resolve(id);
      }).catch((err) => {
        logger.error('RestService.insert', err);
        reject({ errCode: ResposeCode.DATA_BASE_ERROR } as PromiseResponseRejectInfo)
      })
    });
  }
  public delete(req: Request, id: number) {
    return new Promise<void>((resolve, reject) => {
      let query = DB.table(this.tableName).where('id', id);
      if(typeof this.deleteSolve === 'function')
        this.deleteSolve(req, query);
      query.exists().then((exists) => {
        if(exists) {
          const doDel = () => {
            query.delete().then(() => {
              if(typeof this.afterDelete === 'function')
                this.afterDelete(req, id);
              resolve();
            }).catch((err) => {
              logger.error('RestService.delete', err);
              reject({ errCode: ResposeCode.DATA_BASE_ERROR } as PromiseResponseRejectInfo)
            })
          };

          if(typeof this.beforeDelete === 'function') {
            query.where('id', id).first().then((data) => {
              this.beforeDelete(req, id, data as T);
              doDel();
            })
          } else {
            doDel();
          }
        } else {
          reject({ errCode: ResposeCode.RES_NOT_FOUND } as PromiseResponseRejectInfo)
        }
      }).catch((err) => {
        logger.error('RestService.delete.exists', err);
        reject({ errCode: ResposeCode.DATA_BASE_ERROR } as PromiseResponseRejectInfo)
      })
    });
  }

}
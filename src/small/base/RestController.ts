import { Express, Request, Response } from 'express'
import common from '../../utils/common';
import { BaseController } from "./Controller";
import { RestService } from "./RestService";

/**
 * 查询自定义筛选、排序、搜索参数
 */
export interface IQuerySearchParams {
  sort: {
    field: string;
    order: 'ascend'|'descend';
  },
  search: {
    [index: string]: string|number|boolean|{
      fuzzy: boolean,
      value: string
    };
  },
  filter: {
    [index: string]: any[];
  },
}


/**
 * RESTful 通用API类型
 */
export type RestApiType = 'get'|'getPage'|'add'|'delete'|'update';

export type CheckPromiseCallback = (type: RestApiType,req : Request, res : Response) => Promise<void>|null|undefined;


/**
 * RESTful 通用API控制器
 */
export class RestCotroller<T> extends BaseController {

  public constructor(subName : string, getRestService : () => RestService<T>) {
    super();
    this.subName = subName;
    this.getRestService = getRestService;
  }

  protected subName = '';
  protected allowApi : RestApiType[] = [ 'get','getPage','add','delete','update' ];
  protected getRestService : () => RestService<T>;
  protected getCheckPromise : CheckPromiseCallback  = () => null;

  buildSearchParams(req : Request) {
    return {
      search: (typeof req.query.search !== 'string' || common.isNullOrEmpty(req.query.search)) ? {} : JSON.parse(req.query.search),
      sort: (typeof req.query.sort !== 'string' || common.isNullOrEmpty(req.query.sort)) ? {} : JSON.parse(req.query.sort),
      filter: (typeof req.query.filter !== 'string' || common.isNullOrEmpty(req.query.filter)) ? {} : JSON.parse(req.query.filter),
    } as IQuerySearchParams;
  }

  bindAll(app : Express) {
    if(this.allowApi.contains('get')) app.get(`/${this.subName}/list`, (req, res) => {
      this.commonResponse(
        req,
        res,
        this.getRestService().getList(this.buildSearchParams(req), common.getBoolean(req.query.full as string)),
        this.getCheckPromise('get', req, res)
      )
    });
    if(this.allowApi.contains('get')) app.get(`/${this.subName}/:id`, (req, res) => {
      this.commonResponse(
        req,
        res,
        this.getRestService().get(parseInt(req.params.id as string)),
        this.getCheckPromise('get', req, res)
      )
    });
    if(this.allowApi.contains('getPage')) app.get(`/${this.subName}/:page/:size`, (req, res) => {
      this.commonResponse(
        req,
        res,
        this.getRestService().getPage(parseInt(req.params.page as string), parseInt(req.params.size as string), this.buildSearchParams(req)),
        this.getCheckPromise('getPage', req, res)
      )
    });
    if(this.allowApi.contains('add')) app.post(`/${this.subName}`, (req, res) => {
      this.commonResponse(
        req,
        res,
        this.getRestService().insert(req.body),
        this.getCheckPromise('add', req, res),
        { body: true, query: [] }
      )
    });
    if(this.allowApi.contains('update')) app.put(`/${this.subName}/:id`, (req, res) => {
      this.commonResponse(
        req,
        res,
        this.getRestService().update(parseInt(req.params.id as string), req.body),
        this.getCheckPromise('update', req, res),
        { body: true, query: [] }
      )
    });
    if(this.allowApi.contains('delete')) app.delete(`/${this.subName}/:id`, (req, res) => {
      this.commonResponse(
        req,
        res,
        this.getRestService().delete(parseInt(req.params.id as string)),
        this.getCheckPromise('delete', req, res)
      )
    });
  }
}
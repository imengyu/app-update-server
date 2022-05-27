import common from '@/utils/common';
import { getAxios, ICommonPageResult, IEmpty, IKeyValue } from '.';
import { commonRequest } from './common';

export function buildParams(params : Array<string>) {
  var rs = '';
  if(params && params.length > 0) {
    for(let i = 0; i < params.length; i++) {
      if(i == 0) rs = params[i];
      else rs += '/' + params[i];
    }
  }
  return rs
}
export function buildSearchKeyPars(querys : QueryParams) {
  var rs = '';
  if(querys) {
    var keys = Object.keys(querys), j = 0;
    for(let i = 0; i < keys.length; i++) {
      let obj = querys[keys[i]];
      if(!common.isNullOrEmpty(obj)) {
        if(typeof obj === 'object') obj = JSON.stringify(obj); 
        if(j == 0) rs = '?' + keys[i] + '=' + encodeURI(obj);
        else rs += '&' + keys[i] + '=' + encodeURI(obj);
        j++;
      }
    }
  }
  return rs
}

export interface QueryParams {
  sort?: {
    field: string|undefined;
    order: 'ascend'|'descend'|string|undefined;
  },
  search?: {
    [index: string]: string|number|boolean|{
      fuzzy: boolean,
      value: string
    }|undefined;
  },
  filter?: {
    [index: string]: any[]|undefined;
  },
  full?: boolean,

  [index:string]: any|undefined,
}

/**
 * 通用资源请求类
 */
export class RestfulApi<T> {

  /**
   * api 子路径
   */
  public subResKey : string;

  /**
   * 创建 通用资源请求类
   * @param subResKey api 子路径
   */
  public constructor(subResKey : string) {
    this.subResKey = subResKey;
  }

  protected buildSearchKeyPars(querys : QueryParams) {
    return buildSearchKeyPars(querys);
  }
  protected buildParams(params: string[]) {
    return buildParams(params);
  }

  /**
   * 获取 {id, name} 快速索引结构
   */
  public getList(querys : QueryParams = {}, appendParams: string[] = [], prependParams: string[] = []) {
    return commonRequest<T[]>(getAxios().get(`/${this.subResKey}` +
      buildParams(prependParams) + 
      `/list/` + 
      buildParams(appendParams) + 
      buildSearchKeyPars(querys)));
  }
  /**
   * 请求分页
   * @param page 页码 1 开始
   * @param pageSize 页大小
   * @param searchKeys 搜索筛选键值
   */
  public getPage(page : number, pageSize : number, querys : QueryParams = {}, appendParams: string[] = [], prependParams: string[] = []) {
    return commonRequest<ICommonPageResult<T>>(getAxios().get(`/${this.subResKey}` +
      buildParams(prependParams) + 
      `/${page}/${pageSize}/` + 
      buildParams(appendParams) + 
      buildSearchKeyPars(querys)));
  }
  /**
   * 请求资源
   * @param id 资源ID
   */
  public get(id : number, querys : QueryParams = {}, appendParams: string[] = [], prependParams: string[] = []) {
    return commonRequest<T>(
      getAxios().get(`/${this.subResKey}` + 
        buildParams(prependParams) + `/${id}` + buildParams(appendParams) + 
        buildSearchKeyPars(querys)));
  }
  /**
   * 添加资源
   * @param data 资源数据
   */
  public add(data : T|IKeyValue, querys : QueryParams = {}, appendParams: string[] = []) {
    return commonRequest<number>(getAxios().post(`/${this.subResKey}` + buildParams(appendParams) + 
      buildSearchKeyPars(querys), data));
  }
  /**
   * 更新资源
   * @param id 资源ID
   * @param data 资源数据
   */
  public update(id : number, data : T|IKeyValue, querys : QueryParams = {}, appendParams: string[] = [], prependParams: string[] = []) {
    return commonRequest<IEmpty>(getAxios().put(`/${this.subResKey}` + 
      buildParams(prependParams) + `/${id}` + buildParams(appendParams) + 
      buildSearchKeyPars(querys), data));
  }
  /**
   * 删除资源
   * @param id 资源ID
   */
  public delete(id : number, querys : QueryParams = {}, appendParams: string[] = [], prependParams: string[] = []) {
    return commonRequest<IEmpty>(getAxios().delete(`/${this.subResKey}` + 
      buildParams(prependParams) + `/${id}` + buildParams(appendParams) + 
      buildSearchKeyPars(querys)));
  }
}
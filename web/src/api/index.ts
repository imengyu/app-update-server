import axios from 'axios'
import config from '../config'
import login, { IAuthStruct } from './login'
import user from './user'
import group from './group'
import permission from './permission'
import store from '../store';
import common from '@/utils/common';

export const apiRoot = process.env.NODE_ENV === "development" ? config.api.dev.API_ROOT : config.api.prod.API_ROOT;

const instance = axios.create({
  baseURL: apiRoot,
  timeout: 3000,
  timeoutErrorMessage: '请求超时，请检查网络连接',
});

const apiKey = process.env.NODE_ENV === "development" ? config.api.dev.API_KEY : config.api.prod.API_KEY
const devUid = common.getDeviceUid();

//添加身份认证
instance.interceptors.request.use((value) => {
  if(!value.headers) value.headers = {};

  //添加附加参数
  if(value.url) {
    if(!value.url.contains('?'))
      value.url += '?identifier=' + devUid;
    else 
      value.url += '&identifier=' + devUid;
    value.url += '&nonce=' + common.randomNumberString(10);
  }

  //添加认证参数
  value.headers.Authorization = JSON.stringify({
    auth: store ? store.state.authKName: '',
    validity: store ? store.state.authKVal : '',
    nonce: common.randomNumberString(10),
    identifier: devUid,
    key: apiKey,
  } as IAuthStruct);

  return value;
});


/**
 * 通用分页返回结构
 */
export interface ICommonPageResult<T> {
  items: T[];
  pageIndex: number;
  pageSize: number;
  allCount: number;
  allPage: number;
  empty: boolean;
}
/**
 * 空的接口
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface IEmpty {}

/**
 * 任意JSON数据
 */
export interface IKeyValue {
  [index: string]: any;
}


/**
 * 获取axios实例
 * @returns axios实例
 */
export function getAxios() {
  return instance
}

/**
 * 加载状态
 */
export type LoadStatus = 'notload'|'success'|'failed'|'loading' ;

/**
 * Api 封装
 */
export default { 
  login,
  user,
  permission,
  group,
  getAxios,
}
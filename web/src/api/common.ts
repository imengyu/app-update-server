import config from "@/config";
import { AxiosResponse } from "axios";

/**
 * API 的返回结构体
 */
export class ApiResult<T> {

  public success = false;
  public code = 0;
  public message = '';
  public data : T|null = null;

  public constructor(success = false, code? : number, message? : string, data?: T) {
    this.success = success;
    if(typeof code !== 'undefined') this.code = code;
    if(typeof message !== 'undefined') this.message = message;
    if(typeof data !== 'undefined') this.data = data;
  }
}

/**
 * API 的错误信息
 */
export class ApiError<T> {

  public networkError = false;
  public errorMessage : string;
  public errorApiData : ApiResult<T>|null = null;

  public constructor(networkError = false, errorMessage : string = '', errorApiData ?: ApiResult<T>) {
    this.networkError = networkError;
    this.errorMessage = errorMessage;
    if(errorApiData) this.errorApiData = errorApiData;
  }

  public toString() : string {
    return this.errorMessage; 
  }

}

/**
 * 获取API结果
 * @param data 返回源数据
 */
export function getApiResult<T>(data : any) {
  return new ApiResult<T>(data.success, data.code, data.message, data.data);
}
/**
 * 通用请求
 * @param promise axios 请求返回的 promise
 */
export function commonRequest<T>(promise : Promise<AxiosResponse>) {
  return new Promise<ApiResult<T>>((resolve, reject) => commonResponse<T>(promise, resolve, reject));
}
/**
 * 通用请求返回处理
 * @param promise axios 请求返回的 promise
 * @param resolve promise resolve
 * @param reject promise reject
 */
export function commonResponse<T>(promise : Promise<AxiosResponse>, resolve: (value: ApiResult<T>|PromiseLike<ApiResult<T>>) => void, reject: (reason?: ApiError<T>) => void) {
  promise.then((response) => {
    if(!response){
      reject(new ApiError(true, '网络错误'))
    } else if(response.data.success) {
      try{
        if(process.env.NODE_ENV == 'development') {
          console.log('[API Debugger] Request ' + response.config.url + ' success (' + response.status + ')');
          if(config.logApiData)
            console.dir(response.data.data);
        }
        resolve(getApiResult<T>(response.data));
      }catch(e) {
        if(process.env.NODE_ENV == 'development') 
          console.error('[API Debugger] Catch error in promise : ' + e + (e.stack ? ('\n' + e.stack) : ''));
        reject(new ApiError(true, '代码错误：' + e))
      }
    }
    else {
      if(process.env.NODE_ENV == 'development') 
        console.warn(`[API Debugger] Request [${response.config.method}] ${response.config.url} Got error from server : ` + response.data.message + ' (' + response.data.code + ')');
      reject(new ApiError(false, response.data.message, getApiResult<T>(response.data)));
    }
  }).catch((e) => {
    if(process.env.NODE_ENV == 'development') 
      console.error('[API Debugger] Error : ' + e + (e.stack ? ('\n' + e.stack) : ''));
    reject(new ApiError(true, '网络错误：' + e))
  });
}
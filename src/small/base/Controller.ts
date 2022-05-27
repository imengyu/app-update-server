import BeanFactory from "../factory/BeanFactory";
import { Express, Request, Response } from 'express'
import common from "../../utils/common";
import { PromiseResponseRejectInfo, ResposeCode } from "../utils/http-response";
import logger from "../../utils/logger";

/**
 * 控制器注解
 * @param constructorFunction 
 * @returns 
 */
export function Controller<T extends { new(...constructorArgs: any[]) }>(constructorFunction: T) {

  let newConstructorFunction: any = function (...args) {
    let func: any = function () { return new constructorFunction(...args); }
    func.prototype = constructorFunction.prototype;

    let result: any = new func();
    BeanFactory.addBean(constructorFunction.name, 'Controller', result);//add bean
    return result;
  }
  newConstructorFunction.prototype = constructorFunction.prototype;
  return newConstructorFunction;
}

export interface ControllerInputCheck {
  body: boolean;
  query: string[];
}

/**
 * Express 控制器接口
 */
export interface ControllerInterface {
  bindAll(app : Express);
}
/**
 * 控制器基类
 */
export class BaseController implements ControllerInterface {

  bindAll(app : Express) {}

  /**
   * 统一进行处理请求的 Promise
   * @param res 返回 Response
   * @param promise 请求的 Promise
   * @param customFailedReturnData 自定义失败返回数据
   */
  protected commonResponse(req : Request, res : Response, 
    promise : Promise<any>, preCheck : Promise<any>|null|undefined  = null, 
    requiredInput : ControllerInputCheck|null = null, 
    customFailedReturnData : object|null = null) {

    //检查参数
    if(requiredInput) {
      if(requiredInput.body && !common.isDefinedAndNotNull(req.body)) {
        common.sendFailed(res, ResposeCode.BAD_REQUEST.code, '没有 body 参数', customFailedReturnData);
        return;
      }
      let query = requiredInput.query;
      if(query.length > 0) {
        for(let i = 0, c = query.length; i < c; i++){
          if(common.isNullOrEmpty(req.query[query[i]])) {
            common.sendFailed(res, ResposeCode.BAD_REQUEST.code, `没有参数 ${query[i]} 未提供`, customFailedReturnData);
            return;
          }
        }
      }
    }

    //处理
    let doSolve = () => {
      promise
        .then((v) => common.sendSuccess(res, v))
        .catch((e) => this.commonResponseCatchHandler(res, e, customFailedReturnData));
    };

    //调用预检查Promise
    if(preCheck) preCheck.then(() => doSolve()).catch((e) => this.commonResponseCatchHandler(res, e, customFailedReturnData));
    else doSolve(); 
  }
  /**
   * 统一处理请求的Catch数据并返回前台
   * @param res 返回 Response
   * @param e Catch的reason
   * @param customFailedReturnData 自定义失败返回数据
   */
  protected commonResponseCatchHandler(res : Response, e : any, customFailedReturnData : object|null) {
    if(Object.prototype.toString.call(e) === '[object Error]'){
      logger.error('Handler', e + (e.stack ? '\n' + e.stack : ''));
      common.sendFailed(res, ResposeCode.SERVER_ERROR.code, ResposeCode.SERVER_ERROR.message + '\n' + e);
    } else if(Object.prototype.toString.call(e) === '[object Object]'){
      let info = e as PromiseResponseRejectInfo;
      common.sendFailed(res, 
        info.errCode.code, 
        info.message ? info.message : info.errCode.message,
        customFailedReturnData);
    } else
      common.sendFailed(res, 
        typeof e === 'number' ? e : ResposeCode.SERVER_HANDLER_EXCEPTION.code, 
        typeof e === 'string' ? e : ResposeCode.SERVER_HANDLER_EXCEPTION.message,
        customFailedReturnData);
  }

}

/**
 * 注册所有控制器
 * @param app Express实例
 */
export function bindAllControllerBeans(app : Express) {
  let all = BeanFactory.getBeanByType('Controller');
  all.forEach((v) => {
    if(typeof (v as ControllerInterface).bindAll === 'function') 
      (v as ControllerInterface).bindAll(app);
  })
}
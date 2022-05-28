import { Response } from "express";
import common from "../../utils/common";
import logger from "../../utils/logger";

export interface ResposeCodeInfo {
  code: number,
  message: string,
}

export var ResposeCode = {
  SUCCESS: {
    code: 20000,
    message: '成功'
  },
  DATA_BASE_ERROR: {
    code: 40300,
    message: '数据库错误'
  },
  BAD_REQUEST: {
    code: 40400,
    message: '请求参数存在错误'
  },
  AUTH_REQUIRED: {
    code: 44001,
    message: '需要认证'
  },
  RES_ACCESS_DENINED: {
    code: 40403,
    message: '没有权限，拒绝访问当前资源'
  },
  RES_NOT_FOUND: {
    code: 40404,
    message: '未找到资源'
  },
  APP_NOT_FOUND: {
    code: 40405,
    message: '未找到应用'
  },
  AUTH_EXPIRED: {
    code: 40101,
    message: '登录信息已经过期，请重新登录'
  },
  AUTH_TOKEN_NOT_FOUND: {
    code: 40102,
    message: '未找到登录密钥'
  },
  AUTH_TOKEN_EXPIRED: {
    code: 40103,
    message: '登录密钥已失效'
  },
  AUTH_NOT_FOUND_USER: {
    code: 40104,
    message: '未找到对应用户'
  },
  AUTH_USER_BANNED: {
    code: 40108,
    message: '用户被封禁，请联系管理员解封'
  },
  AUTH_USER_GROUP_MISMATCH: {
    code: 40109,
    message: '用户所在的组没有此权限'
  },
  AUTH_USER_GROUP_MISSING: {
    code: 40111,
    message: '用户没有组'
  },
  AUTH_USER_NO_PERMISSION: {
    code: 40112,
    message: '用户没有权限'
  },
  AUTH_PASSWORD_ERROR: {
    code: 40105,
    message: '用户名或者密码错误'
  },
  AUTH_WAITING: {
    code: 40106,
    message: '正在等待登录'
  },  
  AUTH_WAITING_ACCEPT: {
    code: 40107,
    message: '正在等待授权'
  }, 
  AUTH_QR_NEED_LOGIN: {
    code: 40108,
    message: '您需要先登录才能扫码'
  },
  API_TIME_OVERLAY_TOO_MUCTH: {
    code: 40201,
    message: 'API 时间戳差距过大'
  },
  API_NOT_FOUND_SYS: {
    code: 40202,
    message: '未找到子系统'
  },
  API_AUTH_FAIL: {
    code: 40203,
    message: 'API 验签失败'
  },
  DATA_BAD_DATA_TYPE: {
    code: 40301,
    message: '错误的数据类型'
  },
  DATA_MISSIONG: {
    code: 40302,
    message: '某些数据未填写'
  },
  INTERNAL_ERROR: {
    code: 50500,
    message: '服务器内部错误'
  },
  SERVER_ERROR: {
    code: 51500,
    message: '服务出现错误，请稍后重试'
  },
  SERVER_HANDLER_EXCEPTION: {
    code: 52500,
    message: '请求接收器存在错误'
  },
  SERVER_NOT_IMPLEMENTED: {
    code: 52501,
    message: '未实现'
  },
};

export interface PromiseResponseRejectInfo {
  errCode: ResposeCodeInfo,
  message?: string,
}

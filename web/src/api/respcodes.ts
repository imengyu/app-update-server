export interface ResposeCodeInfo {
  code: number,
  message: string,
}
export var ResposeCode = {
  SUCCESS: {
    code: 20000,
    message: '成功'
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
    message: '拒绝访问当前资源'
  },
  RES_NOT_FOUND: {
    code: 40404,
    message: '未找到资源'
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
};
import { commonRequest } from './common';
import { getAxios, IEmpty } from './index'
import md5 from 'md5'

/**
 * QR登录请求返回信息结构
 */
export interface IAuthQrAccess {
  reuestUid: string;
}
/**
 * 登录状态返回信息结构
 */
export interface IAuthStatus {
  authStatus: boolean;
  expireAt: Date;
}
/**
 * 认证信息结构
 * 在 authorization 字段中
 */
export interface IAuthStruct {
  auth: string;
  validity: string;
  nonce: string;
  identifier: string;
  key: string;
}
/**
 * 登录请求信息结构
 */
export interface IAuthRequestStruct {
  method: 'key'|'qr';
  key: string;
}
/**
 * 登录信息返回结构
 */
export interface IAuthResult {
  authStatus: boolean;
  expireAt: Date;
  authName: string;
  authKey: string;
  authUid: number;
}

export default {
  getLoginQR() {
    return commonRequest<IAuthQrAccess>(getAxios().get('/auth/qr'));
  },
  notifyLoginQRScan(key: string) {
    return commonRequest<IAuthQrAccess>(getAxios().post(`/auth/qr-scan?key=${key}`));
  },
  doLoginQR(key: string) {
    return commonRequest<IAuthQrAccess>(getAxios().post(`/auth/qr?key=${key}`));
  },
  getLoginStatus() {
    return commonRequest<IAuthStatus>(getAxios().get('/auth'));
  },
  doLogin(method: 'key'|'qr', pass: string, rember = false) {
    
    if(!pass.contains('@')) pass += '@unknow';

    const k = pass.split('@');
    return commonRequest<IAuthResult>(getAxios().post('/auth?rember=' + rember, {
      method: method,
      key: k[0] + '@' + md5(k[1]) + (k.length >=3 ? ('@' + md5(k[2])) : '')
    } as IAuthRequestStruct));
  },
  doLogout() {
    return commonRequest<IEmpty>(getAxios().delete('/auth'));
  },
}
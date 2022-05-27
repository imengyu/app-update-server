import { GroupDataSolved } from "./GroupModel";

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
  expireAt: Date,
}

/**
 * 认证信息结构
 * 在 authorization 字段中
 */
export interface IAuthStruct {
  auth: string,
  validity: string,
  nonce: string,
  identifier: string,
  key: string,
}

/**
 * 登录请求信息结构
 */
export interface IAuthRequestStruct {
  method: 'key'|'qr',
  key: string,
}

/**
 * 登录信息返回结构
 */
export interface IAuthResult {
  authStatus: boolean;
  expireAt: Date,
  authName: string,
  authKey: string,
  authUid: number,
}

/**
 * 用户认证存储信息结构
 */
export interface IAuthStorageInfo {
  expireAt: Date,
  userId: number,
  userGroupId: number,
  userGroup: GroupDataSolved,
  userAuthKey: string,
  permissions: string[],
  revokePermissions: string[],
}

/**
 * API 认证结构
 */
export interface IAPIAuthStruct {
  key: string,
  identifier: string,
  subsys_id: number,
  nonce: string,
  timestamp: number,
}
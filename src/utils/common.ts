import { Response } from "express";
import { ResposeCode } from "../small/utils/http-response";
import StringUtils from "./string";

/**
 * 返回成功
 */
function sendSuccess(res : Response, data?: object|null, code ?: number|string, message?: string) {
  if(!code) code = ResposeCode[typeof code === 'string' ? code : 'SUCCESS'].code;
  if(!message) message = ResposeCode[typeof code === 'string' ? code : 'SUCCESS'].message || '成功';
  if(!data) data = null;
  res.send({
    success: true,
    code: code,
    message: message,
    data: data
  });
}
/**
 * 返回失败 json
 */
function sendFailed(res : Response, code?: number|string, message?: string, data?: object|null) {
  if(!code) code =  ResposeCode[typeof code === 'string' ? code : 'BAD_REQUEST'].code;
  if(!data) data = null;
  if(!message) message = ResposeCode[typeof code === 'string' ? code : 'BAD_REQUEST'].message || '失败';
  res.send({
    success: false,
    message: message,
    code: code,
    data: data
  });
}

/**
 * 检查是否定义
 * @param obj 
 */
function isDefined(obj : any) {
  return typeof obj !== 'undefined';
}
/**
 * 字符串判空
 * @param str 字符串
 */
function isNullOrEmpty(str : any){
  return StringUtils.isNullOrEmpty(str);
}
/**
 * 判断是否定义并且不为null
 * @param v 要判断的数值
 */
function isDefinedAndNotNull(v : any) {
  return v != null && typeof v != 'undefined';
}

/**
 * 字符串转布尔
 * @param v 字符串
 */
function getBoolean(v : string) {
  return typeof v === 'string' && v.toLowerCase() === 'true' || v === '1';
}

/**
 * 通过字符串键值访问对象属性
 * @param o 基础对象
 * @param s key
 * @returns 
 */
function getObjectKey(o : object, s : string) {
  s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
  s = s.replace(/^\./, '');           // strip a leading dot
  var a = s.split('.');
  for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
          o = o[k];
      } else {
          return;
      }
  }
  return o;
}

/**
 * 生成随机字符串
 * @param len 随机字符串长度
 * @returns 随机字符串
 */
function randomString(len ?: number) {
  len = len || 32;
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  var maxPos = $chars.length;
  var pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

/**
 * 生成随机字符串
 * @param len 随机字符串长度
 * @returns 随机字符串
 */
function randomNumberString(len ?: number) {
  len = len || 32;
  var $chars = '0123456789';
  var maxPos = $chars.length;
  var pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}
/**
 * 生成指定范围之内的随机数
 * @param minNum 最小值
 * @param maxNum 最大值
 */
function genRandom(minNum : number, maxNum : number){
  return Math.floor(Math.random()*(maxNum-minNum+1)+minNum); 
}
/**
 * 生成不重复随机字符串
 * @param randomLength 字符长度
 */
function genNonDuplicateID(randomLength : number){
  let idStr = Date.now().toString(36)
  idStr += Math.random().toString(36).substr(3,randomLength)
  return idStr
}
/**
 * 生成不重复随机字符串
 * @param randomLength 字符长度
 */
function genNonDuplicateIDHEX(randomLength : number){
  let idStr = genNonDuplicateID(randomLength);
  return StringUtils.strToHexCharCode(idStr, false).substr(idStr.length - randomLength, randomLength);
}

export default {
  isDefined,
  isNullOrEmpty,
  isDefinedAndNotNull,
  sendSuccess,
  sendFailed,
  getBoolean,
  getObjectKey,
  randomString,
  randomNumberString,
  genRandom,
  genNonDuplicateID,
  genNonDuplicateIDHEX,
}
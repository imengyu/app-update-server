import { IKeyValue } from "@/api";
import config from "@/config";
import StringUtils from "./string";

/**
 * 数字补0
 */
function pad(num : number|string, n : number) {
  var str = num.toString();
  var len = str.length;
  while (len < n) {
    str = "0" + num;
    len++;
  }
  return str;
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

function getDeviceUid() {
  let uid = localStorage.getItem(config.consts.uidName);
  if(!uid || uid === '') {
    uid = genNonDuplicateID(16);
    localStorage.setItem(config.consts.uidName, uid);
  }
  return uid;
}

/**
 * 深克隆对象
 * @param obj 要克隆对象
 * @param deepArray 是否要深度克隆数组里的每个对象
 */
function clone(obj : IKeyValue|Array<any>, deepArray = false) : IKeyValue {
  let temp : any = null;
  if (obj instanceof Array) {
    if(deepArray) temp = (obj as IKeyValue[]).map<IKeyValue>((item) => clone(item, deepArray) as IKeyValue)
    else temp = obj.concat();
  }
  else if (typeof obj === 'object') {
    temp = new Object() as IKeyValue;
    for (let item in obj) {
      let val = obj[item];
      if(val === null) temp[item] = null;
      else temp[item] = clone(val, deepArray);
    }
  }else temp = obj;
  return temp;
}

export default {
  pad,
  isDefined,
  isNullOrEmpty,
  isDefinedAndNotNull,
  /**
   * 如果字符串为空，则返回undefined，否则返回字符串
   * @param val 
   */
  emptyToUndefined(val : string) {
    return isNullOrEmpty(val) ? undefined : val;
  },
  /**
   * 找到将字符串转为搜索参数
   * @param val 
   * @param fuzzy 是否模糊搜索 
   */
  stringToSearchValue(val : string, fuzzy = false) {
    return isNullOrEmpty(val) ? undefined : {
      fuzzy: fuzzy,
      value: val
    };
  },
  /**
   * 如果数字为null或小于等于0，则返回undefined，否则返回数字
   * @param val 
   */
  zeroOrNullToUndefined(val ?: number|null) {
    return (!val || val == 0) ? undefined : val;
  },
  clone,
  /**
   * 将源对象每个属性都复制到目标对象（不管目标对象有没有对应属性）
   * @param {*} setObj 
   * @param {*} sourceObj 
   */
  cloneValue(setObj: { [index:string]: any}, sourceObj: { [index:string]: any}){
    if(!setObj || !sourceObj) return;
    Object.keys(setObj).forEach(function(key){
      if(typeof sourceObj[key] != 'undefined') 
        setObj[key] = sourceObj[key];
    });
  },
  randomString,
  randomNumberString,
  getDeviceUid,
  genRandom,
  genNonDuplicateID,
  genNonDuplicateIDHEX,

}
var StringUtils = {
  /**
   * 字符串判空
   * @param str 字符串
   */
  isNullOrEmpty(str : string | undefined | null){
    return !str || typeof str === 'undefined' || str === ''
  },
  isBase64,
  isNumber,
  isChinaPoneNumber,
  isEmail,
  strToHexCharCode,
  pad,
  formatNumberWithComma,
  getFileName(path : string) {
    var pos = path.lastIndexOf('/');
    if(pos < 0) pos = path.lastIndexOf('\\');
    return path.substring(pos + 1);  
  },
  getCharCount,
  getFileSizeStringAuto(filesize: number) {
    let sizeStr = '';
    if(filesize >= 1073741824){
      filesize = Math.round(filesize/1073741824*100)/100;
      sizeStr = filesize + "GB";
    }else if(filesize >= 1048576) {
      filesize = Math.round(filesize/1048576*100)/100;
      sizeStr = filesize + "MB";
    }else{
      filesize = Math.round(filesize/1024*100)/100;
      sizeStr = filesize + "KB";
    }
    return sizeStr;
  },
}

export default StringUtils;

/**
 * 得到字符串含有某个字符的个数  
 * @param str 字符串
 * @param char 某个字符
 * @returns 个数  
 */
function getCharCount(str : string, char : string){
  var regex = new RegExp(char, 'g'); // 使用g表示整个字符串都要匹配
  var result = str.match(regex);          //match方法可在字符串内检索指定的值，或找到一个或多个正则表达式的匹配。
  var count=!result ? 0 : result.length;
  return count;
}
/**
* 判断字符串是否是 Base64 编码
* @param {String} str 
*/
function isBase64(str : string) {
  return /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/.test(str);
}
/**
 * 检测字符串是否是一串数字
 * @param {String} val 
 */
function isNumber(val : string) {
  var regPos = /^\d+(\.\d+)?$/; //非负浮点数
  var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; //负浮点数
  if (regPos.test(val) || regNeg.test(val)) {
    return true;
  } else {
    return false;
  }
}
/**
 * 检查字符串是否是中国的11位手机号
 * @param str 字符串
 */
function isChinaPoneNumber(str : string) {
  var myreg=/^[1][3,4,5,7,8][0-9]{9}$/;
  if (!myreg.test(str)) {
      return false;
  } else {
      return true;
  }
}
/**
 * 检查字符串是否是邮箱
 * @param str 字符串
 */
function isEmail(str : string){
  var re=/^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
  if (re.test(str) !== true) {
    return false;
  }else{
    return true;
  }
}
/**
 * 将字符串转为16进制字符串
 * @param str 字符串
 */
function strToHexCharCode(str : string, with0x = true) : string {
  if(str === "")
    return "";
  var hexCharCode = [];
  if(with0x) hexCharCode.push("0x"); 
  for(var i = 0; i < str.length; i++) {
    hexCharCode.push((str.charCodeAt(i)).toString(16));
  }
  return hexCharCode.join("");
}
/**
 * 数字补0
 * @param num 数字
 * @param n 如果数字不足n位，则自动补0
 */
function pad(num : number, n : number) {
  var strNum = num.toString();
  var len = strNum.length;
  while (len < n) {
    strNum = "0" + strNum;
    len++;
  }
  return strNum;
}
/**
 * 按千位逗号分割
 * @param s 需要格式化的数值.
 * @param type 判断格式化后是否需要小数位.
 */
function formatNumberWithComma(s : string, addComma : boolean) {
  if (/[^0-9]/.test(s))
      return "0";
  if (s === null || s === "")
      return "0";
  s = s.toString().replace(/^(\d*)$/, "$1.");
  s = (s + "00").replace(/(\d*\.\d\d)\d*/, "$1");
  s = s.replace(".", ",");
  var re = /(\d)(\d{3},)/;
  while (re.test(s))
      s = s.replace(re, "$1,$2");
  s = s.replace(/,(\d\d)$/, ".$1");
  if (!addComma) { // 不带小数位(默认是有小数位)
      var a = s.split(".");
      if (a[1] === "00") {
          s = a[0];
      }
  }
  return s;
}
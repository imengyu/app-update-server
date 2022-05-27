import crypto from 'crypto';
import base64 from './base64';
 
/**
 * 加密方法
 * @param {string} key 加密key
 * @param {string} iv       向量
 * @param {string} data     需要加密的数据
 * @returns {string}
 */
function encrypt(key: string, iv: string, dataStr : string) {
  let cipherChunks = [];
  let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  cipher.setAutoPadding(true);
  cipherChunks.push(cipher.update(dataStr, 'utf8', 'base64'));
  cipherChunks.push(cipher.final('base64'));
  return cipherChunks.join('');
};
 
/**
 * 解密方法
 * @param {string} key      解密的key
 * @param {string} iv       向量
 * @param {string} crypted  密文
 * @returns {string}
 */
function decrypt(key: string, iv: string, cryptedStr: string) {
  let cipherChunks = [];
  let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  decipher.setAutoPadding(true);
  cipherChunks.push(decipher.update(cryptedStr, 'base64', 'utf8'));
  cipherChunks.push(decipher.final('utf8'));
  return cipherChunks.join('');
};

/**
 * Aes 加密解密
 */
export default {
  encrypt,
  decrypt
}
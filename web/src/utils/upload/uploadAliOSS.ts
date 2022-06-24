import OSS from 'ali-oss';
import UploadApi from '../../api/upload';

let aliOSSClient: OSS|null  = null;
let aliRegion = '';
let aliBucket = '';

/**
 * 获取阿里云 oss 对象下载路径
 * @param name 文件路径
 * @returns 
 */
export function getAliOSSUploadUrl(name: string) {
  return `https://${aliBucket}.${aliRegion}.aliyuncs.com/${name}`
}

/**
 * 获取阿里云 oss 上传类
 */
export async function getAliOSSClient() {
  if (aliOSSClient === null) {
    const result = await UploadApi.getAliOSSSTS();
    if (result && result.data) {
      aliRegion = result.data.Region;
      aliBucket = result.data.Bucket;
      aliOSSClient = new OSS({
        region: result.data.Region,
        accessKeyId: result.data.AccessKeyId,
        accessKeySecret: result.data.AccessKeySecret,
        stsToken: result.data.SecurityToken,
        bucket: result.data.Bucket,
        refreshSTSToken: async () => {
          const info = await UploadApi.getAliOSSSTS();
          return {
            accessKeyId: info.data?.AccessKeyId as string,
            accessKeySecret: info.data?.AccessKeySecret as string,
            stsToken: info.data?.SecurityToken as string
          }
        },
        refreshSTSTokenInterval: 300000,
      });
    }
  }
  return aliOSSClient;
}

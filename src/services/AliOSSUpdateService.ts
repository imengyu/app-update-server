import config from '../config';
import OSS, { STS } from 'ali-oss';
import { Request } from 'express';
import { BaseService, Service } from "../small/base/Service";

console.log(config);


/**
 * 阿里云 OSS 服务
 */
@Service
export class AliOSSUpdateService extends BaseService {

  client = new OSS({
    region: config.ALIYUN_OSS_REGION,
    accessKeyId: config.ALIYUN_OSS_ACCESS_KEY,
    accessKeySecret: config.ALIYUN_OSS_ACCESS_SECRET,
    bucket: config.ALIYUN_OSS_BUCKET,
  });

  /**
   * 阿里云OSS删除文件
   */
  public async deleteAliOSSUpdateFile(objectPath: string) {
    await this.client.delete(objectPath);         
  }

  /**
   * 通过阿里云STS（Security Token Service）进行临时授权访问
   * @param req 
   * @returns 
   */
  public getAliOSSUpdateSTS(req : Request) {
    return new Promise<AliOSSSTSResult>((resolve, reject) => {
      let sts = new STS({
        accessKeyId: config.ALIYUN_OSS_ACCESS_KEY,
        accessKeySecret: config.ALIYUN_OSS_ACCESS_SECRET,
      });
      sts.assumeRole(config.ALIYUN_OSS_ACCESS_ACS).then((result) => {
        resolve({
          AccessKeyId: result.credentials.AccessKeyId,
          AccessKeySecret: result.credentials.AccessKeySecret,
          SecurityToken: result.credentials.SecurityToken,
          Expiration: result.credentials.Expiration,
          Region: config.ALIYUN_OSS_REGION,
          Bucket: config.ALIYUN_OSS_BUCKET,
        });
      }).catch((err) => {
        reject(err);
      });
    });
  }
}

export interface AliOSSSTSResult {
  AccessKeyId: string,
  AccessKeySecret: string,
  SecurityToken: string,
  Expiration: string,
  Bucket: string,
  Region: string,
}

export default new AliOSSUpdateService();


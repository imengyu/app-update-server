import { getAxios } from '.';
import { commonRequest } from './common';
import { RestfulApi } from './restful';

export interface IAliOSSSTSResult {
  AccessKeyId: string;
  AccessKeySecret: string;
  SecurityToken: string;
  Expiration: string;
  Region: string;
  Bucket: string;
}

class UploadApi extends RestfulApi<{}> {

  getAliOSSSTS() {
    return commonRequest<IAliOSSSTSResult>(getAxios().post(`/update-ali-oss-sts`));
  }
  

}

export default new UploadApi('update');
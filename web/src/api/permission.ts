import { commonRequest } from './common';
import { getAxios } from './index'
import { RestfulApi } from './restful';

export interface IPermissionCheckInfo {
  grant: boolean;
}
export interface IPermissionInfo {
  id: number;
  key: string;
  name: string;
  explain: string;
}

class PermissionApi extends RestfulApi<IPermissionInfo> {
  checkUserPermission(permissionName : string) {
    return commonRequest<IPermissionCheckInfo>(getAxios().get(`/permission-check?name=${permissionName}`));
  }
}

export default new PermissionApi('permission');
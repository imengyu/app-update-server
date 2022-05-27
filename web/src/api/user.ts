import { commonRequest } from './common';
import { getAxios } from './index'
import { RestfulApi } from './restful'

export class User implements IUserInfo  {
  id = 0;
  user = '';
  name = '';
  group_id = -1;
  status = 1;
  sex = 0;
  phone = '';;
  moto = '';
  head = '';
  revoke_permissions = '';
  grant_permissions = '';
}
export interface IUserInfo {
  id: number;
  user: string;
  name: string;
  group_id: number;
  status: number;
  sex: number;
  phone: string;
  moto: string;
  head: string;
  revoke_permissions: string;
  grant_permissions: string;
}
export interface IUserUploadKeyResult {
  key: string;
}

class UserApi extends RestfulApi<IUserInfo> {

  getUserInfo() {
    return commonRequest<IUserInfo>(getAxios().get('/user-info'));
  }
  updateUserInfo(info: IUserInfo, id: number) {
    return commonRequest<IUserInfo>(getAxios().post(`/user-info?id=${id}`, info));
  }
  updateUserPass(id: number, pass: string) {
    return commonRequest<IUserInfo>(getAxios().post(`/user-force-repass?id=${id}&pass=${pass}`));
  }
  updateUsersGroup(group_id: number, user_ids: string) {
    return commonRequest<IUserInfo>(getAxios()
      .post(`/users-set-group?group_id=${group_id}&user_ids=${user_ids}`));
  }
  banUser(id: number) {
    return commonRequest<IUserInfo>(getAxios().post(`/user-ban?id=${id}`));
  }
  withdrawUser(id: number) {
    return commonRequest<IUserInfo>(getAxios().post(`/user-withdraw?id=${id}`));
  }
  getUserUploadKey() {
    return commonRequest<IUserUploadKeyResult>(getAxios().get('/user-upload-key'));
  }
}

export default new UserApi('user');
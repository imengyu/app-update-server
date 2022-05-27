import { RestfulApi } from './restful';

export interface IGroupInfo {
  id: number;
  name: string;
  accessable_app: string;
  non_accessable_app: string;
  belone_app_id: number|null;
  permissions: string;
}

class GroupApi extends RestfulApi<IGroupInfo> {
}

export default new GroupApi('group');
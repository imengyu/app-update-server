import { RestfulApi } from './restful';

export interface IUpdateInfo {
  id: number;
  date: string;
  status: 'enabled'|'disabled';
  app_id: number;
  post_user_id: number;
  post_note: string;
  post_channels: string;
  post_version_code_mask: string;
  post_version_name_mask: string;
  version_name: string;
  version_code: string;
  update_package_url: string;
  update_hot_update_url: string;
}

class UpdateApi extends RestfulApi<IUpdateInfo> {
}

export default new UpdateApi('update');
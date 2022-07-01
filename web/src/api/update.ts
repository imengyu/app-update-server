import { getAxios } from '.';
import { commonRequest } from './common';
import { RestfulApi } from './restful';

export interface IUpdateInfo {
  id: number;
  date: string;
  status: 'enabled'|'disabled'|'archived';
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

/**
 * 归档返回结构
 */
export interface IArchiveUpdateResult {
  storage_id: number;
}

class UpdateApi extends RestfulApi<IUpdateInfo> {
  /**
   * 更新资源
   * @param id 资源ID
   * @param data 资源数据
   */
  public archive(id: number) {
    return commonRequest<IArchiveUpdateResult>(getAxios().post(`/${this.subResKey}/archive`, {
      id
    }));
  }
}

export default new UpdateApi('update');
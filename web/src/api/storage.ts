import { RestfulApi } from './restful';

export interface IStorageInfo {
  id: number;
  date: string;
  abs_path: string;
  local_path: string; //本地存储路径
  using_status: number; //0 未使用 1 使用
  third_storage_path: string;
  upload_user_id: number;
  delete_user_id: number;
}

class StorageApi extends RestfulApi<IStorageInfo> {
}

export default new StorageApi('storage');
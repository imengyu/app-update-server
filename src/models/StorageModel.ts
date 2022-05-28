export class Storage {
  id: number;
  date: string; //上传时间
  abs_path: string;
  local_path: string; //本地存储路径
  using_status: number; //0 未使用 1 使用
  third_storage_path: string;
  upload_user_id: number;
  delete_user_id: number;
}
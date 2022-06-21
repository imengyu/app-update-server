import fs from 'fs';
import { Storage } from '../models/StorageModel';
import { RestService } from "../small/base/RestService";
import { Service } from "../small/base/Service";
import logger from '../utils/logger';
import StringUtils from '../utils/string';

/**
 * 子系统相关服务
 */
@Service
export class StorageService extends RestService<Storage> {
  public constructor() {
    super('storage', 'name');

    this.selectSolve = (req, query) => {
      //query.enableLog();
      query.disableAutoSelectCondition();
      query.selectRaw('SELECT storage.*,`update`.version_name,`update`.app_id,`update`.version_code,app.name,user1.name as upload_user_name,user2.name as delete_user_name FROM storage ' 
      + 'LEFT JOIN `update` ON storage.using_status = `update`.id '
      + 'LEFT JOIN app ON `update`.app_id = app.id '
      + 'LEFT JOIN user AS user1 ON storage.upload_user_id = user1.id '
      + 'LEFT JOIN user AS user2 ON storage.delete_user_id = user2.id ');
      return query;
    }
    //删除本地文件
    this.beforeDelete = (req, id, data) => {
      if (StringUtils.isNullOrEmpty(data.local_path)) {
        fs.access(data.local_path, (err) => {
          if (err === null) {
            fs.rm(data.local_path, (err) => {
              if (err)
                logger.error('StorageService', `Failed to delete file ${data.local_path} (StorageId: ${id})`);
            });
          }
        });
      }
    };
  }
}

export default new StorageService();


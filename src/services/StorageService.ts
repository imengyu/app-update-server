import fs from 'fs';
import { Storage } from '../models/StorageModel';
import { Autowired } from '../small/base/Autowired';
import { RestService } from "../small/base/RestService";
import { Service } from "../small/base/Service";
import logger from '../utils/logger';
import StringUtils from '../utils/string';
import { AliOSSUpdateService } from './AliOSSUpdateService';

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
    //删除存储文件
    this.beforeDelete = (req, id, data) => {
      if (!StringUtils.isNullOrEmpty(data.local_path)) {
        fs.access(data.local_path, (err) => {
          if (err === null) {
            fs.rm(data.local_path, (err) => {
              if (err)
                logger.error('StorageService', `Failed to delete file ${data.local_path} (StorageId: ${id})`);
            });
          }
        });
      }
      if (!StringUtils.isNullOrEmpty(data.third_storage_path)) {
        const path = data.third_storage_path;
        //ali-oss
        if (path.startsWith('ali-oss:')) {
          this.AliOSSUpdateService.deleteAliOSSUpdateFile(path.substring(8));
        }
      }
    };
  }

  
  @Autowired('Service')
  private AliOSSUpdateService : AliOSSUpdateService;

}

export default new StorageService();


import { AuthService } from './AuthService';
import config from '../config/index';
import { UserService } from './UserService';
import { PromiseResponseRejectInfo } from './../small/utils/http-response';
import { Request } from 'express';
import { Update } from '../models/UpdateModel';
import { RestService } from "../small/base/RestService";
import { Service } from "../small/base/Service";
import { ResposeCode } from '../small/utils/http-response';
import { Autowired } from '../small/base/Autowired';
import { DB } from '../small/database/DB';
import StringUtils from '../utils/string';

/**
 * 子系统相关服务
 */
@Service
export class UpdateService extends RestService<Update> {
  public constructor() {
    super('update', 'version_name');

    this.afterInsert = this.afterInsertOrUpdate.bind(this);
    this.afterUpdate = this.afterInsertOrUpdate.bind(this);
    this.beforeDelete = this.solveBeforeDelete.bind(this);
  }

  private afterInsertOrUpdate(req: Request, id: number, data: Update) {
    if (data.update_package_url) {
      //设置引用状态
      DB.table('storage').where('abs_path', data.update_package_url).update({
        using_status: id,
      });
    }
    //TODO: 清除缓存
  }
  private solveBeforeDelete(req: Request, id: number, data: Update) {
    if (data.update_package_url) {
      this.AuthService.fastGetCurrentAuthUserId(req).then((userId) => {
        //设置引用状态
        DB.table('storage').where('abs_path', data.update_package_url).update({
          using_status: 0,
          date: new Date().format(),
          delete_user_id: userId,
        });
      });
    }
    //TODO: 清除缓存
  }

  @Autowired('Service')
  private UserService : UserService;
  @Autowired('Service')
  private AuthService : AuthService;


  /**
   * 上传更新二进制文件
   * @param req 
   * @returns 
   */
  public uploadUpdateFile(req : Request) {
    return new Promise<{
      path: string,
    }>((resolve, reject) => {

      if(!req.file) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }

      this.UserService.uploadKeyToUserId(req).then((userId) => {        
        const relative_path = '/uploads/dists/' + req.file.filename + '.' + StringUtils.getFileExt(req.file.originalname); //绝对路径
        let targetPath = config.PUBLIC_URL + relative_path; //绝对路径

        //存储库数据存储
        DB.table('storage').insert({
          date: new Date().format(),
          abs_path: targetPath,
          local_path: process.cwd() + relative_path, //本地路径
          using_status: 0,
          third_storage_path: null,
          upload_user_id: userId,
          delete_user_id: null,
        });

        resolve({
          path: targetPath,
        });
      }).catch(reject);
    });
  }
}

export default new UpdateService();


import { App } from './../models/AppModel';
import { RestService } from "../small/base/RestService";
import { Service } from "../small/base/Service";
import { redisClient } from '../app';

/**
 * 子系统相关服务
 */
@Service
export class AppService extends RestService<App> {
  public constructor() {
    super('app', 'name');

    //更新或者删除时，需要清除缓存
    this.afterUpdate = (req, id, data) => {  redisClient.expire('check.app.' + data.package_name, 0); }
    this.beforeDelete = (req, id, data) => {  redisClient.expire('check.app.' + data.package_name, 0); }
  }
}

export default new AppService();


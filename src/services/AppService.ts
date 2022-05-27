import { App } from './../models/AppModel';
import { RestService } from "../small/base/RestService";
import { Service } from "../small/base/Service";

/**
 * 子系统相关服务
 */
@Service
export class AppService extends RestService<App> {
  public constructor() {
    super('app', 'name');
  }
}

export default new AppService();


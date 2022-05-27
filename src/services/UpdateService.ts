import { Update } from '../models/UpdateModel';
import { RestService } from "../small/base/RestService";
import { Service } from "../small/base/Service";

/**
 * 子系统相关服务
 */
@Service
export class UpdateService extends RestService<Update> {
  public constructor() {
    super('update', 'version_name');
  }
}

export default new UpdateService();


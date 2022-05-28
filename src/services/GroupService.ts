import { Group } from "../models/GroupModel";
import { RestService } from "../small/base/RestService";
import { Service } from "../small/base/Service";

/**
 * 子系统相关服务
 */
@Service
export class GroupService extends RestService<Group> {
  public constructor() {
    super('group', 'name');
    this.selectSolve = (req, query) => query.selectRaw('(select count(`user`.id) from `user` where `group`.`id`=`user`.group_id) user_count')
  }
}

export default new GroupService();


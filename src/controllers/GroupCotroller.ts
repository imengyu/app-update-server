import { Group } from './../models/GroupModel';
import { Express } from 'express'
import { Controller } from '../small/base/Controller';
import { Autowired } from '../small/base/Autowired';
import { PermissionService } from '../services/PermissionService';
import { RestCotroller } from '../small/base/RestController';
import { GroupService } from '../services/GroupService';

@Controller
export class GroupCotroller extends RestCotroller<Group> {

  @Autowired('Service')
  private GroupService : GroupService;
  @Autowired('Service')
  private PermissionService : PermissionService;

  public constructor() {
    super('group', () => this.GroupService);
    this.getCheckPromise = (type, req, res) => 
      (type === 'get' ||  type === 'getPage') ? null : 
      this.PermissionService.checkUserPermission(req, [ 'manage-group' ]);
  }
  bindAll(app : Express) {
    super.bindAll(app);
  }
}

export default new GroupCotroller();

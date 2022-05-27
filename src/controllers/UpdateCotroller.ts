import { Update } from './../models/UpdateModel';
import { UpdateService } from '../services/UpdateService';
import { Express } from 'express'
import { Controller } from '../small/base/Controller';
import { Autowired } from '../small/base/Autowired';
import { PermissionService } from '../services/PermissionService';
import { RestCotroller } from '../small/base/RestController';

@Controller
export class UpdateCotroller extends RestCotroller<Update> {

  @Autowired('Service')
  private UpdateService : UpdateService;
  @Autowired('Service')
  private PermissionService : PermissionService;

  public constructor() {
    super('update', () => this.UpdateService);
    this.getCheckPromise = (type, req, res) => {
      if (type === 'get' ||  type === 'getPage') 
        return null;
      if (type === 'delete') 
        return this.PermissionService.checkUserPermission(req, [ 'manage-update' ]);
      if (type === 'add' || type === 'update') 
        return this.PermissionService.checkUserPermission(req, [ 'post-update' ]);
    }
  }
  bindAll(app : Express) {
    super.bindAll(app);
  }
}

export default new UpdateCotroller();

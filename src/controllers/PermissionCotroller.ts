import { Express } from 'express'
import { Controller } from '../small/base/Controller';
import { PermissionService } from '../services/PermissionService';
import { Autowired } from '../small/base/Autowired';
import { RestCotroller } from '../small/base/RestController';
import { IPermissionCheckInfo, Permission } from '../models/PermissionModel';

@Controller
export class PermissionCotroller extends RestCotroller<Permission> {

  @Autowired('Service')
  private PermissionService : PermissionService;

  public constructor() {
    super('permission', () => this.PermissionService);
  }

  bindAll(app : Express) {
    super.bindAll(app);

    app.get('/permission-check', (req, res) => this.commonResponse(req, res, 
      () => new Promise<IPermissionCheckInfo>((resolve) => {
        this.PermissionService.checkUserPermission(req, [ req.query.name as string ])
          .then(() => resolve({ grant: true }))
          .catch(() => resolve({ grant: false }));
      }), null, 
      { body: false, query: [ 'name' ] },
      { grant: false } as IPermissionCheckInfo));
  }
}

export default new PermissionCotroller();

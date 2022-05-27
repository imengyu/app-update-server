import { AppService } from './../services/AppService';
import { App } from './../models/AppModel';
import { Express } from 'express'
import { Controller } from '../small/base/Controller';
import { Autowired } from '../small/base/Autowired';
import { PermissionService } from '../services/PermissionService';
import { RestCotroller } from '../small/base/RestController';

@Controller
export class AppCotroller extends RestCotroller<App> {

  @Autowired('Service')
  private AppService : AppService;
  @Autowired('Service')
  private PermissionService : PermissionService;

  public constructor() {
    super('app', () => this.AppService);
    this.getCheckPromise = (type, req, res) => 
      (type === 'get' ||  type === 'getPage') ? null : 
      this.PermissionService.checkUserPermission(req, [ 'manage-app' ]);
  }
  bindAll(app : Express) {
    super.bindAll(app);
  }
}

export default new AppCotroller();

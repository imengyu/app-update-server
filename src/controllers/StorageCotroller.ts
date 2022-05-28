import { Storage } from './../models/StorageModel';
import { StorageService } from '../services/StorageService';
import { Express } from 'express'
import { Controller } from '../small/base/Controller';
import { Autowired } from '../small/base/Autowired';
import { PermissionService } from '../services/PermissionService';
import { RestCotroller } from '../small/base/RestController';

@Controller
export class StorageCotroller extends RestCotroller<Storage> {

  @Autowired('Service')
  private StorageService : StorageService;
  @Autowired('Service')
  private PermissionService : PermissionService;

  public constructor() {
    super('storage', () => this.StorageService);
    this.getCheckPromise = (type, req, res) => 
      (type === 'get' ||  type === 'getPage') ? null : 
      this.PermissionService.checkUserPermission(req, [ 'manage-storage' ]);
  }
  bindAll(app : Express) {
    super.bindAll(app);
  }
}

export default new StorageCotroller();

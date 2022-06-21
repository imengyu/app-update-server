import { Express } from 'express'
import { uploadUserHead } from '../app';
import { User } from '../models/UserModel';
import { PermissionService } from '../services/PermissionService';
import { UserService } from '../services/UserService';
import { Autowired } from '../small/base/Autowired';
import { Controller } from '../small/base/Controller';
import { RestCotroller } from '../small/base/RestController';

@Controller
export class UserCotroller extends RestCotroller<User> {

  @Autowired('Service')
  private UserService : UserService;
  @Autowired('Service')
  private PermissionService : PermissionService;

  public constructor() {
    super('user', () => this.UserService);
    this.getCheckPromise = (type, req, res) => this.PermissionService.checkUserPermission(req, [ 'manage-users' ]);
  }

  bindAll(app : Express) {
    super.bindAll(app);
    app.get('/user-info', (req, res) => this.commonResponse(req, res, () => this.UserService.getUserInfo(req)));
    app.post('/user-info', (req, res) => this.commonResponse(req, res, () => this.UserService.updateUserInfo(req)));
    app.post('/user-head', uploadUserHead.single('avatar'), (req, res) => this.commonResponse(req, res, () => this.UserService.uploadUserHead(req)));
    app.post('/user-ban', (req, res) => this.commonResponse(req, res, 
      () => this.UserService.banUser(parseInt(req.query.id as string)), 
      this.PermissionService.checkUserPermission(req, [ 'manage-users' ]), 
      { body: false, query: [ 'id' ] }));
    app.post('/user-withdraw', (req, res) => this.commonResponse(req, res, 
      () => this.UserService.withdrawUser(parseInt(req.query.id as string)), 
      this.PermissionService.checkUserPermission(req, [ 'manage-users' ]), 
      { body: false, query: [ 'id' ] }));
    app.post('/user-force-repass', (req, res) => this.commonResponse(req, res, 
      () => this.UserService.forceSetUserPass(parseInt(req.query.id as string), req.query.pass as string), 
      this.PermissionService.checkUserPermission(req, [ 'manage-users' ]), 
      { body: false, query: [ 'id', 'pass' ] }));
    app.post('/users-set-group', (req, res) => this.commonResponse(req, res, 
      () => this.UserService.setUsersGroup(parseInt(req.query.group_id as string), req.query.user_ids as string), 
      this.PermissionService.checkUserPermission(req, [ 'manage-users' ]), 
      { body: false, query: [ 'group_id', 'user_ids' ] }));
    app.get('/user-upload-key', (req, res) => this.commonResponse(req, res, () => this.UserService.genUploadKey(req)));
  }
}

export default new UserCotroller();

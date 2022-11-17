import { Update } from './../models/UpdateModel';
import { UpdateService } from '../services/UpdateService';
import { Express } from 'express'
import { Controller } from '../small/base/Controller';
import { Autowired } from '../small/base/Autowired';
import { PermissionService } from '../services/PermissionService';
import { RestCotroller } from '../small/base/RestController';
import { uploadFiles } from '../app';
import { AliOSSUpdateService } from '../services/AliOSSUpdateService';

@Controller
export class UpdateCotroller extends RestCotroller<Update> {

  @Autowired('Service')
  private UpdateService : UpdateService;
  @Autowired('Service')
  private AliOSSUpdateService : AliOSSUpdateService;
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
    app.post('/update-file-post', uploadFiles.single('file'), (req, res) => 
      this.commonResponse(req, res, () => this.UpdateService.uploadUpdateFile(req), 
        this.PermissionService.checkUserPermission(req, [ 'post-update' ]))
    );
    app.post('/update-ali-oss-sts', (req, res) => 
      this.commonResponse(req, res, () => this.AliOSSUpdateService.getAliOSSUpdateSTS(req), 
        this.PermissionService.checkUserPermission(req, [ 'post-update' ]))
    );
    app.get('/update-check', (req, res) => 
      this.commonResponse(req, res, () => this.UpdateService.updateCheckCore(req))
    );
    app.get('/dl', (req, res) => {
      this.UpdateService.updateDownload(req, res);
    });
    app.post(`/${this.subName}/archive`, (req, res) => {
      this.commonResponse(
        req,
        res,
        () => this.UpdateService.archive(req),
        this.getCheckPromise('get', req, res)
      )
    });
    super.bindAll(app);
  }
}

export default new UpdateCotroller();

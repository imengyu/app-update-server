import { Express, Request, Response } from 'express'
import { IAuthStatus } from '../models/AuthModel';
import { AuthService } from '../services/AuthService';
import common from '../utils/common';
import cryptAes from '../utils/cryptAes';
import config from '../config';
import md5 from 'md5';
import { BaseController, Controller } from '../small/base/Controller';
import { Autowired } from '../small/base/Autowired';
import logger from '../utils/logger';

@Controller
export class AuthController extends BaseController {

  public constructor() {
    super();
  }

  @Autowired('Service')
  private AuthService : AuthService;

  bindAll(app : Express) {
    app.get('/auth', this.getAuthStatus.bind(this));
    app.get('/auth/qr', this.getQrAuthKey.bind(this));
    app.post('/auth/qr', this.doQrAuth.bind(this));
    app.post('/auth/qr-scan', this.doQrScanNotify.bind(this));
    app.post('/auth', this.doAuth.bind(this));
    app.delete('/auth', this.doEndAuth.bind(this));
    app.get('/auth/test', (req : Request, res: Response) => {
      if(common.isNullOrEmpty(req.query.user) || common.isNullOrEmpty(req.query.pass) || common.isNullOrEmpty(req.query.id)) {
        common.sendFailed(res);
        return;
      }
      let p = cryptAes.encrypt(config.AUTH_KEY, config.AUTH_IV, `${req.query.user}@${md5(''+req.query.pass)}@${req.query.id}@${config.AUTH_IV}`);
      common.sendSuccess(res, {
        p: p,
        d: cryptAes.decrypt(config.AUTH_KEY, config.AUTH_IV, p)
      });
    });
  }

  getAuthStatus(req : Request, res: Response) {
    this.commonResponse(req, res, this.AuthService.checkUserAuthed(req), null, null, {
      authStatus: false,
      expireAt: null
    } as IAuthStatus);
  }
  doAuth(req : Request, res: Response) { this.commonResponse(req, res, this.AuthService.doAuth(req)) }
  doQrAuth(req : Request, res: Response) { this.commonResponse(req, res, this.AuthService.doQrAuth(req)) }
  doQrScanNotify(req : Request, res: Response) { this.commonResponse(req, res, this.AuthService.doQrScanNotify(req)) }
  doEndAuth(req : Request, res: Response) { this.commonResponse(req, res, this.AuthService.doEndAuth(req)) }
  getQrAuthKey(req : Request, res: Response) { this.commonResponse(req, res, this.AuthService.getQrAuthKey(req)) }
}


export default new AuthController();
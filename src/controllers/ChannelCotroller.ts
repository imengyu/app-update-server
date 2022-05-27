import { Channel } from './../models/ChannelModel';
import { ChannelService } from '../services/ChannelService';
import { Express } from 'express'
import { Controller } from '../small/base/Controller';
import { Autowired } from '../small/base/Autowired';
import { PermissionService } from '../services/PermissionService';
import { RestCotroller } from '../small/base/RestController';

@Controller
export class ChannelCotroller extends RestCotroller<Channel> {

  @Autowired('Service')
  private ChannelService : ChannelService;
  @Autowired('Service')
  private PermissionService : PermissionService;

  public constructor() {
    super('channel', () => this.ChannelService);
    this.getCheckPromise = (type, req, res) => 
      (type === 'get' ||  type === 'getPage') ? null : 
      this.PermissionService.checkUserPermission(req, [ 'manage-channel' ]);
  }
  bindAll(app : Express) {
    super.bindAll(app);
  }
}

export default new ChannelCotroller();

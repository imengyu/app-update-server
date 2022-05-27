import { Channel } from '../models/ChannelModel';
import { RestService } from "../small/base/RestService";
import { Service } from "../small/base/Service";

/**
 * 子系统相关服务
 */
@Service
export class ChannelService extends RestService<Channel> {
  public constructor() {
    super('channel', 'name');
  }
}

export default new ChannelService();


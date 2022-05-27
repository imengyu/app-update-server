import { RestfulApi } from './restful';

export interface IChannelInfo {
  id: number;
  name: string;
  code: string;
  status: 'enabled'|'disabled';
}

class ChannelApi extends RestfulApi<IChannelInfo> {
}

export default new ChannelApi('channel');
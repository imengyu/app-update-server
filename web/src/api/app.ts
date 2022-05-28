import { RestfulApi } from './restful';

export interface IAppInfo {
  id: number;
  name: string;
  package_name: string;
  status: 'enabled'|'disabled';
}

class AppApi extends RestfulApi<IAppInfo> {
}

export default new AppApi('app');
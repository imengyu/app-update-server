import { RestfulApi } from './restful';

export interface IAppInfo {
  id: number;
  name: string;
  package_name: string;
}

class AppApi extends RestfulApi<IAppInfo> {
}

export default new AppApi('app');
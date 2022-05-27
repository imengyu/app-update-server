import { OnceAuth } from "../models/OnceAuthModel";
import { SqlQuery } from '../small/database/QueryAnnotation';
import { Mapping } from "../small/base/Mapping";

@Mapping
export class OnceAuthMapping {

  @SqlQuery('SELECT * FROM `once_auth` WHERE `key`=\'{0}\'')
  getByKey(key : string) : Promise<OnceAuth[]> { return null; }

  @SqlQuery('UPDATE `once_auth` SET `use_count`={0} WHERE \`key\`=\'{1}\'')
  setUseCountByKey(useCount: number, key : string) : Promise<OnceAuth[]> { return null; }
} 

export default new OnceAuthMapping();
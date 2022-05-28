import { User } from "../models/UserModel";
import { Mapping } from "../small/base/Mapping";
import { SqlQuery } from '../small/database/QueryAnnotation';

@Mapping
export class StorageMapping {
  
  @SqlQuery('UPDATE `storage` SET `using_status`=\'{1}\' WHERE `id`={0}')
  updateStorageUsing(id : number, using_status : number) : Promise<number> { return null; }
} 

export default new StorageMapping();
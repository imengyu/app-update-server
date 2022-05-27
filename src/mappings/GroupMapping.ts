import { Group } from "../models/GroupModel";
import { SqlQuery } from '../small/database/QueryAnnotation';
import { Mapping } from "../small/base/Mapping";

@Mapping
export class GroupMapping {

  @SqlQuery('SELECT `name`,`id`,`accessable_app`,`non_accessable_app`,`belone_app_id`,`permissions` FROM `group` WHERE `id`={0}', 'single_data')
  getGroupById(id : number) : Promise<Group> { return null; }
} 

export default new GroupMapping();
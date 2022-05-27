import { User } from "../models/UserModel";
import { Mapping } from "../small/base/Mapping";
import { SqlQuery } from '../small/database/QueryAnnotation';

@Mapping
export class UserMapping {
  @SqlQuery('SELECT `passwd`,`id`,`group_id`,`user`,`status` FROM `user` WHERE `user`=\'{0}\'', 'single_data')
  getUserByUserName(name : string) : Promise<User> { return null; }
  @SqlQuery('SELECT `passwd`,`id`,`group_id`,`user`,`status`,`grant_permissions`,`revoke_permissions` FROM `user` WHERE `id`={0}', 'single_data')
  getUserByUserId(id : number) : Promise<User> { return null; }
  @SqlQuery('SELECT `id`,`user`,`status`,`group_id`,`name`,`sex`,`phone`,`moto`,`head` FROM `user` WHERE `id`={0}', 'single_data')
  getUserInfoByUserId(id : number) : Promise<User> { return null; }
  @SqlQuery('SELECT `name`,`id` FROM `user` WHERE `id`={0}', 'single_data')
  getUserNameByUserId(id : number) : Promise<User> { return null; }

  @SqlQuery('UPDATE `user` SET `sex`={1},`phone`=\'{2}\',`moto`=\'{3}\',`name`=\'{4}\' WHERE `id`={0}')
  updateUserInfoByUserId(id : number, sex : number, phone : string, moto : string, name : string) : Promise<number> { return null; }
  @SqlQuery('UPDATE `user` SET `head`=\'{1}\' WHERE `id`={0}')
  updateUserHeadByUserId(id : number, head : string) : Promise<number> { return null; }
  @SqlQuery('UPDATE `user` SET `status`={1} WHERE `id`={0}')
  updateStatusByUserId(id : number, status : number) : Promise<number> { return null; }
  @SqlQuery('UPDATE `user` SET `passwd`=\'{1}\' WHERE `id`={0}')
  updatePasswdByUserId(id : number, pass : string) : Promise<number> { return null; }
} 

export default new UserMapping();
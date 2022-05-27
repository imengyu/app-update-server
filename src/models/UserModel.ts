export interface IUserInfo {
  id: number,
  name: string,
  group_id: number,
  sex: number,
  phone: string,
  moto: string,
  head : string;
}
export class User {
  id : number;
  user : string;
  name : string;
  passwd : string;
  group_id : number;
  sex : number;
  phone : string;
  moto : string;
  status : number;
  head : string;
  revoke_permissions : string;
  grant_permissions : string;
}
export let UserStatus = {
  NORMAL: 1,
  BANNED: 2,
  DESTROYED: 0,
}

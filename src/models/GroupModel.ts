export class Group {
  id : number;
  name : string;
  accessable_app : string;
  non_accessable_app : string;
  belone_app_id : number;
  permissions : string;
}
export class GroupDataSolved {
  id : number;
  name : string;
  accessable_app: number[];
  non_accessable_app: number[];
  belone_app_id: number;
  permissions: string[];

  public constructor(g : Group) {
    this.id = g.id;
    this.name = g.name;
    this.accessable_app = [];
    this.non_accessable_app = [];
    this.belone_app_id = g.belone_app_id;
    this.permissions = [];

    if (g.accessable_app)
      g.accessable_app.split(';').forEach((v) => this.accessable_app.push(parseInt(v)));
    if (g.non_accessable_app)
      g.non_accessable_app.split(';').forEach((v) => this.non_accessable_app.push(parseInt(v)));
    if (g.permissions)
      g.permissions.split(';').forEach((v) => this.permissions.push(v));
  }
}
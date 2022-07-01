export class Update {
  id: number;
  date: string;
  status: 'enabled'|'disabled'|'archived';
  app_id: number;
  post_user_id: number;
  post_note: string;
  post_channels: string;
  post_version_code_mask: string;
  post_version_name_mask: string;
  version_name: string;
  version_code: string;
  update_package_url: string;
  update_hot_update_url: string;
}

/**
 * 更新检查信息返回结构
 */
 export interface IUpdateResult {
  hasUpdate: boolean;
  newVersionName?: string,
  newVersionCode?: number,
  newVersionNote?: string,
  downloadUrl?: string,
}

/**
 * 归档返回结构
 */
export interface IArchiveUpdateResult {
  storage_id: number,
}
/**
 * 更新条件结构
 */
export interface IUpdateRule {
  type: "rule"|"group",
  op: "and"|"or",
  enabled: boolean,
  param: "version_code"|"version_name"|"last_update_time"|"has_param",
  paramName: string,
  operator: IUpdateRuleOperator,
  value: number,
  children?: IUpdateRule[],
}
export type IUpdateRuleOperator = "greaterThan"|"greaterThanOrEqual"|"equal"|"lessThan"|"lessThanOrEqual"|"regrex";
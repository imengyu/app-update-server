import { Request } from "express";
import { redisClient } from "../app";
import { IAuthStruct, IAuthStorageInfo } from "../models/AuthModel";
import { Permission } from "../models/PermissionModel";
import { RestService } from "../small/base/RestService";
import { BaseService, Service } from "../small/base/Service";
import { PromiseResponseRejectInfo, ResposeCode } from "../small/utils/http-response";
import common from "../utils/common";

/**
 * 权限检查服务
 */
@Service
export class PermissionService extends RestService<Permission> {

  public constructor() {
    super('permissions');
  }

  /**
   * 检查用户权限
   * @param req 当前请求
   * @param requirePermissionId 需要的权限ID
   * @param requireGroupId 需要的组ID
   * @returns 
   */
  public checkUserPermission(req : Request, requirePermissionNames : string[], requireGroupName = '') {
    return new Promise<void>((resolve, reject) => {
      const authStructStr = req.headers.authorization;
      if(common.isNullOrEmpty(authStructStr)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }
      const authStruct = JSON.parse(authStructStr) as IAuthStruct;
      if(common.isNullOrEmpty(authStruct.auth)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }
      redisClient.get(authStruct.auth, (err, v) => {
        if(common.isNullOrEmpty(v)) {
          reject({ errCode: ResposeCode.AUTH_REQUIRED } as PromiseResponseRejectInfo);
          return;
        }
  
        let authStorageStruct = JSON.parse(v) as IAuthStorageInfo;
  
        //验证组
        if(!common.isNullOrEmpty(requireGroupName) && requireGroupName != authStorageStruct.userGroup.name) {
          reject({ errCode: ResposeCode.AUTH_USER_GROUP_MISMATCH } as PromiseResponseRejectInfo);
          return;
        }
  
        //验证权限
        if(authStorageStruct.permissions.contains('all')) {//如果有全部权限
          let revokePermissions = authStorageStruct.revokePermissions;
          if(revokePermissions.length > 0)
            for(let i = 0; i < requirePermissionNames.length; i++) {  
              if(revokePermissions.contains(requirePermissionNames[i])) {//判断是否有撤销权限
                reject({ errCode: ResposeCode.AUTH_USER_NO_PERMISSION } as PromiseResponseRejectInfo);
                return;
              }
            }
        } else {//判断是否有权限
          for(let i = 0; i < requirePermissionNames.length; i++) {  
            if(!authStorageStruct.permissions.contains(requirePermissionNames[i])) {
              reject({ errCode: ResposeCode.AUTH_USER_NO_PERMISSION } as PromiseResponseRejectInfo);
              return;
            }
          }
        }
  
        resolve();
      });
    }); 
  }
}

export default new PermissionService();


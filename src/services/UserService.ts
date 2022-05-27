import { Request } from "express";
import { PromiseResponseRejectInfo, ResposeCode } from "../small/utils/http-response";
import { IUserInfo, User, UserStatus } from "../models/UserModel";
import { UserMapping } from "../mappings/UserMapping";
import { AuthService } from "./AuthService";
import common from "../utils/common";
import logger from "../utils/logger";
import { redisClient } from "../app";
import { Service } from "../small/base/Service";
import { Autowired } from "../small/base/Autowired";
import { RestService } from "../small/base/RestService";
import { DB } from "../small/database/DB";

@Service
export class UserService extends RestService<User> {

  public constructor() {
    super('user', 'name');
    this.selectableFields = [ 'id', 'user', 'group_id', 'name', 'status', 'grant_permissions', 'revoke_permissions', 'head' ];
    this.updateableFields = [ 'name', 'group_id', 'status', 'grant_permissions', 'revoke_permissions' ];
  }

  @Autowired('Mapping')
  private UserMapping : UserMapping;
  @Autowired('Service')
  private AuthService : AuthService;

  /**
   * 强制更改用户密码
   * @param id 
   */
  public forceSetUserPass(id : number, passStr : string) {
    return new Promise<void>((resolve, reject) => {
      this.UserMapping.getUserNameByUserId(id).then((user) => {
        let encryptedPass = this.AuthService.genUserPass(passStr, id, user.name);
        this.UserMapping.updatePasswdByUserId(id, encryptedPass).then(() => {
          this.AuthService.forceEndAuthUser(id);
          resolve();
        }).catch((e) => reject({ errCode: ResposeCode.DATA_BASE_ERROR, message: e } as PromiseResponseRejectInfo));
      }).catch(() => reject({ errCode: ResposeCode.AUTH_NOT_FOUND_USER } as PromiseResponseRejectInfo));
    });
  }
  /**
   * 设置多个用户的组
   * @param group_id 组id
   * @param user_ids id;id;id 这个格式
   */
  public setUsersGroup(group_id : number, user_ids : string) {
    return new Promise<void>((resolve, reject) => {
      DB.table('user').whereIn('id', user_ids.split(';')).update({
        group_id: group_id
      }).then(() => 
        resolve()
      ).catch((e) => reject({ errCode: ResposeCode.DATA_BASE_ERROR, message: e } as PromiseResponseRejectInfo));
    });
  }
  /**
   * 注销用户
   * @param id 
   */
  public withdrawUser(id : number) {
    return new Promise<void>((resolve, reject) => {
      this.UserMapping.updateStatusByUserId(id, UserStatus.DESTROYED).then(() => {
        this.AuthService.forceEndAuthUser(id);
        resolve();
      }).catch(() => reject({ errCode: ResposeCode.AUTH_NOT_FOUND_USER } as PromiseResponseRejectInfo));
    });
  }
  /**
   * 封禁用户
   * @param id 
   */
  public banUser(id : number) {
    return new Promise<void>((resolve, reject) => {
      this.UserMapping.updateStatusByUserId(id, UserStatus.BANNED).then(() => {
        this.AuthService.forceEndAuthUser(id);
        resolve();
      }).catch(() => reject({ errCode: ResposeCode.AUTH_NOT_FOUND_USER } as PromiseResponseRejectInfo));
    });
  }
  /**
   * 获取当前用户信息
   * @param req 请求
   * @returns 
   */
  public getUserInfo(req : Request) {
    return new Promise<IUserInfo>((resolve, reject) => {
      this.AuthService.fastGetCurrentAuthUserId(req).then((userId) => {//获取当前登录用户ID
        this.UserMapping.getUserInfoByUserId(userId).then((user) => {
          if(user) {
            resolve({
              id: user.id,
              name: user.name,
              group_id: user.group_id,
              sex: user.sex,
              phone: user.phone,
              moto: user.moto,
              head: user.head,
            });
          } else reject({ errCode: ResposeCode.AUTH_NOT_FOUND_USER } as PromiseResponseRejectInfo);
        }).catch(() => reject({ errCode: ResposeCode.AUTH_NOT_FOUND_USER } as PromiseResponseRejectInfo));
      }).catch((e) => reject(e));
    });
  }
  /**
   * 更新用户信息
   * @param req 
   * @returns 
   */
  public updateUserInfo(req : Request) {
    return new Promise<void>((resolve, reject) => {

      let targetUid = parseInt(''+req.query.id);
      let targetUserInfo = req.body as IUserInfo;
      if(!targetUserInfo || Number.isNaN(targetUid)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }

      this.AuthService.fastGetCurrentAuthUserId(req).then((userId) => {//获取当前登录用户ID

        if(targetUid !== userId) {
          reject({ errCode: ResposeCode.RES_ACCESS_DENINED } as PromiseResponseRejectInfo);
          return;
        }

        this.UserMapping.updateUserInfoByUserId(userId, targetUserInfo.sex, targetUserInfo.phone, targetUserInfo.moto, targetUserInfo.name).then(() => resolve())
          .catch(() => reject({ errCode: ResposeCode.AUTH_NOT_FOUND_USER } as PromiseResponseRejectInfo));
      }).catch((e) => reject(e));
    });
  }
  /**
   * 更新用户头像
   * @param req 
   * @returns 
   */
  public uploadUserHead(req : Request) {
    return new Promise<{
      path: string,
    }>((resolve, reject) => {

      if(!req.file) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }

      this.uploadKeyToUserId(req).then((userId) => {
        let targetPath = '/uploads/user-head/' + req.file.filename;
        this.UserMapping.updateUserHeadByUserId(userId, targetPath).then(() => resolve({
          path: targetPath,
        })).catch((e) => {
          logger.error('uploadUserHead', e);
          reject({ errCode: ResposeCode.AUTH_NOT_FOUND_USER } as PromiseResponseRejectInfo);
        });
      }).catch(reject);
    });
  }

  /**
   * 通过申请的 uploadKey 获得用户ID
   * @param req 
   */
  public uploadKeyToUserId(req : Request) {
    let key = req.body.key;
    return new Promise<number>((resolve, reject) => {

      if(common.isNullOrEmpty(key)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }

      let redisKey = 'gpo.upload.' + key;
      redisClient.get(redisKey, (err, v) => {

        if(common.isNullOrEmpty(v)) {
          reject({ errCode: ResposeCode.AUTH_TOKEN_EXPIRED } as PromiseResponseRejectInfo);
          return;
        }

        redisClient.del(redisKey);
        resolve(parseInt(v));
      });
    });
  }
  /**
   * 生成上传key
   * @param req 
   * @returns 
   */
  public genUploadKey(req : Request) {
    return new Promise<{
      key: string,
    }>((resolve, reject) => {

      this.AuthService.fastGetCurrentAuthUserId(req).then((userId) => {//获取当前登录用户ID
        let key = common.genNonDuplicateID(32);
        let redisKey = 'gpo.upload.' + key;
        redisClient.set(redisKey, userId.toString());
        redisClient.expire(redisKey + key, 10);
        resolve({
          key: key,
        })
      }).catch((e) => reject(e));
    });
  }
}

export default new UserService();


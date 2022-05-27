import { Request } from "express";
import { redisClient } from "../app";
import { IAuthRequestStruct, IAuthResult, IAuthStatus, IAuthStruct, IAuthQrAccess, IAuthStorageInfo } from "../models/AuthModel";
import { PromiseResponseRejectInfo, ResposeCode } from "../small/utils/http-response";
import md5 from "md5";
import config from "../config";
import common from "../utils/common";
import cryptAes from "../utils/cryptAes";
import { GroupDataSolved } from "../models/GroupModel";
import { User } from "../models/UserModel";
import { BaseService, Service } from "../small/base/Service";
import { Autowired } from "../small/base/Autowired";
import { UserMapping } from "../mappings/UserMapping";
import { OnceAuthMapping } from "../mappings/OnceAuthMapping";
import { GroupMapping } from "../mappings/GroupMapping";
import logger from "../utils/logger";


interface IAuthQrStorageData {
  authed: boolean,
  authUserId: number,
  authScaned: boolean,
}

/**
 * 用户认证，登录相关服务
 */
@Service
export class AuthService extends BaseService {

  @Autowired('Mapping')
  private UserMapping : UserMapping;
  @Autowired('Mapping')
  private OnceAuthMapping : OnceAuthMapping;
  @Autowired('Mapping')
  private GroupMapping : GroupMapping;

  /**
   * 生成加密的密码
   * @param passStr md5原始密码
   * @param userId 用户ID
   * @param userName 用户登录名
   * @returns 
   */
  genUserPass(passStr: string, userId : number, userName : string) {
    return cryptAes.encrypt(config.AUTH_KEY, config.AUTH_IV, `${userName}@${md5(''+passStr)}@${userId}@${config.AUTH_IV}`);
  }
  /**
   * 检查当前请求用户是否登录
   * @param req 请求
   * @returns 如果已经登录，返回登录信息，IAuthResult，否则返回null
   */
  checkUserAuthed(req: Request): Promise<IAuthStatus> {
    return new Promise<IAuthStatus>((resolve, reject) => {
      const authStructStr = req.headers.authorization;

      if (common.isNullOrEmpty(authStructStr)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }
      let authStruct : IAuthStruct;
      try{
        authStruct = JSON.parse(authStructStr);
      }catch(e) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }
      if (common.isNullOrEmpty(authStruct.identifier)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }

      if (common.isNullOrEmpty(authStruct.auth)
        || common.isNullOrEmpty(authStruct.key)
        || common.isNullOrEmpty(authStruct.validity)) {
        reject({ errCode: ResposeCode.AUTH_REQUIRED } as PromiseResponseRejectInfo);
        return;
      }

      redisClient.get(authStruct.auth, (err, v) => {
        if (common.isNullOrEmpty(v)) {
          reject({ errCode: ResposeCode.AUTH_REQUIRED } as PromiseResponseRejectInfo);
          return;
        }

        //验证
        let authStorageStruct = JSON.parse(v) as IAuthStorageInfo;
        if (authStorageStruct.userAuthKey != md5(authStruct.validity + '@' + authStruct.identifier)) {
          reject({ errCode: ResposeCode.AUTH_REQUIRED } as PromiseResponseRejectInfo);
          return;
        }

        //过期
        if (new Date().getTime() > new Date(authStorageStruct.expireAt).getTime()) {
          reject({ errCode: ResposeCode.AUTH_EXPIRED } as PromiseResponseRejectInfo);
          return;
        }

        resolve({
          expireAt: authStorageStruct.expireAt,
          authStatus: true,
        });
      })
    });
  }
  /**
   * 获取当前请求的已登录用户ID
   * @param req 请求
   */
  fastGetCurrentAuthUserId(req: Request): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const authStructStr = req.headers.authorization;
      if (common.isNullOrEmpty(authStructStr)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }
      let authStruct : IAuthStruct;
      try{
        authStruct = JSON.parse(authStructStr);
      }catch(e) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }
      if (common.isNullOrEmpty(authStruct.auth)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }

      redisClient.get(authStruct.auth, (err, v) => {
        if (common.isNullOrEmpty(v)) {
          reject({ errCode: ResposeCode.AUTH_REQUIRED } as PromiseResponseRejectInfo);
          return;
        }

        //验证
        let authStorageStruct = JSON.parse(v) as IAuthStorageInfo;
        resolve(authStorageStruct.userId);
      });
    });
  }
  /**
   * 登录
   * @param req 请求体
   */
  doAuth(req: Request): Promise<IAuthResult> {

    return new Promise<IAuthResult>((resolve, reject) => {

      let data = req.body as IAuthRequestStruct;
      let keys = data.key.split('@');
      let identifier = '' + req.query.identifier;
      let rember = req.query.rember == 'true';

      if (data.method === 'key' && keys.length >= 2) {
        if (keys[0] == 'once') {
          //单次token登录
          this.OnceAuthMapping.getByKey(keys[1]).then((v) => {
            if (v.length === 0) {
              reject({ errCode: ResposeCode.AUTH_TOKEN_NOT_FOUND } as PromiseResponseRejectInfo);
              return;
            }
            let token = v[0];
            if (token.use_count <= 0) {
              reject({ errCode: ResposeCode.AUTH_TOKEN_EXPIRED } as PromiseResponseRejectInfo);
              return;
            }
            this.doAuthUser(token.uid, identifier, rember).then((result) => {
              this.OnceAuthMapping.setUseCountByKey(token.use_count - 1, keys[1]);
              resolve(result);
            }).catch((e) => reject(e));
          }).catch((e) => reject(e));
        } else {
          //普通用户登录
          this.UserMapping.getUserByUserName(keys[0]).then((user) => {
            if (user) {
              let pass = cryptAes.decrypt(config.AUTH_KEY, config.AUTH_IV, user.passwd);
              let passArr = pass.split('@');
              if (passArr[0] == user.user && passArr[1] == keys[1] && parseInt(passArr[2]) == user.id) {
                this.doAuthUser(user.id, identifier, rember).then((result) => resolve(result)).catch((e) => reject(e));
              } else reject({ errCode: ResposeCode.AUTH_PASSWORD_ERROR } as PromiseResponseRejectInfo);
            } else {
              reject({ errCode: ResposeCode.AUTH_NOT_FOUND_USER } as PromiseResponseRejectInfo);
              return;
            }
          }).catch((e) => reject(e));
        }
      } else if (data.method === 'qr' && keys.length >= 1) {
        //二维码登录
        const uid = keys[0];
        const redisKey = 'auth.qr.' + uid;
        redisClient.get(redisKey, (err, v) => {
          if (common.isNullOrEmpty(v)) {
            reject({ errCode: ResposeCode.AUTH_TOKEN_NOT_FOUND } as PromiseResponseRejectInfo);
            return;
          }
          let data = JSON.parse(v) as IAuthQrStorageData;
          if (data.authed) {
            this.doAuthUser(data.authUserId, identifier, rember).then((result) => {
              redisClient.del(redisKey);//删除
              resolve(result);
            }).catch((e) => {
              redisClient.del(redisKey);
              reject(e);
            });
          }
          else if (data.authScaned)
            reject({ errCode: ResposeCode.AUTH_WAITING_ACCEPT } as PromiseResponseRejectInfo);
          else
            reject({ errCode: ResposeCode.AUTH_WAITING } as PromiseResponseRejectInfo);
        });
      } else reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
    });
  }
  /**
   * 进行用户认证最后一步。保存权限认证的必须信息。
   * @param uid 
   * @param identifier 
   * @param rember 
   * @returns 
   */
  doAuthUser(uid: number, identifier: string, rember: boolean) {
    return new Promise<IAuthResult>((resolve, reject) => {
      this.UserMapping.getUserByUserId(uid).then((v) => {
        if (!common.isDefinedAndNotNull(v) || v.status == 0) { reject({ errCode: ResposeCode.AUTH_NOT_FOUND_USER } as PromiseResponseRejectInfo); return; }
        if (v.status >= 2) { reject({ errCode: ResposeCode.AUTH_USER_BANNED } as PromiseResponseRejectInfo); return; }
        if (identifier.length > 20) identifier = identifier.substr(0, 20);

        let validity = common.randomString(32);
        let authName = 'auth.uid.' + identifier;
        let userAuthKey = md5(validity + '@' + identifier);
        let expireSecond = (rember ? config.AUTH_MAX_EXPIRE_TIME : config.AUTH_DEF_EXPIRE_TIME);
        let expireAt = new Date(new Date().getTime() + expireSecond);
        let authStruct: IAuthStorageInfo = {
          expireAt: expireAt,
          userId: uid,
          userAuthKey: userAuthKey,
          userGroupId: v.group_id,
          userGroup: null,
          permissions: null,
          revokePermissions: null,
        }
        let result: IAuthResult = {
          authStatus: true,
          expireAt: expireAt,
          authName: authName,
          authKey: validity,
          authUid: uid,
        };

        this.GroupMapping.getGroupById(v.group_id).then((g) => {

          //处理权限
          authStruct.userGroup = new GroupDataSolved(g);

          let { permissions, revokePermissions } = this.solveUserPermissions(v, authStruct.userGroup.permissions.concat());
          authStruct.revokePermissions = revokePermissions;
          authStruct.permissions = permissions;

          redisClient.set('auth.user.' + uid, authName);
          redisClient.set(authName, JSON.stringify(authStruct), (err) => {
            if (err) reject(err);
            else resolve(result);
          });
          redisClient.expire(authName, expireSecond + 600);

        }).catch((e) => { 
          logger.error('AuthService.doAuthUser', e.stack);
          reject({ errCode: ResposeCode.AUTH_USER_GROUP_MISSING } as PromiseResponseRejectInfo); return; 
        })

      }).catch(reject);
    });
  }
  /**
   * 退出登录
   */
  doEndAuth(req: Request) {
    return new Promise<void>((resolve, reject) => {
      const authStructStr = req.headers.authorization;
      if (common.isNullOrEmpty(authStructStr)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }
      const authStruct = JSON.parse(authStructStr) as IAuthStruct;
      if (common.isNullOrEmpty(authStruct.auth)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }

      redisClient.del(authStruct.auth);
      resolve();
    });
  }

  /**
   * 强制注销用户登录
   * @param id 用户ID
   */
  forceEndAuthUser(id : number) {
    redisClient.get('auth.user.' + id, (err, v) => {
      if(v)
        redisClient.del(v)
    });
  }

  //处理用户和组权限数组并合并成为最终数组
  solveUserPermissions(user: User, existsGroupPermissions: string[]) {
    let revokePermissions : Array<string> = [];
    if(user.grant_permissions) user.grant_permissions.split(';').forEach((v) => existsGroupPermissions.addOnce(v));
    if(user.revoke_permissions) {
      revokePermissions = user.revoke_permissions.split(';');
      revokePermissions.forEach((v) => {
        if (existsGroupPermissions.contains(v)) 
          existsGroupPermissions.remove(v);
      });
    }
    return { permissions: existsGroupPermissions, revokePermissions };
  }
  /**
   * 进行QR登录
   * @param req 
   */
  doQrAuth(req: Request) {

    return new Promise<void>((resolve, reject) => {

      if (common.isNullOrEmpty(req.query.key)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }
      const redisKey = 'auth.qr.' + req.query.key;
      redisClient.get(redisKey, (err, v) => {
        if (common.isNullOrEmpty(v)) {
          reject({ errCode: ResposeCode.AUTH_TOKEN_NOT_FOUND } as PromiseResponseRejectInfo);
          return;
        }
        this.fastGetCurrentAuthUserId(req).then((userId) => {//获取当前登录用户ID
          let data = JSON.parse(v) as IAuthQrStorageData;
          data.authed = true;
          data.authUserId = userId;
          data.authScaned = true;

          redisClient.set(redisKey, JSON.stringify(data));//设置
        }).catch(() => reject({ errCode: ResposeCode.AUTH_QR_NEED_LOGIN } as PromiseResponseRejectInfo));
      });
    });
  }
  /**
   * 通知QR扫描成功
   * @param req 
   */
  doQrScanNotify(req: Request) {

    return new Promise<void>((resolve, reject) => {

      if (common.isNullOrEmpty(req.query.key)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }
      const redisKey = 'auth.qr.' + req.query.key;
      redisClient.get(redisKey, (err, v) => {
        if (common.isNullOrEmpty(v)) {
          reject({ errCode: ResposeCode.AUTH_TOKEN_NOT_FOUND } as PromiseResponseRejectInfo);
          return;
        }

        let data = JSON.parse(v) as IAuthQrStorageData;
        data.authScaned = true;
        redisClient.set(redisKey, JSON.stringify(data), () => resolve());
      });
    });
  }
  /**
   * 获取QR登录密钥
   */ 
  getQrAuthKey(req: Request) {
    return new Promise<IAuthQrAccess>((resolve, reject) => {

      if (common.isNullOrEmpty(req.query.identifier)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }

      const uid = md5('gpo-' + req.query.identifier);
      const redisKey = 'auth.qr.' + uid;

      redisClient.set(redisKey, JSON.stringify({
        authed: false,
        authScaned: false,
        authUserId: 0,
      } as IAuthQrStorageData));
      redisClient.expire(redisKey, 120);

      resolve({ reuestUid: uid });
    });
  }

}


export default new AuthService();


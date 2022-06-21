import { AuthService } from './AuthService';
import config from '../config/index';
import { UserService } from './UserService';
import { PromiseResponseRejectInfo } from './../small/utils/http-response';
import { Request } from 'express';
import { IUpdateResult, IUpdateRule, IUpdateRuleOperator, Update } from '../models/UpdateModel';
import { RestService } from "../small/base/RestService";
import { Service } from "../small/base/Service";
import { ResposeCode } from '../small/utils/http-response';
import { Autowired } from '../small/base/Autowired';
import { DB } from '../small/database/DB';
import StringUtils from '../utils/string';
import { redisClient } from '../app';
import logger from '../utils/logger';
import fs from 'fs';

/**
 * 子系统相关服务
 */
@Service
export class UpdateService extends RestService<Update> {
  public constructor() {
    super('update', 'version_name');

    this.afterInsert = this.afterInsertOrUpdate.bind(this);
    this.afterUpdate = this.afterInsertOrUpdate.bind(this);
    this.beforeDelete = this.solveBeforeDelete.bind(this);
  }

  private afterInsertOrUpdate(req: Request, id: number, data: Update) {
    if (data.update_package_url) {
      //设置引用状态
      DB.table('storage').where('abs_path', data.update_package_url).update({
        using_status: id,
      });
    }
    //清除缓存
    DB.table('app').where('id', data.app_id).first().then((data) => {
      redisClient.expire('check.app.' + data.package_name, 0); 
    });
  }
  private solveBeforeDelete(req: Request, id: number, data: Update) {
    if (data.update_package_url) {
      this.AuthService.fastGetCurrentAuthUserId(req).then((userId) => {
        //设置引用状态
        DB.table('storage').where('abs_path', data.update_package_url).update({
          using_status: 0,
          date: new Date().format(),
          delete_user_id: userId,
        });
      });
    }
    //清除缓存
    DB.table('app').where('id', data.app_id).first().then((data) => {
      redisClient.expire('check.app.' + data.package_name, 0); 
    });
  }

  @Autowired('Service')
  private UserService : UserService;
  @Autowired('Service')
  private AuthService : AuthService;


  /**
   * 更新检查核心函数
   * @param req 
   * @returns 
   */
  public updateCheckCore(req : Request) {
    return new Promise<IUpdateResult>((resolve, reject) => {
      if (StringUtils.isNullOrEmpty(req.query.version_code as string)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }
      if (StringUtils.isNullOrEmpty(req.query.package_name as string)) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }

      //获取参数
      let package_name = req.query.package_name as string;
      let version_name = req.query.version_name as string;
      let channel = req.query.channel as string || 'main';
      let version_code = parseInt(req.query.version_code as string);

      //获取更新信息
      this.getAppUpdateInfoFormChaceOrDB(package_name).then((datas) => {
        
        //没有更新数据
        if (datas.length == 0) {
          resolve({ hasUpdate: false });
          return;
        }
        //判断版本
        for(let i = 0; i < datas.length; i++) {
          const data = datas[i];
          const data_version_code = parseInt(data.version_code);
          const data_post_channels = (StringUtils.isNullOrEmpty(data.post_channels) ? [] : JSON.parse(data.post_channels)) as string[];

          const returnVersion = () => {
            resolve({ 
              hasUpdate: true,
              newVersionCode: data_version_code,
              newVersionName: data.version_name,
              newVersionNote: data.post_note,
              downloadUrl: data.update_package_url,
            });
          };

          //新版本，继续判断
          if (data_version_code > version_code) {
            //判断渠道
            if (
              //当前版本没有规定渠道，无需判断
              ((data_post_channels.length == 0 || (data_post_channels.length == 1 && data_post_channels[0] == 'main')) && StringUtils.isNullOrEmpty(channel))  
              //判断渠道
              || (data_post_channels.length > 0 && data_post_channels.contains(channel))) {

              //判断特殊条件
              if (StringUtils.isNullOrEmpty(data.post_version_code_mask)) {
                //没有什么特殊条件，直接返回此版本了
                returnVersion();
                break;
              } else {
                //继续判断特殊条件
                const ops = JSON.parse(data.post_version_code_mask) as IUpdateRule[];
                if (ops.length == 0) {
                  //没有条件
                  returnVersion();
                  break;
                }
                //继续判断
                if (this.matchRules(version_name, version_code, req, ops)) {
                  returnVersion();
                  break;
                }
              }
            }
          }
        }
        
        resolve({ hasUpdate: false });
      }).catch(reject);
    });
  }

  //匹配规则
  private matchRules(version_name: string, version_code: number, req: Request, ops: IUpdateRule[]) : boolean {

    const mactchOperators = (op: IUpdateRuleOperator, value1: unknown, value2: unknown, type: 'Date'|'other') => {
      //console.log('mactchOperators', op, value1, value2, type);
      
      switch(op) {
        case "greaterThan":
          return parseFloat(value1 as string) > parseFloat(value2 as string);
        case "greaterThanOrEqual":
          return parseFloat(value1 as string) >= parseFloat(value2 as string);
        case "equal":
          if (type === 'Date')
            return (value1 as Date).format('YYYY-MM-DD') === (value2 as Date).format('YYYY-MM-DD');
          return value1 == value2;
        case "lessThan":
          return parseFloat(value1 as string) < parseFloat(value2 as string);
        case "lessThanOrEqual":
          return parseFloat(value1 as string) <= parseFloat(value2 as string);
        case "regrex":
          return new RegExp(value2 as string).test(value1 as string);
      }
      return true;
    }
    const mactchRule = (op: IUpdateRule) => {
      if (!op.enabled)
        return true;
      let paramValue = '';
      switch(op.param) {
        case 'has_param': 
          paramValue = req.query[op.paramName] as string;
          if (StringUtils.isNullOrEmpty(paramValue))
            return false;
          return mactchOperators(op.operator, paramValue, op.value, 'other');
        case 'last_update_time': 
          paramValue = req.query['last_update_time'] as string;
          if (StringUtils.isNullOrEmpty(paramValue))
            return false;
          return mactchOperators(op.operator, new Date(paramValue), new Date(op.value), 'Date');
        case 'version_code': 
          return mactchOperators(op.operator, version_code, op.value, 'other');
        case 'version_name': 
          return mactchOperators(op.operator, version_name, op.value, 'other');
        default:
          return true;
      }
    };
    const mergeRuleResult = (op: "and"|"or", prevValue: boolean, newValue: boolean) => {
      if (op === 'and')
        return prevValue && newValue;
      if (op === 'or')
        return prevValue || newValue;
      return newValue;
    };
    const mactchGroup = (ops: IUpdateRule) => {
      let rs = true;
      if (!ops.enabled)
        return rs;
      ops.children.forEach(element => {
        if (element.type === 'group')
          rs = mergeRuleResult(element.op, rs, mactchGroup(element));
        else if (element.type === 'rule')
          rs = mergeRuleResult(element.op, rs, mactchRule(element));
      });
      return rs;
    };

    return mactchGroup(ops[0]);
  } 

  //从数据库或者缓存中读取更新信息
  private getAppUpdateInfoFormChaceOrDB(package_name: string) {
    return new Promise<Update[]>((resolve, reject) => {
      redisClient.get('check.app.' + package_name, (err, str) => {
        if (err || StringUtils.isNullOrEmpty(str)) {
          //没有缓存，从数据库读取
          //获取app_id
          DB.table('app').where('package_name', package_name).first().then((data) => {
            if (data == null) {
              reject({ errCode: ResposeCode.APP_NOT_FOUND } as PromiseResponseRejectInfo); 
              return; 
            }
            //未启用，直接返回
            if (data.status !== 'enabled') {
              //保存到缓存中
              redisClient.set('check.app.' + package_name, '[]');
              resolve([]); 
              return; 
            }
            //获取更新数据
            DB.table('update').where('app_id', data.id).where('status', 'enabled').orderBy('date', 'desc').limit(64).get().then((datas) => {
              //保存到缓存中
              redisClient.set('check.app.' + package_name, JSON.stringify(datas));
              resolve(datas as Update[]);
            }).catch((e) => {
              logger.error('UpdateService.getUpdates', e);
              reject({ errCode: ResposeCode.DATA_BASE_ERROR } as PromiseResponseRejectInfo);
              return; 
            });
          }).catch((e) => {
            logger.error('UpdateService.getAppId', e);
            reject({ errCode: ResposeCode.DATA_BASE_ERROR } as PromiseResponseRejectInfo);
            return; 
          });
          return;
        }
        //有缓存，直接返回缓存
        resolve(JSON.parse(str));
      });
    });
  }

  /**
   * 上传更新二进制文件
   * @param req 
   * @returns 
   */
  public uploadUpdateFile(req : Request) {
    return new Promise<{
      path: string,
    }>((resolve, reject) => {

      if(!req.file) {
        reject({ errCode: ResposeCode.BAD_REQUEST } as PromiseResponseRejectInfo);
        return;
      }

      this.UserService.uploadKeyToUserId(req).then((userId) => {        
        const relative_path = '/uploads/dists/' + req.file.filename + '.' + StringUtils.getFileExt(req.file.originalname); //绝对路径
        const local_path = process.cwd() + relative_path; //绝对路径
        let targetPath = config.PUBLIC_URL + relative_path; //本地路径

        //重命名一下文件
        fs.rename(process.cwd() + '/uploads/dists/' + req.file.filename, local_path, () => {});

        //存储库数据存储
        DB.table('storage').insert({
          date: new Date().format(),
          abs_path: targetPath,
          local_path: local_path,
          using_status: 0,
          third_storage_path: null,
          upload_user_id: userId,
          delete_user_id: null,
        });

        resolve({
          path: targetPath,
        });
      }).catch(reject);
    });
  }
}

export default new UpdateService();


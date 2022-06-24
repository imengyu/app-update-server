export interface Config {
  REDIS_ADDRESS: string,
  REDIS_PORT: number,
  REDIS_PASS: string,
  REDIS_DB: number,
  DB_FILAE_NAME: string,
  AUTH_KEY: string,
  AUTH_IV: string,
  AUTH_DEF_EXPIRE_TIME: number,//1day
  AUTH_MAX_EXPIRE_TIME: number,//30day
  ALIYUN_OSS_ACCESS_KEY: string,
  ALIYUN_OSS_ACCESS_SECRET: string,
  ALIYUN_OSS_ACCESS_ACS: string,
  ALIYUN_OSS_BUCKET: string,
  ALIYUN_OSS_REGION: string,
  VERSION: string,
  PUBLIC_URL: string,
  PORT: number,
}

export default eval('require(\'./config/config.json\')') as Config;
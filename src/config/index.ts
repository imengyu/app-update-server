const devConfig = {
  REDIS_ADDRESS: '127.0.0.1',
  REDIS_PORT: 6379,
  REDIS_PASS: '',
  DB_FILAE_NAME: 'updateServer.db',
  AUTH_KEY: 'W+JAwCTvlZhapJC5',
  AUTH_IV: 'e4e1825d5c306ec9',
  AUTH_DEF_EXPIRE_TIME: 80000 * 1000,//1day
  AUTH_MAX_EXPIRE_TIME: 2592000 * 1000,//30day
  VERSION: '1.0.32',
  PUBLIC_URL: 'http://localhost:3011',
  PORT: 3011,
};
const proConfig = {
  REDIS_ADDRESS: '127.0.0.1',
  REDIS_PORT: 6379,
  REDIS_PASS: '',
  DB_FILAE_NAME: 'updateServer.db',
  AUTH_KEY: 'W+JAwCTvlZhapJC5',
  AUTH_IV: 'e4e1825d5c306ec9',
  AUTH_DEF_EXPIRE_TIME: 80000 * 1000,//1day
  AUTH_MAX_EXPIRE_TIME: 2592000 * 1000,//30day
  VERSION: '1.0.32',
  PUBLIC_URL: 'http://localhost:3011',
  PORT: 3011,
};
const config = process.env.NODE_ENV === 'production' ? (global.__NODEJS_REQUIRE__('./config/config.json') || proConfig) : devConfig;

export default config
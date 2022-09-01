import { MemRedis } from './utils/memRedis';
const ev = eval('require(\'./app.fix\')');

global.__NODEJS_GLOBAL__ = ev.__NODEJS_GLOBAL__;
global.__NODEJS_REQUIRE__ = ev.__NODEJS_REQUIRE__;

import './utils/extends'
import express from 'express'
import session from 'express-session'
import redis from 'redis'
import path from 'path'
import multer from 'multer'
import connectRedis from 'connect-redis'
import config from './config'
import logger from './utils/logger'
import { bindAllControllerBeans } from './small/base/Controller'
import { useAllControllers } from './controllers/All'
import { useAllMappings } from './mappings/All'
import { useAllServices } from './services/All'
import StringUtils from './utils/string';

//配置logger
logger.configure();

//配置Redis以及数据库
const hasRedis = config.REDIS_ADDRESS && config.REDIS_ADDRESS !== '';

const app = express();
const RedisStore = connectRedis(session);
const redisClient = hasRedis ? redis.createClient({
  host: config.REDIS_ADDRESS,
  port: config.REDIS_PORT,
  password: StringUtils.isNullOrEmpty(config.REDIS_PASS) ? undefined : config.REDIS_PASS,
  db: config.REDIS_DB,
}) : new MemRedis() as unknown as redis.RedisClient;

//配置上传器
const uploadFiles = multer({ 
  dest: process.cwd() + '/uploads/dists/' ,
  fileFilter: (req, file, cb) => {
    var acceptableMime = ['application/vnd.android.package-archive']
    cb(null, (acceptableMime.indexOf(file.mimetype) !== -1));
  },
});
const uploadUserHead = multer({ 
  dest: process.cwd() + '/uploads/heads/' ,
  fileFilter: (req, file, cb) => {
    var acceptableMime = [ 'image/jpeg', 'image/png', 'image/jpg', 'image/bmp' ]
    cb(null, (acceptableMime.indexOf(file.mimetype) !== -1));
  },
});

//配置session和app

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(session({
  cookie: {
    maxAge: 640000
  },
  secret: 'vcity_server_922',
  store: hasRedis ? new RedisStore({
    client: redisClient,
    host: config.REDIS_ADDRESS,
    port: config.REDIS_PORT,
    ttl: 60 * 60 * 24 * 30, 
    prefix: 'vcity',
  }) : undefined,
  saveUninitialized: false,
  resave: false,
}));
//设置跨域访问
app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Origin, Content-Type,Authorization,Content-Type,Last-Modified");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", 'Mengyu Update Server 3.5.1')
  next();
});
//静态文件
app.use('/', express.static(path.join(process.cwd(), 'public')))
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
app.use('/admin', express.static(path.join(process.cwd(), 'admin')))

//引用控制器
useAllControllers();
//引用服务和mapping
useAllMappings();
useAllServices();
//注册控制器
bindAllControllerBeans(app);

//开始监听
app.listen(config.PORT, () => {
  logger.info('Server', `Listening on port ${config.PORT}`);
  if(process.env.NODE_ENV === 'development')
    logger.log('Server', `Visit http://localhost:${config.PORT}/`)
});

logger.info('Server', `Server initialization complete`);

export { redisClient, uploadFiles, uploadUserHead };

import log4js from "log4js";
import chalk from 'chalk';

export class Logger {

  public outPutToConsole = true;

  private logger : log4js.Logger = null;
  private http_logger : log4js.Logger = null;

  configure() {
    const log4jsConf = __NODEJS_REQUIRE__("./config/logConf.json");
    log4js.configure(log4jsConf);   
    this.http_logger = log4js.getLogger("http");
    this.logger = log4js.getLogger("default");
  }
  /**
   * 获取 logger
   */
  getLogger() { return this.logger }
    /**
   * 获取 logger
   */
  getHttpLogger() { return this.http_logger }
  /**
   * 设置是否输出到控制台
   * @param {boolean} output 
   */
  setOutPutToConsole(output : boolean) { this.outPutToConsole = output }

  /**
   * 输出日志
   * @param args 参数
   */
  log(tag : string, message : string) {
    this.logger.log(`[${tag}] ${message}`);
    if(this.outPutToConsole) console.log(chalk`{yellow [${tag}]} {blue ${message}}`);
  }
  /**
   * 输出错误日志
   * @param args 参数
   */
  error(tag : string, message : string) {
    this.logger.error(`[${tag}] ${message}`);
    if(this.outPutToConsole) console.error(chalk`{yellow [${tag}]} {redBright ${message}}`);
  }
  /**
   * 输出警告日志
   * @param args 参数
   */
  warn(tag : string, message : string) {
    this.logger.warn(`[${tag}] ${message}`);
    if(this.outPutToConsole) console.warn(chalk`{yellow [${tag}]} {yellowBright ${message}}`);
  }
  /**
   * 输出信息日志
   * @param args 参数
   */
  info(tag : string, message : string) {
    this.logger.info(`[${tag}] ${message}`);
    if(this.outPutToConsole) console.info(chalk`{yellow [${tag}]} {blueBright ${message}}`);
  }
}

export default new Logger();


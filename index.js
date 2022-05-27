"use strict"

/**
 * 文件功能
 * 
 * 主入口
 * 
 * 加载 app.js 并且 将node原生的global、require保存至以下两个变量中。
 * 
 * __NODEJS_GLOBAL__
 * __NODEJS_REQUIRE__
 * 
 */

const __NODEJS_GLOBAL__ = global;
const __NODEJS_REQUIRE__ = require;

const chalk = require('chalk');
const fs = require('fs')
const vm = require('vm')
const NativeModule = require('module')

global.__NODEJS_GLOBAL__ = __NODEJS_GLOBAL__;
global.__NODEJS_REQUIRE__ = __NODEJS_REQUIRE__;

function loadAppJs() {
  return new Promise((resolve, reject) => {
    var appJsPath = process.cwd() + '/app.js';
    var appJsCode = '';

    console.log(chalk`{yellowBright [ServerIndex]} Load {grey ${appJsPath}}`);

    if(fs.existsSync(appJsPath)) {
      fs.readFile(appJsPath, { encoding: 'utf-8' }, (err, data) => {
        if(err) {
          reject(`Load ${appJsPath} failed !\n${err}`);
          return;
        }
        appJsCode = data;
        resolve({
          appJsCode,
          appJsPath
        });
      });
    }
    else reject(`Not found ${appJsPath} !`);
  })
}
function runAppJs(d) {
  var { appJsPath, appJsCode } = d;

  const getModuleFromString = (bundle, filename) => {
    const m = { exports: {} };
    const wrapper = NativeModule.wrap(bundle);
    const script = new vm.Script(wrapper, { 
      filename,
      displayErrors: true
    });
    const result = script.runInThisContext();
    result.call(m.exports, m.exports, require, m);
    return m;
  }

  console.log(chalk`{yellowBright [ServerIndex]} Start Run app.js`);
  console.log(chalk`{yellowBright [ServerIndex]} {green ${appJsCode.length}}`);

  getModuleFromString(appJsCode, 'app.js');
}

loadAppJs()
  .then((d) => {
    try{
      runAppJs(d);
    }catch(e) {
      console.error(chalk.yellowBright('[Server] ') + chalk.redBright(e.toString()) 
        + (e.stack ? '\n' + chalk.grey(e.stack) : ''));
    }
  })
  .catch((e) => {
    if(Object.prototype.toString.call(e) === '[object Error]') {
      console.error(chalk.redBright(e));
    } else {
      console.log(chalk`{yellowBright [ServerIndex]} {red ${e}}`);
      process.exit(-1)
    }
  });
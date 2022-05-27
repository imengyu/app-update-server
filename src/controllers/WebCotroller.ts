import { Express } from 'express'
import { BaseController, Controller } from '../small/base/Controller';
import common from '../utils/common';
import { Value } from '../small/base/Value';

@Controller
export class WebCotroller extends BaseController {

  @Value('VERSION')
  private appVersion : string;

  bindAll(app : Express) {
    app.get('/', (req, res) => {
      common.sendSuccess(res, {
        hello: 'world',
        about: 'Use /about to show server info.',
      });
    });
    app.get('/about', (req, res) => {
      common.sendSuccess(res, {
        about: 'App Update Server',
        appVersion: this.appVersion,
        nodeEnv: process.env.NODE_ENV,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      });
    });
  }
}

export default new WebCotroller();

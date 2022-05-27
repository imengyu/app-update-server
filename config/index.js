const path = require('path')

module.exports = {
  dev: {
    devtool: 'source-map',
    distRoot: path.resolve(__dirname, '../dist/development'),
  },
  build: {
    distRoot: path.resolve(__dirname, '../dist/production'),
    devtool: false,
    productionSourceMap: false,
    productionGzip: false,
    productionGzipExtensions: [],
    bundleAnalyzerReport: false,
  }
};
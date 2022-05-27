'use strict'
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')

const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/prod.env')
    }),
  ],
  optimization: {
    minimize: false,
    usedExports: false,
  }
});

module.exports = webpackConfig

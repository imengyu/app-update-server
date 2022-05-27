'use strict'
const path = require('path')
const config = require('../config')
const nodeExternals = require('webpack-node-externals')
const CopyWebpackPlugin = require('copy-webpack-plugin')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  context: path.resolve(__dirname, '../'),
  entry: { 
    'app': resolve('src/app.ts'),
  },
  output: {
    filename: '[name].js',
    path: process.env.NODE_ENV === 'production'
      ? config.build.distRoot
      : config.dev.distRoot,
  },
  target: 'node',
  resolve: {
    extensions: ['.js', '.ts', '.json'],
    alias: {
      '@': resolve('src'),
    }
  },
  externals: [
    nodeExternals()
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ]
  },
  node: {
    global: false
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../src/static'),
          to: process.env.NODE_ENV === 'production' ? config.build.distRoot : config.dev.distRoot,
        }
      ]
    }),
  ]
}

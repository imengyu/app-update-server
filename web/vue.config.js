/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
module.exports = {
  lintOnSave: false,
  outputDir: '../dist/production/admin/',
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
} 
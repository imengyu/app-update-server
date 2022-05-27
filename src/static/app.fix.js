const __NODEJS_GLOBAL__ = global;
const __NODEJS_REQUIRE__ = require;

global.__NODEJS_GLOBAL__ = __NODEJS_GLOBAL__;
global.__NODEJS_REQUIRE__ = __NODEJS_REQUIRE__;

module.exports = {
  __NODEJS_GLOBAL__,
  __NODEJS_REQUIRE__
}
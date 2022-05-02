/**
 * @file index.js
 * @desc {{description}}{{http暴露接口}}
 * @createTime 2018年11月03日18:09:33
 * @doc
 *  npm run build && git add -A dist
 *  npm version patch
 * @doc
 *  https://juejin.im/post/5b19d65a51882513756f102b
 */
require('es6-promise').polyfill()
var promiseFinally = require('promise.prototype.finally')
var httpPromise = require('./promise')
var utils = require('./utils')

promiseFinally.shim()

var install = function (Vue, options) {
  if (install.installed) {
    return
  }
  install.installed = true

  // TODO: 1.区分不同模块
  // 注意哦，此处挂载在 Vue 原型的 $api 对象上
  var api = httpPromise(options)
  Object.assign(axiosPro, api)
  Vue.prototype.$api = api
}

// node environments
// 支持服务端使用
function inject(options) {
  var nodeApi = httpPromise(options)
  Object.assign(axiosPro, nodeApi)
}

var axiosPro = {
  $install: install,
  $inject: inject,
  // old api support
  $combine: utils.combine,
  // could use new `axiosPro.$utils.xx` api for some tool function
  $utils: utils
}

module.exports = axiosPro

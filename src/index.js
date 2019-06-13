/**
 * @file index.js
 * @desc {{description}}{{http暴露接口}}
 * @createTime 2018年11月03日18:09:33
 * @doc
 *  npm run build && git add -A dist
 *  npm version patch
 */
require('es6-promise').polyfill()
const promiseFinally = require('promise.prototype.finally')
const httpPromise = require('./promise')
const utils = require('./utils')

const axiosPro = {}

promiseFinally.shim()

const install = (Vue, options) => {
  if (install.installed) {
    return
  }
  install.installed = true

  // TODO: 1.区分不同模块
  // TODO: 2.mapper应该作为参数引入
  // Object.defineProperties未生效
  // doc: https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties
  // 注意哦，此处挂载在 Vue 原型的 $api 对象上
  var api = httpPromise(options)
  Vue.prototype.$api = api
  axiosPro.api = api
}

axiosPro.install = install
axiosPro.combine = utils.combine

module.exports = axiosPro

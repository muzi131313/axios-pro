var ajax = require('./index')

var api = {}

/**
 * @name get
 * @param url string 请求url
 * @param params object 请求参数
 * @createTime 2018年11月04日00:15:02
 */
api.get = function (url, params, options) {
  options = options || {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  params = params || {}
  options = Object.assign({}, {
    url: url,
    params: params,
    method: 'get'
  }, options)
  return ajax(options)
}

/**
 * @name post
 * @param url string 请求url
 * @param params object 请求参数
 * @createTime 2018年11月04日00:15:02
 */
api.post = function (url, params, options) {
  options = options || {}
  var data = params || {}
  options = Object.assign({}, {
    url: url,
    data: data,
    method: 'post'
  }, options)
  return ajax(options)
}

/**
 * @name put
 * @param url string 请求url
 * @param params object 请求参数
 * @createTime 2018年11月04日00:15:02
 */
api.put = function (url, params, options) {
  options = options || {}
  var data = params || {}
  options = Object.assign({}, {
    url: url,
    data: data,
    method: 'put'
  }, options)
  return ajax(options)
}

/**
 * @name delete
 * @param url string 请求url
 * @param params object 请求参数
 * @createTime 2018年11月04日00:15:02
 */
api.del = function (url, params, options) {
  options = options || {}
  params = params || {}
  options = Object.assign({}, {
    url: url,
    params: params,
    method: 'delete'
  }, options)
  return ajax(options)
}

/**
 * @name patch
 * @param url string 请求url
 * @param params object 请求参数
 * @createTime 2018年11月04日00:15:02
 */
api.patch = function (url, params, options) {
  options = options || {}
  var data = params || {}
  options = Object.assign({}, {
    url: url,
    data: data,
    method: 'patch'
  }, options)
  return ajax(options)
}

/**
 * @name head
 * @param url string 请求url
 * @param params object 请求参数
 * @createTime 2019年10月24日21:03:12
 */
api.head = function (url, params, options) {
  options = options || {}
  var data = params || {}
  options = Object.assign({}, {
    url: url,
    data: data,
    method: 'head'
  }, options)
  return ajax(options)
}

module.exports = api

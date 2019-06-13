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
  return ajax(Object.assign({
    url,
    params,
    method: 'get'
  }, options))
}

/**
 * @name post
 * @param url string 请求url
 * @param params object 请求参数
 * @createTime 2018年11月04日00:15:02
 */
api.post = function (url, params, options) {
  options = options || {}
  const data = params || {}
  return ajax(Object.assign({
    url,
    data,
    method: 'post'
  }, options))
}

/**
 * @name put
 * @param url string 请求url
 * @param params object 请求参数
 * @createTime 2018年11月04日00:15:02
 */
api.put = function (url, params, options) {
  options = options || {}
  const data = params || {}
  return ajax(Object.assign({
    url,
    data,
    method: 'put'
  }, options))
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
  return ajax(Object.assign({
    url,
    params,
    method: 'delete'
  }, options))
}

/**
 * @name patch
 * @param url string 请求url
 * @param params object 请求参数
 * @createTime 2018年11月04日00:15:02
 */
api.patch = function (url, params, options) {
  options = options || {}
  const data = params || {}
  return ajax(Object.assign({
    url,
    data,
    method: 'patch'
  }, options))
}

module.exports = api

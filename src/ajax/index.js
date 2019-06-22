var axios = require('axios')
var config = require('../config') // 倒入默认配置
var request = require('./interceptors/request')
var response = require('./interceptors/response')

// 返回数据解析
var parseData = function (res) {
  try {
    var data = Object.prototype.toString.call(res.data) === '[object String]'
      ? JSON.parse(res.data)
      : res
    return data
  }
  catch (e) {
    return res
  }
}

// (type, url, param, opts)
module.exports = function (options) {
  return new Promise(function(resolve, reject) {
    var baseURL = config.baseURL
    var headers = config.headers
    // support override headers from methods
    var baseHandlers = Object.assign({}, config.handlers || {}, options.handlers || {})
    options = Object.assign({}, config || {}, options || {})
    options.handlers = baseHandlers
    // console.info('baseHandlers: ' + JSON.stringify(baseHandlers))

    var instance = axios.create({
      baseURL: baseURL,
      headers: headers,
      transformResponse: [
        function(data) {
          return data
        }
      ]
    })

    // request interceptor
    instance = request(instance, options)

    // response interceptor
    instance = response(instance, options)

    // 请求处理
    return instance(options)
      .then(function(res) {
        var data = parseData(res)
        resolve(data)
        return res
      })
      .catch(function(error) {
        reject(error)
      })
      .finally(function() {
        if (options.handlers
          && options.handlers.loading
          && options.handlers.loading.open) {
          options.handlers
          && options.handlers.loading
          && options.handlers.loading.end
          && options.handlers.loading.end()
        }
      })
  })
}

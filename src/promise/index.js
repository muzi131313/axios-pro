var api = require('../ajax/api')
var utils = require('../utils')

var get = api.get
var post = api.post
var put = api.put
var del = api.del
var patch = api.patch
var head = api.head

var requestTypes = {
  gets: get,
  posts: post,
  puts: put,
  dels: del,
  patches: patch,
  heades: head
}

var transURL = function (url, urlParams) {
  var urlType = utils.objType(url)
  return urlType === 'function' ? url(urlParams) : url
}

var initHttpPromise = function (mappers, config) {
  return Object.keys(mappers).reduce(function (current, now) {
    var requests = mappers[now]
    var httpPromise = current
    var request = requestTypes[now]

    Object.keys(requests).forEach(function (reqKey) {
      var url = requests[reqKey]
      httpPromise[reqKey] = function (params, options, urlParams) {
        options = options || {}
        var baseHandlers = Object.assign({}, config.handlers || {}, options.handlers || {})
        options = Object.assign({}, config, options)
        options.handlers = baseHandlers
        var requestURL = transURL(url, urlParams)
        return request(requestURL, params, options)
      }
    })

    // switch (now) {
    //   case 'gets':
    //     Object.keys(request).forEach(function (reqKey) {
    //       var url = request[reqKey]
    //       httpPromise[reqKey] = function (params, options, urlParams) {
    //         options = options || {}
    //         var baseHandlers = Object.assign({}, config.handlers || {}, options.handlers || {})
    //         options = Object.assign({}, config, options)
    //         options.handlers = baseHandlers
    //         var requestURL = transURL(url, urlParams)
    //         return get(requestURL, params, options)
    //       }
    //     })
    //     break
    //   case 'posts':
    //     Object.keys(request).forEach(function (reqKey) {
    //       var url = request[reqKey]
    //       httpPromise[reqKey] = function (params, options, urlParams) {
    //         options = options || {}
    //         var baseHandlers = Object.assign({}, config.handlers || {}, options.handlers || {})
    //         options = Object.assign({}, config, options)
    //         options.handlers = baseHandlers
    //         var requestURL = transURL(url, urlParams)
    //         return post(requestURL, params, options)
    //       }
    //     })
    //     break
    //   case 'puts':
    //     Object.keys(request).forEach(function(reqKey) {
    //       var url = request[reqKey]
    //       httpPromise[reqKey] = function (params, options, urlParams) {
    //         options = options || {}
    //         var baseHandlers = Object.assign({}, config.handlers || {}, options.handlers || {})
    //         options = Object.assign({}, config, options)
    //         options.handlers = baseHandlers
    //         var requestURL = transURL(url, urlParams)
    //         return put(requestURL, params, options)
    //       }
    //     })
    //     break
    //   case 'dels':
    //     Object.keys(request).forEach(function (reqKey) {
    //       var url = request[reqKey]
    //       httpPromise[reqKey] = function (params, options, urlParams) {
    //         options = options || {}
    //         var baseHandlers = Object.assign({}, config.handlers || {}, options.handlers || {})
    //         options = Object.assign({}, config, options)
    //         options.handlers = baseHandlers
    //         var requestURL = transURL(url, urlParams)
    //         return del(requestURL, params, options)
    //       }
    //     })
    //     break
    //   case 'patches':
    //     Object.keys(request).forEach(function (reqKey) {
    //       var url = request[reqKey]
    //       httpPromise[reqKey] = function (params, options, urlParams) {
    //         options = options || {}
    //         var baseHandlers = Object.assign({}, config.handlers || {}, options.handlers || {})
    //         options = Object.assign({}, config, options)
    //         options.handlers = baseHandlers
    //         var requestURL = transURL(url, urlParams)
    //         return patch(requestURL, params, options)
    //       }
    //     })
    //     break
    //   case 'heades':
    //     Object.keys(request).forEach(function (reqKey) {
    //       var url = request[reqKey]
    //       httpPromise[reqKey] = function (params, options, urlParams) {
    //         options = options || {}
    //         var baseHandlers = Object.assign({}, config.handlers || {}, options.handlers || {})
    //         options = Object.assign({}, config, options)
    //         options.handlers = baseHandlers
    //         var requestURL = transURL(url, urlParams)
    //         return head(requestURL, params, options)
    //       }
    //     })
    //     break
    //   default:
    //     break
    // }
    return current
  }, {})
}

module.exports = function promise(options) {
  options = options || {}
  var mappers = options.mappers
  var config = options.config
  return initHttpPromise(mappers, config)
}

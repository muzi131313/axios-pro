var api = require('../ajax/api')
var utils = require('../utils/index')

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
  if (utils.objType(mappers) !== 'object') {
    throw new Error('mappers was not a object params')
  }
  if (utils.objType(config) !== 'object') {
    throw new Error('config was not a object params')
  }
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

    return current
  }, {})
}

module.exports = function promise(options) {
  options = options || {}
  var mappers = options.mappers
  var config = options.config
  return initHttpPromise(mappers, config)
}

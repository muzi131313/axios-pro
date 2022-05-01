/**
 * @file response.js
 * @desc {{description}}{{返回响应拦截}}
 * @createTime 2018年11月03日23:16:47
 */
var getLanguage = require('../../language/index')

module.exports = function (instance, config) {
  var objType = function (obj) {
    return Object.prototype.toString.call(obj)
      .replace('[object ', '')
      .replace(']', '')
      .toLowerCase()
  }
  // response 拦截器
  instance.interceptors.response.use(
    function (response) {
      // IE9时response.data是undefined，因此需要使用response.request.responseText(Stringify后的字符串)
      var data
      if (!response.data) {
        data = response.request.responseText
      }
      else {
        data = response.data
      }

      var oldDataType = objType(data)
      var oldData = data
      try {
        // ie下返回data为[object String]类型
        data = data && oldDataType === 'string' ? JSON.parse(data) : data
      }
      catch (e) {
        data = oldData
        console.error('interceptors response parse data exits error')
        console.error(e)
      }

      // 文件流
      var fileTypes = [ 'string', 'blob' ]
      var dataType = objType(data)

      if (~fileTypes.indexOf(dataType)) {
        return {
          data: data,
          // 如果后台把文件名放到headers中的filename属性上
          fileName: response.headers.filename
        }
      }
      config.handlers && config.handlers.data && config.handlers.data(data)

      return data
    },
    function (err) {
      if (err) {
        console.error(err.message)
      }

      if (err && err.response) {
        var language = getLanguage(config.handlers && config.handlers.language)
        var errMessage = language.msg[err.response.status] || 'unknow error'
        err.message = errMessage
      }

      if (config.handlers && config.handlers.error) {
        config.handlers.error(err)
        return Promise.resolve(err)
      }
      return Promise.reject(err) // 返回接口返回的错误信息
    }
  )
  return instance
}

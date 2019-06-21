/**
 * @file response.js
 * @desc {{description}}{{返回响应拦截}}
 * @createTime 2018年11月03日23:16:47
 */
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
      var fileTypes = ['string', 'blob']
      var dataType = objType(data)

      if (~fileTypes.indexOf(dataType)) {
        return {
          data,
          // 如果后台把文件名放到headers中的filename属性上
          fileName: response.headers['filename']
        }
      }
      config.handlers && config.handlers.data && config.handlers.data(data)

      return data
    },
    function (err) {
      if (err && err.response) {
        switch (err.response.status) {
          case 400:
            err.message = '请求错误'
            break

          case 401:
            err.message = '未授权，请登录'
            break

          case 403:
            err.message = '拒绝访问'
            break

          case 404:
            err.message = `请求地址出错: ${err.response.config.url}`
            break

          case 408:
            err.message = '请求超时'
            break

          case 500:
            err.message = '服务器内部错误'
            break

          case 501:
            err.message = '服务未实现'
            break

          case 502:
            err.message = '网关错误'
            break

          case 503:
            err.message = '服务不可用'
            break

          case 504:
            err.message = '网关超时'
            break

          case 505:
            err.message = 'HTTP版本不受支持'
            break

          default:
        }
      }
      console.error(err)

      config.handlers && config.handlers.code && config.handlers.error(err)

      return Promise.reject(err) // 返回接口返回的错误信息
    }
  )
  return instance
}

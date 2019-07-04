// var qs = require('qs') // 序列化请求数据，视服务端的要求

// var stringifyTypes = ['post', 'put', 'patch', 'delete']

module.exports = function (instance, baseConfig) {
  // request 拦截器
  instance.interceptors.request.use(
    function (config) {
      // Tip: 1
      // 请求开始的时候可以结合 vuex 开启全屏的 loading 动画
      if (baseConfig.handlers
        && baseConfig.handlers.loading
        && baseConfig.handlers.loading.open) {
        baseConfig.handlers
          && baseConfig.handlers.loading
          && baseConfig.handlers.loading.start
          && baseConfig.handlers.loading.start()
      }

      // Tip: 2
      // 带上 token , 可以结合 vuex 或者重 localStorage
      baseConfig.handlers && baseConfig.handlers.config && baseConfig.handlers.config(config)

      // Tip: 3
      // TODO: 根据请求方法，序列化传来的参数，根据后端需求是否序列化
      // TODO: 这里加上这个后, post请求携带的数据丢失
      // var method = config.method
      // var params = config.params
      // method = method.toLocaleLowerCase()
      // if (~stringifyTypes.indexOf(method)) {
      //   config.data = qs.stringify(params)
      //   delete config.params
      // }
      return config
    },
    function (error) {
      // 请求错误时做些事(接口错误、超时等)
      // Tip: 4
      // 关闭loadding
      // console.log('request:', error)

      //  1.判断请求超时
      if (error.code === 'ECONNABORTED'
        && error.message.indexOf('timeout') !== -1) {
        // TODO: 超时处理
        console.log('根据你设置的timeout/真的请求超时 判断请求现在超时了，你可以在这里加入超时的处理方案')
        baseConfig.handlers && baseConfig.handlers.timeout && baseConfig.handlers.timeout(error.message)
        // return service.request(originalRequest);//例如再重复请求一次
        return Promise.resolve(error)
      }
      //  2.需要重定向到错误页面
      // const errorInfo = error.response
      // // console.log(errorInfo);
      // if (errorInfo) {
      //   // error =errorInfo.data//页面那边catch的时候就能拿到详细的错误信息,看最下边的Promise.reject
      //   const errorStatus = errorInfo.status // 404 403 500 ... 等
      //   router.push({
      //     path: `/error/${errorStatus}`
      //   })
      // }
      return Promise.reject(error) // 在调用的那边可以拿到(catch)你想返回的错误信息
    }
  )
  return instance
}

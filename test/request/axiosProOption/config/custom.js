/**
 * @file test/request/config/custom.js
 * @description axiosPro用户自定义全局配置
 * @createTime 2019年10月16日18:00:12
 */
export default {
  handlers: {
    timeout (msg) {
      console.log('timeout: ', msg)
    },
    data (data = {}) {
      const code = data.code
      if (code !== undefined) console.log('dataCode: ', code)
    },
    error (errorInfo) {
      // 此处我使用的是 element UI 的提示组件
      // Message.error(`ERROR: ${err}`);
      if (errorInfo) console.log('errorInfo: ', errorInfo)
    },
    // this function was callback when the request was send before
    // if you has your own config, or want to intercept all the request before send
    config (config) {
      config.validateStatus = status => { // 成功状态码定义范围
        return status >= 200 && status < 300
      }
      // if (!Utils.isNotLogin()) {
      //     config.headers['X-Token'] = Utils.getToken() // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
      // } else {
      //     // 重定向到登录页面
      //     window.location.href = 'login'
      // }
    },
    loading: {
      // 是否开启动画, 默认关闭, 需要请求中主动开启
      open: false,
      start () {
        // UI开始loading动画
      },
      end () {
        // UI结束loading动画
      }
    }
  }
}

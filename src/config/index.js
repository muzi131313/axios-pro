var { CN_TYPE } = require('../constant')

module.exports = {
  method: 'get',
  // 基础url前缀
  baseURL: '',
  // 请求头信息
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  },
  // 参数
  data: {},
  // 设置超时时间
  timeout: 30e3,
  // 携带凭证
  withCredentials: false,
  // 返回数据类型
  responseType: 'json',
  // 函数处理
  handlers: {
    // 默认语言, 可以通过传参更改
    language: CN_TYPE,
    // 语言错误自定义选项, 参考: src/language/en/index.js
    // 若传此项, 需要重写language: null
    languageOption: null,
    /**
     * @name timeout
     * @desc {{description}}{{超时的处理, REM: 从外部传参重写}}
     * @param \{{{string}}\} {{msg}} {{超时信息}}{{}}
     */
    timeout: function (msg) {
    },
    /**
     * @name data
     * @desc {{description}}{{处理后端约定code, REM: 从外部传参重写}}
     * @param \{{{number}}\} {{code}} {{后端返回code}}{{}}
     */
    data: function (data) {
      data = data || {}
      var code = data.code
      // 根据返回的code值来做不同的处理（和后端约定）
      switch (code) {
        case '':
          break
        default:
          break
      }
    },
    /**
     * @name error
     * @desc {{description}}{{报错统一处理, REM: 从外部传参重写}}
     * @param \{{{errorInfo.message}}\} {{errorInfo}} {{错误信息}}{{}}
     * @param \{{{errorInfo.response.status}}\} {{errorInfo}} {{错误状态}}{{}}
     */
    error: function (errorInfo) {
      // 此处我使用的是 element UI 的提示组件
      // Message.error(`ERROR: ${err}`);
    },
    config: function (config) {
      // 可以用来控制登陆权限
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
      start: function () {
        // UI开始loading动画
      },
      end: function () {
        // UI结束loading动画
      }
    }
  }
}

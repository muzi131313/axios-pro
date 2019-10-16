/**
 * @file test/request/config/index.js
 * @description 全局统一处理配置
 * @createTime 2019年10月16日18:04:32
 */
import UserConfig from './user.js'
import RequestConfig from './request.js'

export default {
  ...UserConfig,
  ...RequestConfig
}

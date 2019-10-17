/**
 * @file test/request/config/index.js
 * @description 全局统一处理配置
 * @createTime 2019年10月16日18:04:32
 */
import CustomConfig from './custom'
import RequestConfig from './request'

export default {
  ...CustomConfig,
  ...RequestConfig
}

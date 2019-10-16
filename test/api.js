/**
 * @file test/api.js
 * @description 接口请求模块
 * @createTime 2019年10月16日18:10:39
 */
import axiosPro from '../index.js'
import request from './request/index.js'

let init = false

export default function api() {
  if (!init) {
    init = true
    axiosPro.inject(request)
  }
  else {
    return axiosPro
  }
}

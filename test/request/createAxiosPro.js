/**
 * @file test/api.js
 * @description 接口请求模块
 * @createTime 2019年10月16日18:10:39
 */
import axiosPro from '../../index'
import axiosProOption from './axiosProOption'

let init = false

export default function createAxiosPro() {
  if (!init) {
    init = true
    axiosPro.$inject(axiosProOption)
  }
  return axiosPro
}

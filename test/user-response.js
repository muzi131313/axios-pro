import response from './response'
import { WEB_URL } from './constant'

/**
 * @name getUsers
 * @description 用户列表
 * @created 2019年10月23日21:05:48
 */
export function getUsers() {
  return response
    .userList()
    .then(resp => resp.data)
}

/**
 * @name getUserName
 * @param {Number} userID 用户id
 * @description 获取用户详情
 * @created 2019年10月23日21:05:34
 */
export function getUserName(userID) {
  return response
    .userDetail(null, null, userID)
    .then(
      resp => resp.data
        ? resp.data.name
        : null
    )
}

/**
 * @name fetchUnknownURL
 * @description 访问一个未知的地址, 应该报错404
 * @created 2019年10月25日10:57:46
 */
export function fetchUnknownURL() {
  return new Promise((resolve, reject) => {
    response
      .notExist(null, {
        timeout: 3e3,
        baseURL: WEB_URL,
        handlers: {
          error: function(errorInfo) {
            console.error('[debug] errorInfo: ' + errorInfo)
            resolve(errorInfo && errorInfo.message)
          }
        }
      })
  })
}

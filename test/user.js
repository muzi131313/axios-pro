import request from './request'

/**
 * @name getUsers
 * @description 用户列表
 * @created 2019年10月23日21:05:48
 */
export function getUsers() {
  return request
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
  return request
    .userDetail(null, null, userID)
    .then(
      resp => resp.data.detail
        ? resp.data.detail.name
        : null
    )
}

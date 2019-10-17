import request from './request'

export function getUserName(userID) {
  return request.userList().then(users => {
    const userKey = userID + ''
    if (users[userKey]) {
      return users[userKey].name
    }
    return null
  })
}

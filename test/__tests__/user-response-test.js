import * as user from '../user-response'

it('normal usage', () => {
  expect.assertions(1)
  return user.getUsers().then(data => {
    return expect(data).toEqual([
      { name: 'Mark' },
      { name: 'Paul' }
    ])
  })
})

it('dynamic url, such as /api/user/:id', () => {
  expect.assertions(1)
  return user.getUserName(4).then(resp => {
    return expect(resp).toEqual('Mark')
  })
})

it('fetch an unknown url address, will get a 404 message', () => {
  expect.assertions(1)
  return user.fetchUnknownURL().then(message => {
    return expect(message).toEqual('请求地址出错')
  })
})

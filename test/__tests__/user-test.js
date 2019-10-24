import * as user from '../user'

it('normal usage', () => {
  expect.assertions(1)
  return user.getUsers().then(data => {
    return expect(data).toEqual([
      {
        name: 'Mark'
      },
      {
        name: 'Paul'
      }
    ])
  })
})

it('dynamic url, such as /api/user/:id', () => {
  expect.assertions(1)
  return user.getUserName(4).then(resp => {
    return expect(resp).toEqual('Mark')
  })
})

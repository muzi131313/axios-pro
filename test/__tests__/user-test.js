import * as user from '../user'

it('works with promises', () => {
  expect.assertions(1)
  return user.getUserName(4).then(data => {
    return expect(data).toEqual('Mark')
  })
})

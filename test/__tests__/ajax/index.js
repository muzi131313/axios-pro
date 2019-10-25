import ajax from '../../../src/ajax/index'

import { BASE_URL } from '../../constant'

it('api: ajax request', () => {
  expect.assertions(1)

  return ajax({
    baseURL: BASE_URL,
    url: '/users',
    params: null,
    method: 'get'
  }).then(resp => {
    return expect(resp.data).toEqual([
      { name: 'Mark' },
      { name: 'Paul' }
    ])
  })
})

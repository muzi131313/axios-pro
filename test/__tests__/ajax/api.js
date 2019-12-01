import api from '../../../src/ajax/api'

import { BASE_URL } from '../../constant'

it('api: get request', () => {
  expect.assertions(1)

  const get = api.get
  return get(
    '/users',
    null,
    { baseURL: BASE_URL }
  ).then(resp => {
    return expect(resp.data).toEqual([
      { name: 'Mark' },
      { name: 'Paul' }
    ])
  })
})

it('api: post request', () => {
  expect.assertions(1)

  const post = api.post
  return post('/user/new/add', null, { baseURL: BASE_URL })
    .then(resp => {
      return expect(resp.data).toEqual({ name: 'Jack' })
    })
})

it('api: put request', () => {
  expect.assertions(1)

  const put = api.put
  return put('/user/new/edit', null, { baseURL: BASE_URL })
    .then(resp => {
      return expect(resp.data).toEqual({ name: 'Jack' })
    })
})

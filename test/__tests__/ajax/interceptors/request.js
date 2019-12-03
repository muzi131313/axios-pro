import request from '../../../../src/ajax/interceptors/request'
import axiosPro from '../../../../src/index'

import { BASE_URL } from '../../../constant'

it('api: interceptors request', () => {
  expect.assertions(1)

  var baseConfig = {
    baseURL: BASE_URL
  }
  axiosPro.inject({
    mappers: {
      gets: {
        users: '/users'
      },
      posts: {},
      puts: {},
      dels: {},
      patches: {},
      heades: {}
    },
    config: baseConfig
  })

  var axios = request(axiosPro, baseConfig)
  return axios.api
    .users()
    .then(resp => {
      console.log('resp.data: ', resp.data)
      return expect(resp.data).toEqual([
        { name: 'Mark' },
        { name: 'Paul' }
      ])
    })
})

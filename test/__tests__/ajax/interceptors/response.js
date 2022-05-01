import request from '../../../../src/ajax/interceptors/request'
import response from '../../../../src/ajax/interceptors/response'

import { BASE_URL } from '../../../constant'

import axios from 'axios'

it('api: interceptors response', () => {
  expect.assertions(1)

  var baseConfig = {
    baseURL: BASE_URL
  }

  const url = '/users'
  const method = 'get'

  const option = {
    url,
    method
  }

  var instance = axios.create({
    baseURL: BASE_URL
  })

  var axiosProInstance = request(instance, baseConfig)
  response(instance, baseConfig)

  return axiosProInstance(option)
    .then(resp => {
      return expect(resp.data).toEqual([
        { name: 'Mark' },
        { name: 'Paul' }
      ])
    })
    .catch(e => {
      console.log('catch error: ')
      console.error(e)
    })
})

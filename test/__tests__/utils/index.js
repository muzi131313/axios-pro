import axiosProUtil from '../../../src/utils'

const combine = axiosProUtil.combine

// test data: objectA, objectB
const objectA = {
  gets: {
    queryOrg: 'api/v1/society/seal/site/query/org'
  },
  posts: {
    // 函数的名字, 登陆的访问url
    login: 'api/login-a',
    proxyUrl: 'api/proxy-url'
  },
  puts: {
    getDetail: 'api/id/detail'
  },
  dels: {
    getDetail: 'api/id/detail'
  },
  patches: {
    getDetail: 'api/id/detail'
  }
}
const objectB = {
  gets: {
  },
  posts: {
    // 函数的名字, 登陆的访问url
    login: 'api/login-b'
  }
}
const objectC = {
  gets: {
    queryGroup: 'api/v1/groups'
  }
}

it('combine two object, last object\'s same key\'s value will override the before one', () => {
  expect.assertions(1)

  const combineResult = combine(objectA, objectB)
  expect(combineResult.posts.login).toEqual('api/login-b')
})

it('combine multi object to one object, and different key will remain', () => {
  expect.assertions(7)

  const combineResult = combine(objectA, objectB, objectC)
  expect(combineResult.gets.queryGroup).toEqual('api/v1/groups')
  expect(combineResult.gets.queryOrg).toEqual('api/v1/society/seal/site/query/org')
  expect(combineResult.posts.login).toEqual('api/login-b')
  expect(combineResult.posts.proxyUrl).toEqual('api/proxy-url')
  expect(combineResult.puts.getDetail).toEqual('api/id/detail')
  expect(combineResult.dels.getDetail).toEqual('api/id/detail')
  expect(combineResult.patches.getDetail).toEqual('api/id/detail')
})

## axios接口封装插件

- [axios-pro-demo](https://github.com/muzi131313/axios-pro-demo)
- [TODO-List](./TODO.md)
- [CHANGELOG](./CHANGELOG.md)
- [Issue Template](./.github/ISSUE_TEMPLATE.md)

### 目的
- 错误处理
  - 统一错误处理, 统一UI提示
  - 超时处理
  - 后端正常返回的不同接口status统一的处理
- 统一token添加, 判断是否登录
- 请求loading动画
- 请求文件流处理, 以及文件名处理
  - 后台应在headers中添加filename的属性，值为文件名
- 接口工厂

### 推荐做法
- add api module
  ````
  .
  ├── App.vue
  ├── api
  │   ├── index.js
  │   └── modules
  │       ├── org.js
  │       └── seal.js
  ├── store
  │   ├── index.js
  │   └── modules
  │       ├── org.js
  │       └── seal.js
  ├── main.js
  ````
  - `store/index.js`:
    ````
    import org from '@/api/modules/org'
    import user from '@/api/modules/user'
    // ...
    // combine可以传一个或多个参数, 会合并每个modules的gets、posts、puts、dels、patches值
    const mappers = axiosPro.combine(
      org,
      seal
      // ...
    )
    const config = {
    }
    export default {
      mappers,
      config
    }
    ````
  - `api/modules/org.js`:
    ````
    const org = {
      gets: {
        queryOrg: 'api/v1/society/seal/site/query/org'
      },
      posts: {
      },
      puts: {
      },
      dels: {
      },
      patches: {
      }
    }
    export default org
    ````
  - `store/modules/org.js`:
    ````
    import axiosPro from 'axios-pro'

    export default {
      namespaced: true,
      actions: {
        async getOrgs({ commit }, payload) {
          const resp = await axiosPro.api.queryOrg({
            jsonConditions: {
              op: 'or',
              elements: [
                {
                  param: 'name',
                  op: 'contains',
                  values: '北京'
                }
              ]
            }
          })
          commit('SET_ORGS', resp.content)
        }
      },
    }
    ````
  - `main.js`:
    ````
    import axiosPro from 'axios-pro'
    import api from '@/api'
    const { mappers, config } = api
    Vue.use(axiosPro, {
      mappers,
      config
    })
    ````

### 详细用法

- init plugin
  - in `vue` environment

  ````
  import axiosPro from 'axios-pro'

  Vue.use(axiosPro, {
    mappers: {
      gets: {
        getDetail: '/id/detail',
        queryOrg: 'api/v1/society/seal/site/query/org'
      },
      posts: {
        // 函数的名字, 登陆的访问url
        login: '/login',
        proxyUrl: '/proxyUrl'
      },
      puts: {
        getDetail: '/id/detail'
      },
      dels: {
        getDetail: '/id/detail'
      },
      patches: {
        getDetail: '/id/detail'
      }
    },
    config: {
      handlers: {
        timeout (msg) {
          console.log('timeout: ', msg)
        },
        data (data = {}) {
          const code = data.code
          console.log('errorInfo: ', code)
        },
        error (errorInfo) {
          // 此处我使用的是 element UI 的提示组件
          // Message.error(`ERROR: ${err}`);
          console.log('errorInfo: ', errorInfo)
        },
        // this function was callback when the request was send before
        // if you has your own config, or want to intercept all the request before send
        config (config) {
          config.validateStatus = status => { // 成功状态码定义范围
            return status >= 200 && status < 300
          }
          // if (!Utils.isNotLogin()) {
          //     config.headers['X-Token'] = Utils.getToken() // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
          // } else {
          //     // 重定向到登录页面
          //     window.location.href = 'login'
          // }
        },
        loading: {
          // 是否开启动画, 默认关闭, 需要请求中主动开启
          open: false,
          start () {
            // UI开始loading动画
          },
          end () {
            // UI结束loading动画
          }
        }
      }
    }
  })
  ````
  - in `node` environment
  ````
  import axiosPro from 'axios-pro'
  axiosPro.inject({
    mappers: {
      gets: {
        getDetail: '/id/detail',
      }
      // ...
    },
    config: {
      // ...
    }
  })
  ````
- use plugin
  - in `vue` environment

  ````
  async init () {
    // two params, one was `params`, second was `options` that cound be overwrite axios default options
    // if necessary, the second param `options` was not need transfer
    const resp = await this.$api.queryOrg({
      jsonConditions: {
        op: 'or',
        elements: [
          {
            param: 'name',
            op: 'contains',
            values: '北京'
          }
        ]
      }
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      handlers: {
        data (data = {}) {
          const code = data.code
          // 根据返回的code值来做不同的处理（和后端约定）
          switch (code) {
            case '':
              break
            default:
              break
          }
          // 若不是正确的返回code，且已经登录，就抛出错误
          // const err = new Error(data.description)

          // err.data = data
          // err.response = response

          // throw err
        },
        loading: {
          // 是否开启动画, 默认关闭, 需要请求中主动开启
          open: true
        }
      }
    })
    console.log('resp: ', resp)
  }
  ````
  - in `node` environment
  ````
  import axiosPro from 'axios-pro'
  init() {
    axiosPro.api.getDetail()
      .then(data => {
        // ...
      })
      .catch(e => {
        // ...
      })
  }
  ````
### 常见问题
- formdata传参
````
// 自己处理参数
const data = await this.$api.login({
  username: tel,
  password
}, {
  // 对参数进行处理
  transformRequest: [
    function(oldData){
      let newStr = ''
      for (let item in oldData){
        newStr += encodeURIComponent(item) + '=' + encodeURIComponent(oldData[item]) + '&'
      }
      newStr = newStr.slice(0, -1)
      return newStr
    }
  ],
  // 更改为form格式
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})
// 或者
const qs = require('qs')
const data = await this.$api.login(qs.stringify({
  username: tel,
  password
}), {
  // 更改为form格式
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})
````
- url动态拼接
````
// api/modules/user.js
const user = {
  gets: {
    userInfo: userId => `user/info/${userId}`,
    companyInfo: ({ userId, companyId }) => `user/company/${userId}/${companyId}`
  },
  posts: {
  },
  puts: {
  },
  dels: {
  },
  patches: {
  }
}
export default user
// usage
const userId = '119'
const companyId = '21'
this.$api.userInfo(null, null, userId)
this.$api.userInfo(null, null, { companyId, userId })
````

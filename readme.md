# axios-pro
[![npm version](https://img.shields.io/npm/v/axios-pro.svg?style=flat-square)](https://www.npmjs.org/package/axios-pro)
[![build status](https://travis-ci.org/muzi131313/axios-pro.svg?branch=master)](https://travis-ci.org/muzi131313/axios-pro)
[![Coverage Status](https://coveralls.io/repos/github/muzi131313/axios-pro/badge.svg)](https://coveralls.io/github/muzi131313/axios-pro)
![license: MIT](https://img.shields.io/badge/License-MIT-blue.svg)


## docs
- [axios-pro-demo](https://github.com/muzi131313/axios-pro-demo)
- [TODO-List](./TODO.md)
- [CHANGELOG](./CHANGELOG.md)
- [Issue Template](./.github/ISSUE_TEMPLATE.md)

## axios plugin
- 错误处理
  - 统一错误处理, 统一UI提示
  - 超时处理
  - 后端正常返回的不同接口status统一的处理
- 统一token添加, 判断是否登录
- 请求loading动画
- 请求文件流处理, 以及文件名处理
  - 后台应在headers中添加filename的属性，值为文件名
- 接口工厂

## recommend usage
### add api module
- file folders
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
- api code
  - <details>
      <summary> api/modules/org.js: </summary>

      ```javascript
      const org = {
        gets: {
          queryOrg: 'api/v1/society/seal/site/query/org'
        },
        posts: {},
        puts: {},
        dels: {},
        patches: {},
        heades: {}
      }
      export default org
      ```
    </details>
  - <details>
      <summary> api/index.js: </summary>

      ````javascript
      import org from '@/api/modules/org'
      import user from '@/api/modules/user'
      // ...
      // combine可以传一个或多个参数, 会合并每个modules的gets、posts、puts、dels、patches, heades值
      const mappers = axiosPro.combine(
        org,
        seal
        // ...
      )
      const config = {}
      export default {
        mappers,
        config
      }
      ````
    </details>
- init in vue
  - <details>
      <summary> main.js: </summary>

      ```javascript
      import axiosPro from 'axios-pro'
      import api from '@/api'
      const { mappers, config } = api
      Vue.use(axiosPro, {
        mappers,
        config
      })
      ```
    </details>
- use in store
  - <details>
      <summary> store/modules/org.js: </summary>

      ```javascript
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
      ```
    </details>
- use in vue
  - <details>
      <summary> init method in vue class</summary>

      ```javascript
      created() {
        this.init()
      },
      methods: {
        async init () {
          // request params/data
          const params = {}
          // axios options
          const axiosOptions = {}
          // custom options
          const customOptions = {
            handlers: {
              language: null,
              languageOption: null,
              timeout: msg => {},
              data: data => {},
              error: errorInfo => {},
              config: config => {},
              loading: {
                open: true,
                start: () => {},
                end: () => {}
              }
            }
          }
          // if you don't need overwrite this option and there is exist third param, this should set `null`;
          //    eg: this.$api.queryOrg(null, null, 1)
          // if there is not exist thrid param, you can don't transmit this value
          //    eg: this.$api.queryOrg(null)
          const usageOptions = {
            ...axiosOptions,
            ...customOptions
          }
          // when use dynamic url, should transmit this value
          // eg: `/api/org/detail/:id`,
          //    define url: { gets: { queryOrg: id => `/api/org/detail/${id}` } }
          //    usage: this.$api.queryOrg(null, null, 123)
          // eg: `/api/org/upload/:book/:name`
          //    define url: { gets: { queryOrg: ({book, name}) => `/api/org/upload/${book}/${name}}}
          //    usage: this.$api.queryOrg(null, null, { book: 'javascript', name: 'JavaScript-The-Definitive-Guide.pdf' })
          const dynamicURL = null
          // queryOrg: is defined in `api/modules/org.js`
          const resp = await this.$api.queryOrg(params, usageOptions, dynamicURL)
        }
      }
      ```
    </details>
### init in different environment

- <details>
    <summary> in vue environment </summary>

    ````javascript
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
  </details>
- <details>
    <summary> in node environment</summary>
    ````javascript
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
  </details>
### use in different environment
- <details>
    <summary> in vue environment </summary>

    ````javascript
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
  </details>
- <details>
    <summary> in node environment </summary>
    ````javascript
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
  </details>
## Q&S
### formdata传参
- <details>
    <summary> use transformRequest </summary>

    ```javascript
    // handle params when usage
    const data = await this.$api.login({
      username: tel,
      password
    }, {
      // handle params
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
      // change to form params
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    ```
  </details>
- <details>
    <summary> use qs lib </summary>

    ```javascript
    const qs = require('qs')
    const data = await this.$api.login(qs.stringify({
      username: tel,
      password
    }), {
      // change to form params
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    ```
  </details>

### when url is dynamic
- init function, send third params
  - <details>
    <summary>api/modules/user.js</summary>

    ```javascript
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
    ```
    </details>
  - <details>
    <summary>usage</summary>

    ```javascript
    const userId = '119'
    const companyId = '21'
    this.$api.userInfo(null, null, userId)
    this.$api.userInfo(null, null, { companyId, userId })
    ```
    </details>

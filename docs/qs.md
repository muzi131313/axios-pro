## vue-cli3项目增加对IE9的支持
- 在`vue.config.js`中的`chainWebpack`增加对`axios-pro`的转换
```
// 4.调试用, 增加include, babel转换
config.module.rule('compile')
  .test(/\.js$/)
  .include
    .add(path.resolve('src'))
    .add(path.resolve('node_modules/axios-pro'))
    .end()
  .use('babel')
    .loader('babel-loader')
    .options({
      presets: [
        ['@babel/preset-env', {
          modules: 'auto'
        }]
      ]
    })
```

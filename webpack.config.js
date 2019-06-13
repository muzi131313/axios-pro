const webpack = require('webpack')

const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path')

module.exports = {
  entry: {
    'axios.pro': './src/index.js',
    'axios.pro.min': './src/index.js'
  },
  output: {
    filename: '[name].js',
    libraryExport: 'default',
    library: 'axiosPro', // 指定类库名,主要用于直接引用的方式(比如使用script 标签)
    libraryTarget: 'umd', // 定义打包方式Universal Module Definition,同时支持在CommonJS、AMD和全局变量使用
    globalObject: 'this', // 定义全局变量,兼容node和浏览器运行，避免出现"window is not defined"的情况
    umdNamedDefine: true
  },
  mode: 'production', // 告诉webpack使用production模式的内置优化,
  devtool: 'source-map', // 开启sourceMap，方便调试
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJSPlugin({
        include: /\.min\.js$/
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        exclude: [ /node_modules/ ],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [
          path.resolve(__dirname, 'src')
        ],
        exclude: [ /node_modules/ ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': process.env.NODE_ENV
    }),
    new CleanWebpackPlugin([
      'dist'
    ])
  ]
}

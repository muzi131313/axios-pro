const webpack = require('webpack')

const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
  entry: {
    'axios.pro': './src/index.js',
    'axios.pro.min': './src/index.js'
  },
  output: {
    filename: '[name].js',
    libraryExport: 'default',
    library: 'axiosPro',
    libraryTarget: 'commonjs2'
  },
  devtool: 'source-map',
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

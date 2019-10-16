const config = {
  babelrc: false,
  presets: [
    [ '@babel/preset-env', {
      targets: { node: 'current' }
    } ]
  ],
  plugins: [
    '@babel/transform-runtime'
  ]
}

module.exports = require('babel-jest').createTransformer(config)

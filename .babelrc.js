module.exports = {
  'presets': [
    [ '@babel/preset-env', {
      // https://babeljs.io/docs/en/babel-preset-env#modules
      // 不转换
      'modules': false,
      // https://babeljs.io/docs/en/babel-preset-env#usebuiltins
      'useBuiltIns': 'usage',
      'corejs': { 'version': 3, 'proposals': true },
      'shippedProposals': true
    } ]
  ],
  plugins: [
    [ "@babel/plugin-transform-runtime", {
      "corejs": 3,
      "proposals": true
    }]
  ],
  ignore: [
    'dist/*.js'
  ]
}

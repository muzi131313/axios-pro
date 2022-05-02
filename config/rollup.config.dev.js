// import json from 'rollup-plugin-json'
// import babel from 'rollup-plugin-babel'
// import resolve from 'rollup-plugin-node-resolve'
// import replace from 'rollup-plugin-replace'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import { babel } from '@rollup/plugin-babel'

import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import clear from 'rollup-plugin-clear'
import { eslint } from 'rollup-plugin-eslint'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/axios.pro.js',
    // 格式化方式: commonjs
    // format: 'cjs'
    format: 'umd',
    name: 'axios.pro',
    sourcemap: true
  },
  plugins: [
    eslint(),
    clear({
      targets: [ 'dist' ]
    }),
    commonjs(),
    json(),
    resolve({
      browser: true
    }),
    babel({
      // runtimeHelpers: true,
      babelHelpers: 'runtime',
      exclude: [
        // 只编译我们的源代码
        'node_modules/**',
        // 刨除json文件
        '**/*.json'
      ]
    }),
    replace({
      preventAssignment: true,
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ]
}

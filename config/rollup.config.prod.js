import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import { uglify } from 'rollup-plugin-uglify'

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/axios.pro.min.js',
    // 格式化方式: commonjs
    // format: 'cjs'
    format: 'umd',
    name: 'axios.pro.min',
    sourcemap: false
  },
  plugins: [
    commonjs(),
    resolve({
      browser: true
    }),
    json(),
    babel({
      runtimeHelpers: true,
      exclude: [
        // 只编译我们的源代码
        'node_modules/**',
        '**/*.json'
      ]
    }),
    replace({
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    (process.env.NODE_ENV === 'production' && uglify())
  ]
}

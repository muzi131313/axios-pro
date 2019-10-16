import axiosPro from '../../index.js'

import book from './modules/book.js'
import order from './modules/order.js'
import user from './modules/user.js'

import config from './config.js'

const mappers = axiosPro.combine(
  book,
  order,
  user
)

export default {
  mappers,
  config
}

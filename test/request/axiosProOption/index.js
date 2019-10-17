import axiosPro from '../../../index'

import book from './modules/book'
import order from './modules/order'
import user from './modules/user'

import config from './config'

const mappers = axiosPro.combine(
  book,
  order,
  user
)

export default {
  mappers,
  config
}

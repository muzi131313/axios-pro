var { EN_TYPE, CN_TYPE } = require('../constant')
var en = require('./en')
var cn = require('./cn')

/**
 * @name getLanguage
 * @description 获取语言版本
 * @created 2019年10月25日10:38:47
 */
module.exports = function getLanguage(type, languageOption) {
  switch (type) {
    case EN_TYPE:
      return en
    case CN_TYPE:
      return cn
    default:
      return languageOption || {}
  }
}

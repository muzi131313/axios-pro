/**
 * @name combine
 * @desc combine to obj to one obj(only support deep of one)
 *  var a = { a: 123 }; var b = { b: 333 };
 *  var c = combine(a, b); // { a: 123, b: 333 }
 * @param {object} objA
 * @param {object} objB
 * @createTime 2019年02月21日16:08:38
 */
var combine = function() {
  var more = Array.prototype.slice.call(arguments)
  if (!more) {
    return console.warn('combine() require at least one params')
  }
  // only one parameter
  if (more.length === 1) {
    return more[0]
  }
  // has two or more than two parameters
  var objs = more
  objs = objs.sort(function (a, b) {
    return Object.keys(b).length - Object.keys(a).length
  })
  var baseObj = objs[0]
  var baseKeys = Object.keys(baseObj)
  var obj = {}
  baseKeys.forEach(function (baseKey) {
    obj[baseKey] = objs.reduce(function (cur, obj) {
      return Object.assign(cur, obj[baseKey])
    }, {})
  })
  return obj
}

/**
 * @name objType
 * @desc {{description}}{{获取数据的obj类型}}
 * @param {Object} obj 要获取类型的obj值
 * @createTime 2019年02月26日10:04:52
 */
var objType = function (obj) {
  return Object.prototype.toString
    .call(obj)
    .replace('[object ', '')
    .replace(']', '')
    .toLowerCase()
}

module.exports = {
  combine,
  objType
}

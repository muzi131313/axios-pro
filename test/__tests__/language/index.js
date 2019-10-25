import cn from '../../../src/language/cn'
import en from '../../../src/language/en'

it('cn msg should same with the en msg, except value', () => {
  expect.assertions(2)

  const cnKeys = Object.keys(cn.msg)
  const cnLength = cnKeys.length
  const enKeys = Object.keys(en.msg)
  const enLength = enKeys.length

  expect(cnKeys).toEqual(enKeys)
  expect(cnLength).toEqual(enLength)
})

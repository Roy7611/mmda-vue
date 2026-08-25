import { describe, expect, it } from 'vitest'
import {
  isArray,
  isBoolean,
  isDate,
  isEmpty,
  isFunction,
  isMap,
  isMobile,
  isNullObject,
  isNullOrUndefined,
  isNumber,
  isObject,
  isPlainObject,
  isPromise,
  isPromiseLike,
  isRefNone,
  isRegExp,
  isSet,
  isString,
  isSymbol,
  toTypeString,
} from '../utils/is'

describe('is', () => {
  it('空值与占位', () => {
    expect(isNullOrUndefined(undefined)).toBe(true)
    expect(isNullOrUndefined(null)).toBe(true)
    expect(isNullOrUndefined(0)).toBe(false)
    expect(isRefNone(null)).toBe(true)
    expect(isRefNone('0')).toBe(true)
    expect(isRefNone('1')).toBe(false)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty([])).toBe(true)
    expect(isEmpty([1])).toBe(false)
  })

  it('基本类型守卫', () => {
    expect(isBoolean(true)).toBe(true)
    expect(isBoolean(0)).toBe(false)
    expect(isNumber(1)).toBe(true)
    expect(isNumber('1')).toBe(false)
    expect(isString('a')).toBe(true)
    expect(isSymbol(Symbol('x'))).toBe(true)
    expect(isArray([1])).toBe(true)
    expect(isArray({ length: 1 })).toBe(false)
    expect(isFunction(() => 1)).toBe(true)
    expect(isFunction({})).toBe(false)
  })

  it('对象形态', () => {
    expect(isObject(null)).toBe(false)
    expect(isObject([])).toBe(true)
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject([])).toBe(false)
    expect(isNullObject({})).toBe(true)
    expect(isNullObject({ a: 1 })).toBe(false)
    expect(isMap(new Map())).toBe(true)
    expect(isSet(new Set())).toBe(true)
    expect(isDate(new Date())).toBe(true)
    expect(isRegExp(/a/)).toBe(true)
    expect(toTypeString([])).toBe('[object Array]')
  })

  it('Promise：真 Promise 两边都认；thenable 函数只认 isPromiseLike', () => {
    const p = Promise.resolve(1)
    expect(isPromise(p)).toBe(true)
    expect(isPromiseLike(p)).toBe(true)
    expect(isPromise({})).toBe(false)
    expect(isPromise({ then() {}, catch() {} })).toBe(true)

    const thenableFn = Object.assign(function () {}, {
      then() {},
      catch() {},
    })
    expect(isPromise(thenableFn)).toBe(false)
    expect(isPromiseLike(thenableFn)).toBe(true)
  })

  it('isMobile 在 Node 为 false', () => {
    expect(isMobile()).toBe(false)
  })
})

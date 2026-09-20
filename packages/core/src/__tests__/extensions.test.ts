import { DateTime } from 'luxon'
import { describe, expect, it } from 'vitest'
import {
  nonNullArray,
  nonUndefinedArray,
} from '../utils/array'
import { DateUtils, tryParseDate } from '../utils/datetime'
import { hasBit, toPrecise } from '../utils/number'
import {
  firstLetterLower,
  firstLetterUpper,
  thousandDigitFormat,
  toPascalCase,
} from '../utils/string'

describe('string helpers', () => {
  it('空串不抛错', () => {
    expect(firstLetterLower('')).toBe('')
    expect(firstLetterUpper('')).toBe('')
    expect(toPascalCase('')).toBe('')
  })

  it('首字母大小写', () => {
    expect(firstLetterLower('Foo')).toBe('foo')
    expect(firstLetterUpper('foo')).toBe('Foo')
    expect(toPascalCase('warehouse')).toBe('Warehouse')
  })

  it('thousandDigitFormat 千分位', () => {
    expect(thousandDigitFormat('1234.5')).toBe('1,234.5')
    expect(thousandDigitFormat('1234567')).toBe('1,234,567')
  })
})

describe('number helpers', () => {
  it('hasBit 按位包含', () => {
    const READ = 1
    const EDIT = 2
    const both = READ | EDIT
    expect(hasBit(both, READ)).toBe(true)
    expect(hasBit(both, EDIT)).toBe(true)
    expect(hasBit(EDIT, READ)).toBe(false)
  })

  it('toPrecise 去掉尾零', () => {
    expect(toPrecise(1.23, 6)).toBe('1.23')
    expect(toPrecise(2, 2)).toBe('2')
  })
})

describe('DateUtils SQL 与差值', () => {
  const sql = '2024-01-02 03:04:05'
  const d = DateTime.fromSQL(sql).toJSDate()

  it('toSQL / toSQLDate / toSQLTime 无 offset', () => {
    expect(DateUtils.toSQL(d)).toMatch(/^2024-01-02 03:04:05/)
    expect(DateUtils.toSQLDate(d)).toBe('2024-01-02')
    expect(DateUtils.toSQLTime(d)).toMatch(/^03:04:05/)
  })

  it('fromSQL 空值和无效输入返回 null', () => {
    expect(DateUtils.fromSQL()).toBeNull()
    expect(DateUtils.fromSQL('')).toBeNull()
    expect(DateUtils.fromSQL('not-a-date')).toBeNull()
    expect(tryParseDate('')).toBeNull()
    expect(tryParseDate('nope', d)).toBe(d)
  })

  it('fromSQL / tryParseDate 解析合法 SQL', () => {
    const parsed = DateUtils.fromSQL(sql)
    expect(parsed).toBeInstanceOf(Date)
    expect(DateUtils.toSQLDate(parsed!)).toBe('2024-01-02')
    expect(DateUtils.toSQLDate(tryParseDate(sql)!)).toBe('2024-01-02')
  })

  it('weekday / startOf 以第一个参数为日期', () => {
    // 2024-01-01 是周一
    const monday = DateTime.fromSQL('2024-01-01 12:00:00').toJSDate()
    expect(DateUtils.weekday(monday)).toBe(1)
    expect(DateUtils.toSQLTime(DateUtils.startOf(monday, 'day'))).toMatch(
      /^00:00:00/,
    )
    expect(DateUtils.weekday(DateUtils.weekStart(monday))).toBe(1)
    expect(DateUtils.toSQLDate(DateUtils.yesterday(monday))).toBe('2023-12-31')
  })

  it('calculateDiff 以第一个参数为起点，保留时分秒', () => {
    const start = DateTime.fromSQL('2024-01-01 00:00:00').toJSDate()
    const end = DateTime.fromSQL('2024-01-03 12:00:00').toJSDate()
    expect(DateUtils.calculateDiff(start, end, 'd')).toBe(2.5)
    expect(DateUtils.calculateDiff(start, end, 'h')).toBe(60)
  })
})

describe('array skip helpers', () => {
  it('nonUndefinedArray 只去掉 undefined，留下 null', () => {
    expect(nonUndefinedArray([1, undefined, null, 2])).toEqual([1, null, 2])
  })

  it('nonNullArray 去掉 undefined 和 null', () => {
    expect(nonNullArray([1, undefined, null, 2])).toEqual([1, 2])
  })
})

import { DateTime } from 'luxon'
import { describe, expect, it } from 'vitest'
import '../extensions/array_extensions'
import { tryParseDate } from '../extensions/datetime_extensions'
import { hasBit } from '../extensions/number_extensions'
import { toCamel } from '../extensions/string_extensions'

describe('string extensions', () => {
  it('空串不抛错', () => {
    expect(''.firstLetterLower()).toBe('')
    expect(''.firstLetterUpper()).toBe('')
    expect(toCamel('')).toBe('')
  })

  it('首字母大小写', () => {
    expect('Foo'.firstLetterLower()).toBe('foo')
    expect('foo'.firstLetterUpper()).toBe('Foo')
    expect(toCamel('warehouse')).toBe('Warehouse')
  })
})

describe('number extensions', () => {
  it('hasBit 按位包含', () => {
    const READ = 1
    const EDIT = 2
    const both = READ | EDIT
    expect(hasBit(both, READ)).toBe(true)
    expect(hasBit(both, EDIT)).toBe(true)
    expect(hasBit(EDIT, READ)).toBe(false)
  })

  it('toPrecise 去掉尾零', () => {
    expect((1.23 as number).toPrecise(6)).toBe('1.23')
    expect((2 as number).toPrecise(2)).toBe('2')
  })
})

describe('Date SQL 与差值', () => {
  const sql = '2024-01-02 03:04:05'
  const d = DateTime.fromSQL(sql).toJSDate()

  it('toSQL / toSQLDate / toSQLTime 无 offset', () => {
    expect(d.toSQL()).toMatch(/^2024-01-02 03:04:05/)
    expect(d.toSQLDate()).toBe('2024-01-02')
    expect(d.toSQLTime()).toMatch(/^03:04:05/)
  })

  it('fromSQL 空值和无效输入返回 null', () => {
    expect(d.fromSQL()).toBeNull()
    expect(d.fromSQL('')).toBeNull()
    expect(d.fromSQL('not-a-date')).toBeNull()
    expect(tryParseDate('')).toBeNull()
    expect(tryParseDate('nope', d)).toBe(d)
  })

  it('fromSQL / tryParseDate 解析合法 SQL', () => {
    const parsed = d.fromSQL(sql)
    expect(parsed).toBeInstanceOf(Date)
    expect(parsed!.toSQLDate()).toBe('2024-01-02')
    expect(tryParseDate(sql)?.toSQLDate()).toBe('2024-01-02')
  })

  it('weekday / startOf 用 this，不再另传 Date', () => {
    // 2024-01-01 是周一
    const monday = DateTime.fromSQL('2024-01-01 12:00:00').toJSDate()
    expect(monday.weekday()).toBe(1)
    expect(monday.startOf('day').toSQLTime()).toMatch(/^00:00:00/)
    expect(monday.weekStart().weekday()).toBe(1)
    expect(monday.yesterday().toSQLDate()).toBe('2023-12-31')
  })

  it('calculateDiff 用 this 当起点，保留时分秒', () => {
    const start = DateTime.fromSQL('2024-01-01 00:00:00').toJSDate()
    const end = DateTime.fromSQL('2024-01-03 12:00:00').toJSDate()
    expect(start.calculateDiff(end, 'd')).toBe(2.5)
    expect(start.calculateDiff(end, 'h')).toBe(60)
  })
})

describe('array skipUndefined', () => {
  it('只去掉 undefined，留下 null', () => {
    expect([1, undefined, null, 2].skipUndefined()).toEqual([1, null, 2])
  })
})

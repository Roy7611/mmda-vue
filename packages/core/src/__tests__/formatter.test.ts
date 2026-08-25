import { DateTime } from 'luxon'
import { describe, expect, it } from 'vitest'
import {
  daysBetween,
  encodeUriAndFix,
  formatAmount,
  formatFileSize,
  friendlyDays,
  friendlyHours,
  friendlySeconds,
  getParams,
  getParmas,
  n1,
  n2,
  n3,
  n4,
  preciseRound,
  relativeTime,
} from '../utils/formatter'

describe('数值位数', () => {
  it('n1–n4 按固定小数位四舍五入', () => {
    expect(n1(1.25)).toBe('1.3')
    expect(n2(2.345)).toBe('2.35')
    expect(n3(1)).toBe('1.000')
    expect(n4(1.2)).toBe('1.2000')
  })
})

describe('时长', () => {
  it('friendlySeconds 会 rescale 进位', () => {
    expect(friendlySeconds(60, 'en')).toMatch(/minute/i)
    expect(friendlySeconds(345600, 'en')).toMatch(/day/i)
  })

  it('friendlyHours 不进位成天', () => {
    const text = friendlyHours(48, 'en')
    expect(text).toMatch(/hour/i)
    expect(text).not.toMatch(/day/i)
  })

  it('friendlyDays 用中文单位拼接', () => {
    expect(friendlyDays(10)).toMatch(/周/)
    expect(friendlyDays(1)).toBe('1天')
  })

  it('relativeTime / daysBetween 认 SQL 日期', () => {
    const past = DateTime.now().minus({ days: 3 }).toFormat('yyyy-MM-dd HH:mm:ss')
    expect(relativeTime(past, 'en')).toMatch(/day/i)
    expect(
      daysBetween('2024-01-01 00:00:00', '2024-01-04 00:00:00', 'en'),
    ).toMatch(/3/)
  })
})

describe('金额与文件大小', () => {
  it('formatFileSize 按 1024 进位', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(1024)).toBe('1.00 KB')
    expect(formatFileSize(String(1024 * 1024))).toBe('1.00 MB')
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.00 GB')
  })

  it('formatAmount 千分位，非法输入为 0.00', () => {
    expect(formatAmount(1234.5)).toBe('1,234.50')
    expect(formatAmount('-2000')).toBe('-2,000.00')
    expect(formatAmount('abc')).toBe('0.00')
    expect(formatAmount(12, 0)).toBe('12')
  })

  it('preciseRound 保留符号和小数位', () => {
    expect(preciseRound(1.225, 2)).toBe(1.23)
    expect(preciseRound(-1.5, 0)).toBe(-1)
    expect(preciseRound(0, 2)).toBe(0)
  })
})

describe('URL', () => {
  it('encodeUriAndFix 编码 hash 等符号', () => {
    expect(encodeUriAndFix('https://x.test/a#b')).toContain('%23')
  })

  it('getParams 解析 query，getParmas 是别名', () => {
    const q = getParams('https://x.test/a?id=1&tag=a&tag=b')
    expect(q.id).toBe('1')
    expect(q.tag).toEqual(['a', 'b'])
    expect(getParmas).toBe(getParams)
  })
})

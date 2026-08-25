import { DateTime } from 'luxon'
import { describe, expect, it } from 'vitest'
import {
  DateRangeKind,
  dateTimeRange,
  toDateRange,
} from '../utils/date_range'

describe('dateTimeRange', () => {
  it('TODAY 落在当天起止', () => {
    const now = DateTime.now()
    const today = dateTimeRange[DateRangeKind.TODAY]()
    expect(today.start.toISODate()).toBe(now.toISODate())
    expect(today.end.toISODate()).toBe(now.toISODate())
    expect(today.start.equals(now.startOf('day'))).toBe(true)
    expect(today.end.equals(now.endOf('day'))).toBe(true)
    const js = toDateRange(today)
    expect(js.start.getTime()).toBe(today.start.toMillis())
    expect(js.end.getTime()).toBe(today.end.toMillis())
  })

  it('LAST_7_DAYS 含今天共 7 个日历日', () => {
    const range = dateTimeRange[DateRangeKind.LAST_7_DAYS]()
    const days = range.end.startOf('day').diff(range.start.startOf('day'), 'days').days
    expect(days).toBe(6)
  })

  it('YESTERDAY 整段在今天之前', () => {
    const y = dateTimeRange[DateRangeKind.YESTERDAY]()
    const today = dateTimeRange[DateRangeKind.TODAY]()
    expect(y.end.toMillis()).toBeLessThan(today.start.toMillis())
  })

  it('key 对齐 DateRangeKind，不含 EARLIER', () => {
    expect(dateTimeRange[DateRangeKind.THIS_MONTH]).toBeTypeOf('function')
    expect(
      (dateTimeRange as Record<string, unknown>)[DateRangeKind.EARLIER],
    ).toBeUndefined()
  })
})

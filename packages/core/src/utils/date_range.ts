import { DateTime } from 'luxon'

/**
 * 预定义日期时间范围。区间算法见 utils/date_range 的 dateTimeRange。
 */
export enum DateRangeKind {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  THIS_WEEK = 'THIS_WEEK',
  LAST_WEEK = 'LAST_WEEK',
  LAST_7_DAYS = 'LAST_7_DAYS',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  LAST_30_DAYS = 'LAST_30_DAYS',
  THIS_QUARTER = 'THIS_QUARTER',
  LAST_QUARTER = 'LAST_QUARTER',
  THIS_YEAR = 'THIS_YEAR',
  LAST_YEAR = 'LAST_YEAR',
  /** 筛选项哨兵，没有对应的 dateTimeRange 函数 */
  EARLIER = 'EARLIER',
}

export interface DateRange {
  start: Date
  end: Date
}

export interface DateTimeRange {
  start: DateTime
  end: DateTime
}

const today = (): DateTimeRange => {
  const d = DateTime.now()
  return { start: d.startOf('day'), end: d.endOf('day') }
}

const yesterday = (): DateTimeRange => {
  const d = DateTime.now().minus({ days: 1 })
  return { start: d.startOf('day'), end: d.endOf('day') }
}

const lastDays = (n: number): DateTimeRange => {
  const d = DateTime.now()
  return {
    start: d.minus({ days: n - 1 }).startOf('day'),
    end: d.endOf('day'),
  }
}
const last7Days = () => lastDays(7)
const last30Days = () => lastDays(30)

const thisWeek = (): DateTimeRange => {
  const d = DateTime.now()
  return { start: d.startOf('week'), end: d.endOf('week') }
}
const lastWeek = (): DateTimeRange => {
  const d = DateTime.now().minus({ days: 7 })
  return { start: d.startOf('week'), end: d.endOf('week') }
}
const thisMonth = (): DateTimeRange => {
  const d = DateTime.now()
  return { start: d.startOf('month'), end: d.endOf('month') }
}
const lastMonth = (): DateTimeRange => {
  const d = DateTime.now().minus({ months: 1 })
  return { start: d.startOf('month'), end: d.endOf('month') }
}

const thisQuarter = (): DateTimeRange => {
  const d = DateTime.now()
  return { start: d.startOf('quarter'), end: d.endOf('quarter') }
}
const lastQuarter = (): DateTimeRange => {
  const d = DateTime.now().minus({ quarters: 1 })
  return { start: d.startOf('quarter'), end: d.endOf('quarter') }
}

const thisYear = (): DateTimeRange => {
  const d = DateTime.now()
  return { start: d.startOf('year'), end: d.endOf('year') }
}
const lastYear = (): DateTimeRange => {
  const d = DateTime.now().minus({ years: 1 })
  return { start: d.startOf('year'), end: d.endOf('year') }
}

/**
 * 从 `DateTimeRange` 转为 JS `Date` 区间。
 */
export const toDateRange = (dtRange: DateTimeRange): DateRange => {
  return {
    start: dtRange.start.toJSDate(),
    end: dtRange.end.toJSDate(),
  }
}

export type DateTimeRangeFn = () => DateTimeRange

/** `EARLIER` 只是筛选项哨兵，没有对应区间函数。 */
export type DateTimeRangeKind = Exclude<DateRangeKind, DateRangeKind.EARLIER>

/**
 * 预定义日期区间（luxon）。key 与 {@link DateRangeKind} 对齐。
 */
export const dateTimeRange: Record<DateTimeRangeKind, DateTimeRangeFn> = {
  [DateRangeKind.TODAY]: today,
  [DateRangeKind.YESTERDAY]: yesterday,
  [DateRangeKind.THIS_WEEK]: thisWeek,
  [DateRangeKind.LAST_WEEK]: lastWeek,
  [DateRangeKind.LAST_7_DAYS]: last7Days,
  [DateRangeKind.THIS_MONTH]: thisMonth,
  [DateRangeKind.LAST_MONTH]: lastMonth,
  [DateRangeKind.LAST_30_DAYS]: last30Days,
  [DateRangeKind.THIS_QUARTER]: thisQuarter,
  [DateRangeKind.LAST_QUARTER]: lastQuarter,
  [DateRangeKind.THIS_YEAR]: thisYear,
  [DateRangeKind.LAST_YEAR]: lastYear,
}

import {
  DateTime,
  Duration,
  type DateTimeUnit,
  type DurationLike,
  type WeekdayNumbers,
} from 'luxon'

function fromSqlOrNull(value?: string): Date | null {
  if (!value) return null
  const dt = DateTime.fromSQL(value)
  return dt.isValid ? dt.toJSDate() : null
}

/** 日期工具：不修改全局 Date.prototype，全部以纯函数提供。 */
export const DateUtils = {
  fromSQL(value?: string): Date | null {
    return fromSqlOrNull(value)
  },

  toSQL(date: Date): string {
    return DateTime.fromJSDate(date).toSQL({ includeOffset: false }) ?? ''
  },

  toFormat(date: Date, format: string): string {
    return DateTime.fromJSDate(date).toFormat(format)
  },

  toSQLDate(date: Date): string {
    return DateTime.fromJSDate(date).toSQLDate() ?? ''
  },

  toSQLTime(date: Date): string {
    return DateTime.fromJSDate(date).toSQLTime({ includeOffset: false }) ?? ''
  },

  toRelative(date: Date): string {
    return DateTime.fromJSDate(date).toRelative() ?? ''
  },

  isAfter(date: Date, other: Date): boolean {
    return date > other
  },

  isBefore(date: Date, other: Date): boolean {
    return date < other
  },

  isEquals(date: Date, other: Date): boolean {
    return date.getTime() === other.getTime()
  },

  calculateDiff(
    start: Date,
    end: Date,
    format: 'h' | 'd' | 'w' | 'm' | 'y' = 'h',
  ): number {
    const from = DateTime.fromJSDate(start)
    const to = DateTime.fromJSDate(end)
    const diff = Duration.fromObject(
      to.diff(from, ['hours', 'days', 'weeks', 'months', 'years']).toObject(),
    )
    const unit =
      format === 'd'
        ? 'days'
        : format === 'w'
          ? 'weeks'
          : format === 'm'
            ? 'months'
            : format === 'y'
              ? 'years'
              : 'hours'
    return Math.round(diff.as(unit) * 100) / 100
  },

  plus(date: Date, duration: DurationLike): Date {
    return DateTime.fromJSDate(date).plus(duration).toJSDate()
  },

  minus(date: Date, duration: DurationLike): Date {
    return DateTime.fromJSDate(date).minus(duration).toJSDate()
  },

  startOf(date: Date, unit: DateTimeUnit): Date {
    return DateTime.fromJSDate(date).startOf(unit).toJSDate()
  },

  endOf(date: Date, unit: DateTimeUnit): Date {
    return DateTime.fromJSDate(date).endOf(unit).toJSDate()
  },

  start(date: Date): Date {
    return DateUtils.startOf(date, 'day')
  },

  end(date: Date): Date {
    return DateUtils.endOf(date, 'day')
  },

  yesterday(date: Date): Date {
    return DateUtils.minus(date, { days: 1 })
  },

  tomorrow(date: Date): Date {
    return DateUtils.plus(date, { days: 1 })
  },

  weekday(date: Date): WeekdayNumbers {
    return DateTime.fromJSDate(date).weekday as WeekdayNumbers
  },

  monday(date: Date): Date {
    return DateUtils.startOf(date, 'week')
  },

  sunday(date: Date): Date {
    return DateUtils.endOf(date, 'week')
  },

  weekStart(date: Date): Date {
    return DateUtils.startOf(date, 'week')
  },

  weekEnd(date: Date): Date {
    return DateUtils.endOf(date, 'week')
  },

  monthStart(date: Date): Date {
    return DateUtils.startOf(date, 'month')
  },

  monthEnd(date: Date): Date {
    return DateUtils.endOf(date, 'month')
  },

  quarterStart(date: Date): Date {
    return DateUtils.startOf(date, 'quarter')
  },

  quarterEnd(date: Date): Date {
    return DateUtils.endOf(date, 'quarter')
  },

  yearStart(date: Date): Date {
    return DateUtils.startOf(date, 'year')
  },

  yearEnd(date: Date): Date {
    return DateUtils.endOf(date, 'year')
  },

  lastWeekStart(date: Date): Date {
    return DateUtils.weekStart(DateUtils.minus(date, { days: 7 }))
  },

  lastWeekEnd(date: Date): Date {
    return DateUtils.weekEnd(DateUtils.minus(date, { days: 7 }))
  },

  lastSevenDays(date: Date): Date {
    return DateUtils.minus(date, { days: 6 })
  },
}

/**
 * 尝试将字符串转换为日期对象
 * @param value 字符串日期
 * @param orElse 如果转换失败，则返回这个日期对象
 * @returns 转换成功的日期对象，否则 orElse
 */
export function tryParseDate(
  value?: string,
  orElse: Date | null = null,
): Date | null {
  return fromSqlOrNull(value) ?? orElse
}

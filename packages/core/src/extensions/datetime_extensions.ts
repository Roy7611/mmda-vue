import {
  DateTime,
  type DateTimeUnit,
  Duration,
  type DurationLike,
  type WeekdayNumbers,
} from 'luxon'
declare global {
  interface Date {
    calculateDiff(end: Date, format?: 'h' | 'd' | 'w' | 'm' | 'y'): number
    fromSQL(value?: string): Date | null
    toSQL(): string
    toFormat(fmt: string): string
    toSQLDate(): string
    toSQLTime(): string
    toRelative(): string
    isAfter(d: Date): boolean
    isBefore(d: Date): boolean
    isEquals(d: Date): boolean
    plus(duration: DurationLike): Date
    minus(duration: DurationLike): Date

    startOf(unit: DateTimeUnit): Date
    endOf(unit: DateTimeUnit): Date
    start(): Date
    end(): Date
    yesterday(): Date
    tomorrow(): Date
    weekday(): WeekdayNumbers
    monday(): Date
    sunday(): Date
    weekStart(): Date
    weekEnd(): Date
    monthStart(): Date
    monthEnd(): Date
    quarterStart(): Date
    quarterEnd(): Date
    yearStart(): Date
    yearEnd(): Date
    lastWeekStart(): Date
    lastWeekEnd(): Date
    lastSevenDays(): Date
  }
}

function fromSqlOrNull(value?: string): Date | null {
  if (!value) return null
  const dt = DateTime.fromSQL(value)
  return dt.isValid ? dt.toJSDate() : null
}

Date.prototype.fromSQL = function (value?: string): Date | null {
  return fromSqlOrNull(value)
}
Date.prototype.toSQL = function (): string {
  return DateTime.fromJSDate(this).toSQL({ includeOffset: false })
}
Date.prototype.toFormat = function (datetime): string {
  return DateTime.fromJSDate(this).toFormat(datetime)
}
Date.prototype.toSQLDate = function (): string {
  return DateTime.fromJSDate(this).toSQLDate()
}
Date.prototype.toSQLTime = function (): string {
  return DateTime.fromJSDate(this).toSQLTime({ includeOffset: false })
}
/**
 * 获取相对当前时间的相对时间字符串
 * @returns - 相对当前时间的相对时间字符串，例如`25天前`
 * @example
 * const date = new Date();
 * console.log(date.toRelative()); //25天前
 */
Date.prototype.toRelative = function (): string {
  return DateTime.fromJSDate(this).toRelative()
}
/**
 * 判断当前日期对象是否晚于给定的日期对象
 * @param d - 需要比较的日期对象
 * @returns - 如果当前日期对象晚于给定的日期对象，返回true，否则返回false
 * @example
 * const date1 = new Date();
 * const date2 = new Date();
 * console.log(date1.isAfter(date2)); // true
 */
Date.prototype.isAfter = function (d: Date): boolean {
  return this > d
}
/**
 * 判断当前日期对象是否早于给定的日期对象
 * @param d - 需要比较的日期对象
 * @returns - 如果当前日期对象早于给定的日期对象，返回true，否则返回false
 * @example
 * const date1 = new Date();
 * const date2 = new Date();
 * console.log(date1.isBefore(date2)); // true
 */
Date.prototype.isBefore = function (d: Date): boolean {
  return this < d
}
/**
 * 判断两个日期对象是否相等
 * @param d - 需要比较的日期对象
 * @returns - 如果两个日期对象相等，返回true，否则返回false
 * @example
 * const date1 = new Date();
 * const date2 = new Date();
 * console.log(date1.isEquals(date2)); // true
 */
Date.prototype.isEquals = function (d: Date): boolean {
  return this.getTime() == d.getTime()
}

/**
 * 计算 this 到 end 的时间差（保留时分秒）。
 * @example
 * start.calculateDiff(end, 'd')
 */
Date.prototype.calculateDiff = function (
  end: Date,
  format: 'h' | 'd' | 'w' | 'm' | 'y' = 'h',
): number {
  const s = DateTime.fromJSDate(this)
  const e = DateTime.fromJSDate(end)
  const diffObj = Duration.fromObject(
    e.diff(s, ['hours', 'days', 'weeks', 'months', 'years']).toObject(),
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
  return Math.round(diffObj.as(unit) * 100) / 100
}

/**
 * 日期对象加上指定的时长
 * @param duration - 时长对象，可以是luxon的Duration对象，也可以是包含年、月、日、小时、分钟、秒的对象
 * @returns - 加上指定时长后的日期对象
 * @example
 * const date = new Date();
 * const duration = { year: 1, month: 2 };
 * const newDate = date.plus(duration);
 * console.log(newDate); //当前日期加上1年2个月后的日期
 */
Date.prototype.plus = function (duration: DurationLike): Date {
  return DateTime.fromJSDate(this).plus(duration).toJSDate()
}

/**
 * 日期对象减去指定的时长
 * @param {DurationLike} duration - 时长对象，可以是luxon的Duration对象，也可以是包含年、月、日、小时、分钟、秒的对象
 * @returns {Date} 减去指定时长后的日期对象
 * @example
 * const date = new Date();
 * const duration = { year: 1, month: 2 };
 * const newDate = date.minus(duration);
 * console.log(newDate); //当前日期减去1年2个月后的日期
 */
Date.prototype.minus = function (duration: DurationLike): Date {
  return DateTime.fromJSDate(this).minus(duration).toJSDate()
}


Date.prototype.startOf = function (unit: DateTimeUnit): Date {
  return DateTime.fromJSDate(this).startOf(unit).toJSDate()
}
Date.prototype.endOf = function (unit: DateTimeUnit): Date {
  return DateTime.fromJSDate(this).endOf(unit).toJSDate()
}
Date.prototype.start = function (): Date {
  return this.startOf('day')
}
Date.prototype.end = function (): Date {
  return this.endOf('day')
}
Date.prototype.yesterday = function (): Date {
  return this.minus({ days: 1 })
}
Date.prototype.tomorrow = function (): Date {
  return this.plus({ days: 1 })
}
Date.prototype.weekday = function (): WeekdayNumbers {
  return DateTime.fromJSDate(this).weekday as WeekdayNumbers
}
Date.prototype.weekStart = Date.prototype.monday = function (): Date {
  return this.startOf('week')
}
Date.prototype.weekEnd = Date.prototype.sunday = function (): Date {
  return this.endOf('week')
}
Date.prototype.lastWeekStart = function (): Date {
  return this.minus({ days: 7 }).weekStart()
}
Date.prototype.lastWeekEnd = function (): Date {
  return this.minus({ days: 7 }).weekEnd()
}
Date.prototype.lastSevenDays = function (): Date {
  return this.minus({ days: 6 })
}
Date.prototype.monthStart = function (): Date {
  return this.startOf('month')
}
Date.prototype.monthEnd = function (): Date {
  return this.endOf('month')
}
Date.prototype.quarterStart = function (): Date {
  return this.startOf('quarter')
}
Date.prototype.quarterEnd = function (): Date {
  return this.endOf('quarter')
}
Date.prototype.yearStart = function (): Date {
  return this.startOf('year')
}
Date.prototype.yearEnd = function (): Date {
  return this.endOf('year')
}

/**
 * 尝试将字符串转换为日期对象
 * @param value - 字符串日期
 * @param orElse - 如果转换失败，则返回这个日期对象
 * @returns - 转换成功的日期对象，否则或Else
 */
export function tryParseDate(
  value?: string,
  orElse: Date | null = null,
): Date | null {
  return fromSqlOrNull(value) ?? orElse
}
// make this file a module
export { }

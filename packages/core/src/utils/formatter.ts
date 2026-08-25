import { DateTime, Duration } from "luxon";

/**
 * 数据格式化输出显示。
 *
 * @author Roshion Luo
 * @since 2021.06.18
 * @copyright syclive.com
 *
 *
 * （1）实现语言区域敏感的国际化数值、货币、日期时间格式化输出。支持中文简体、中文繁体和英文。
 * （2）实现相对友好时间格式化输出。如：2小时前 / 2 hours ago
 * （3）实现固定单位的计量（Qty Unit）格式输出。如： 5.0 kg, 2 km
 * （4）...
 *
 * 注释规范：@see {@link https://tsdoc.org/}
 * ES6参考： @see {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference}
 *          @see {@link https://www.w3cschool.cn/escript6/}
 *
 * 格式化实现参考：
 * 日期时间格式化可使用luxon实现 @see {@link https://moment.github.io/luxon/}，moment.js已经放弃开发，改用luxon。
 * 但其实浏览器有原生API支持，见 @see {@link https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Intl}
 * 实际上luxon使用了Intl API，所以日期时间格式化建议使用luxon，有较多原生API没有的日期时间计算功能。数值格式化参考其实现。【建议】
 * 这个库集成Vue3能用，@see {@link https://formatjs.io/}，因此无法支持IE11，Intl API兼容Edge/Chrome/FireFox
 *
 * 命名规范：
 * 函数命名要求简洁，使用标准格式字符，例如N表示数值，L表示长，S表示短，G表示常规，U表示国际通用。
 * 前缀用于区分类型，例如 NF() 数值格式化，DF() 日期格式化，TF() 时间格式化
 *
 * 格式化风格(style)可参考：
 * 标准数值格式符参考：@see {@link https://docs.microsoft.com/zh-cn/dotnet/standard/base-types/standard-numeric-format-strings}
 * 标准日期格式符参考：@see {@link https://docs.microsoft.com/zh-cn/dotnet/standard/base-types/standard-date-and-time-format-strings}
 *
 * @packageDocumentation
 */

/**
 * 对`uri`进行编码然后将特殊符号进行替换
 * @param url 完整网址
 * @returns 
 */
export function encodeUriAndFix(url: string) {
  return encodeURI(url).replace(/[!'()*#]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16);
  })
}

export function n1(value: number) {
  return value.toFixed(1);
}
export function n2(value: number) {
  return value.toFixed(2);
}
export function n3(value: number) {
  return value.toFixed(3);
}
export function n4(value: number) {
  return value.toFixed(4);
}

/**
 * 将秒数格式化为友好的时间长度描述，如2小时5分钟，常用于显示工期
 * @param seconds 秒数
 * @returns 
 */
export function friendlySeconds(seconds: number, locale: string = 'zh') {
  return Duration.fromObject({ seconds }, { locale }).rescale().toHuman()
}

export function friendlyMinutes(minutes: number, locale: string = 'zh') {
  return Duration.fromObject({ minutes }, { locale }).rescale().toHuman()
}

export function friendlyHours(hours: number, locale: string = 'zh') {
  // return Duration.fromObject({ hours }, { locale }).rescale().toHuman()
  // 防止rescale进位，导致显示的是天数，而不是小时数
  return Duration.fromObject({ hours }, { locale }).toHuman()
}

export function friendlyDays(days: number, locale: string = 'zh') {
  const yearDuration = Duration.fromObject({ years: 0, days }, { locale }).normalize().toObject()
  const monthDuration = Duration.fromObject({ months: 0, days: yearDuration.days }, { locale }).normalize().toObject()
  const weekDuration = Duration.fromObject({ weeks: 0, days: monthDuration.days }, { locale }).normalize().toObject()
  return `${yearDuration.years ? yearDuration.years + `年${monthDuration.months || weekDuration.weeks || weekDuration.days ? '、' : ''}` : ''}${monthDuration.months ? monthDuration.months + `月${weekDuration.weeks || weekDuration.days ? '、' : ''}` : ''}${weekDuration.weeks ? weekDuration.weeks + `周${weekDuration.days ? '、' : ''}` : ''}${weekDuration.days ? weekDuration.days + '天' : ''}`
}
/**
 * 相对于现在的时间长度，例如`25天前`，常用于显示事件的发生时间
 * @param sqlDateTime 日期，格式必须为`yyyy-MM-dd HH:mm:ss`
 * @param locale 时间语言区域，默认为`zh`
 * @returns 
 */
export function relativeTime(sqlDateTime: string, locale: string = 'zh') {
  const dt = DateTime.fromSQL(sqlDateTime);
  const now = DateTime.now();
  if (dt.year != now.year) return dt.toRelative({ locale, round: true, unit: ['years', 'months', 'days'] });
  else if (dt.month != now.month) return dt.toRelative({ locale, round: true, unit: ['months', 'days'] });
  else if (dt.weekNumber != now.weekNumber) return dt.toRelative({ locale, round: true, unit: ['weeks', 'days'] });
  else if (dt.day != now.day) return dt.toRelative({ locale, round: true, unit: ['days', 'hours'] });
  else if (dt.hour != now.hour) return dt.toRelative({ locale, round: true, unit: ['hours', 'minutes'] });
  else if (dt.minute != now.minute) return dt.toRelative({ locale, round: false, unit: ['minutes'] });
  else return dt.toRelative({ locale, round: true, unit: 'seconds' });
}

/**
 * 两个日期之间的天数，常用于显示工期
 * @param start 开始日期，格式必须为`yyyy-MM-dd HH:mm:ss`
 * @param end 结束日期，格式必须为`yyyy-MM-dd HH:mm:ss`
 * @param locale 时间语言区域，默认为`zh`
 * @returns 
 */
export function daysBetween(start: string, end: string, locale: string = 'zh') {
  const startDateTime = DateTime.fromSQL(start);
  return DateTime.fromSQL(end).toRelative({ base: startDateTime, round: true, unit: 'days' });
}

/**
 * 将文件大小从字节转换为可读的字符串
 * @param size 文件大小，单位为字节
 * @returns {string} 文件大小的可读字符串
 * @example
 *  formatFileSize(1024) => '1.00 KB'
 *  formatFileSize(1024*1024) => '1.00 MB'
 *  formatFileSize(1024*1024*1024) => '1.00 GB'
 */
export function formatFileSize(size: number | string) {
  const sizeStr = typeof size === 'string' ? parseInt(size) : size;
  if (sizeStr < 1024) {
    return `${sizeStr} B`;
  } else if (sizeStr < 1024 * 1024) {
    return `${(sizeStr / 1024).toFixed(2)} KB`;
  } else if (sizeStr < 1024 * 1024 * 1024) {
    return `${(sizeStr / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(sizeStr / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

/**
 * 将金额格式化为千分位表示
 * @param {string|number} value - 输入的金额
 * @param {number} [decimals=2] - 小数位数
 * @returns {string} 格式化后的金额字符串
 */
export function formatAmount(value: number | string, decimals = 2) {
  // 清洗输入并转换为数字
  const cleanedValue = String(value)
    .replace(/,/g, '')
    .replace(/[^\d.-]/g, '');

  // 处理非法字符
  if (!cleanedValue || isNaN(Number(cleanedValue))) return '0.00';

  let number = parseFloat(cleanedValue);
  if (isNaN(number)) return '0.00';

  // 处理小数位数
  const fixed = number.toFixed(decimals);
  let [integerPart, decimalPart] = fixed.split('.');

  // 处理负号
  let sign = '';
  if (integerPart.startsWith('-')) {
    sign = '-';
    integerPart = integerPart.substring(1);
  }

  // 添加千分位逗号
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // 组合结果
  return sign + integerPart + (decimals > 0 ? `.${decimalPart}` : '');
}


/**
 * 解析 URL query 为对象；同名参数收成数组。
 */
export function getParams(value: string): Record<string, string | string[]> {
  const queryParams = new URLSearchParams(new URL(value).search);
  const queryObject: Record<string, string | string[]> = {};
  for (const [key, param] of queryParams.entries()) {
    if (queryObject[key]) {
      queryObject[key] = ([] as string[]).concat(queryObject[key], param);
    } else {
      queryObject[key] = param;
    }
  }
  return queryObject;
}

/** @deprecated 拼写错误，使用 {@link getParams} */
export const getParmas = getParams;


/**
 * 精确四舍五入（支持正负数）
 * @param {number} value - 待舍入数值
 * @param {number} decimals - 保留小数位数（默认2）
 * @returns {number} - 舍入结果
 */
export function preciseRound(value: number, decimals = 2): number {
  if (isNaN(value)) {
    console.error('preciseRound: value is NaN', value);
  }

  // 处理整数快速通道
  if (decimals === 0) return Math.round(value);

  // 处理零值
  if (value === 0) return 0;

  // 获取数值的符号（正负）
  const sign = Math.sign(value);
  // 取绝对值处理
  const absValue = Math.abs(value);

  // 浮点精度补偿 + 放大舍入
  const factor = 10 ** decimals;
  const adjustedValue = absValue * factor + Number.EPSILON;
  const rounded = Math.round(adjustedValue) / factor;

  // 恢复原始符号
  const result = sign * rounded;

  // 二次校验边界值
  return parseFloat(result.toFixed(decimals));
}
/**
 * 列表时间轴（chrome 控件 `factory.timeline`）契约：一维事件序列。无 Vue。
 *
 * 二维时间轴画布（Tempis）是**另一档控件**，契约在 `tempis_timeline.ts`
 * （`UiTempisTimelineProps extends UiTimelineProps`）。本文件只放两档都能用的
 * 行绑定 / 文案工具与列表侧入参。
 *
 * 判定（拍定 D2 / D4 / D5）：**普通 timeline 不支持的，共享契约里不放**。
 * 因此本层是**纯数据入参** —— 三套皮肤（Syncfusion / PrimeVue / AgNaive）既不派发
 * 事件，也没有命令式 API；控制器、可见范围、选择、tooltip 模板全部归 Tempis 层。
 */
import { DateTime } from 'luxon'
import { relativeTime as formatRelativeTime } from '../../utils/formatter'
import type { UiOrientation } from '../layout'
import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export const TIMELINE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss'

export type UiTimelineAlign =
  | 'before'
  | 'after'
  | 'alternate'
  | 'alternateReverse'

export type UiTimelineTimeDisplay = 'relative' | 'absolute'

/** 行 → 值 的绑定：给函数直接调用；给字符串（或用例的缺省键）按属性名读。 */
export type UiTimelineFieldOf<T, R> = string | ((item: T, index: number) => R)

/** 解析后的列表行。字段绑定在 {@link timelineItemsOf} 里只解析一次。 */
export interface UiTimelineItem {
  key?: string | number
  label?: string
  content?: string
  oppositeContent?: string
  icon?: string
  disabled?: boolean
  cssClass?: string
  time?: Date | string | number
  /** `time` 的展示文案（`timeDisplay: 'relative'` 时为「3天前」）。 */
  timeText?: string
}

export interface UiTimelineProps<T = any> extends UiProps {
  items?: T[]
  keyField?: UiTimelineFieldOf<T, string | number>
  labelField?: UiTimelineFieldOf<T, string>
  contentField?: UiTimelineFieldOf<T, string>
  oppositeContentField?: UiTimelineFieldOf<T, string>
  iconField?: UiTimelineFieldOf<T, string>
  disabledField?: UiTimelineFieldOf<T, boolean>
  cssClassField?: UiTimelineFieldOf<T, string>
  /** 对侧时间取值字段。只认这一处；`start` / `end` 归 Tempis 契约。 */
  timeField?: UiTimelineFieldOf<T, Date | string | number>
  orientation?: UiOrientation
  align?: UiTimelineAlign
  reverse?: boolean
  timeDisplay?: UiTimelineTimeDisplay
  timeFormat?: string
  locale?: string
  rtl?: boolean
  persist?: boolean
  height?: string | number
  /** 逐项内容模板（皮肤透传给厂商组件）。Tempis 的 tooltip 模板是另一回事。 */
  template?: unknown
}

function jsDateOf(raw: unknown): Date | null {
  if (raw == null || raw === '') return null
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? null : raw
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const date = new Date(raw)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof raw === 'string') {
    const date = new Date(raw)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

/**
 * 读一个 `*Field` 绑定：函数按 `(item, index)` 调用，字符串按属性名读，
 * 都没给时用 `fallbackKey` 当属性名。列表档与 Tempis 档共用。
 */
export function timelineFieldValueOf<T, R>(
  item: T,
  index: number,
  binder: UiTimelineFieldOf<T, R> | undefined,
  fallbackKey: string,
): R | undefined {
  if (typeof binder === 'function') return binder(item, index)
  const key = binder ?? fallbackKey
  if (item == null || typeof item !== 'object') return undefined
  return (item as Record<string, unknown>)[key] as R | undefined
}

/** 行标识：数字原样，其余转字符串；空值当没给。 */
export function timelineKeyOf<T>(
  item: T,
  index: number,
  binder: UiTimelineFieldOf<T, string | number> | undefined,
): string | number | undefined {
  const raw = timelineFieldValueOf(item, index, binder, 'key')
  if (raw == null || raw === '') return undefined
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  return String(raw)
}

/** 字符串字段：空值/空串当没给。 */
export function timelineStringOf<T>(
  item: T,
  index: number,
  binder: UiTimelineFieldOf<T, string> | undefined,
  fallbackKey: string,
): string | undefined {
  const raw = timelineFieldValueOf(item, index, binder, fallbackKey)
  if (raw == null || raw === '') return undefined
  return String(raw)
}

/** 布尔字段：只看给没给，不判真假值本身。 */
export function timelineBoolOf<T>(
  item: T,
  index: number,
  binder: UiTimelineFieldOf<T, boolean> | undefined,
  fallbackKey: string,
): boolean | undefined {
  const raw = timelineFieldValueOf(item, index, binder, fallbackKey)
  if (raw == null) return undefined
  return Boolean(raw)
}

/** 任意时间值 → SQL 形态（`yyyy-MM-dd HH:mm:ss`），供相对时间与后端对齐。 */
export function timelineSqlOf(raw: unknown): string | undefined {
  if (raw == null || raw === '') return undefined
  const date = jsDateOf(raw)
  if (date) return DateTime.fromJSDate(date).toFormat(TIMELINE_TIME_FORMAT)
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return `${trimmed} 00:00:00`
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(trimmed)) {
      return trimmed.replace('T', ' ').slice(0, 19)
    }
    return trimmed
  }
  return undefined
}

/** 对侧时间文案：`relative`（默认，「3天前」）或 `absolute`（按 `timeFormat`）。 */
export function timelineTimeTextOf(
  raw: unknown,
  locale = 'zh',
  display: UiTimelineTimeDisplay = 'relative',
  format = TIMELINE_TIME_FORMAT,
): string | undefined {
  if (raw == null || raw === '') return undefined
  if (display === 'absolute') {
    const date = jsDateOf(raw)
    if (date) return DateTime.fromJSDate(date).toFormat(format)
    return String(raw)
  }
  const sql = timelineSqlOf(raw)
  if (!sql) return undefined
  return formatRelativeTime(sql, locale) ?? undefined
}

export function timelineOrientationOf(props: UiTimelineProps): UiOrientation {
  return props.orientation === 'horizontal' ? 'horizontal' : 'vertical'
}

export function timelineAlignOf(props: UiTimelineProps): UiTimelineAlign {
  const align = props.align
  if (
    align === 'before' ||
    align === 'after' ||
    align === 'alternate' ||
    align === 'alternateReverse'
  ) {
    return align
  }
  return 'after'
}

export function timelineAlignToEj2(
  align: UiTimelineAlign,
): 'Before' | 'After' | 'Alternate' | 'AlternateReverse' {
  if (align === 'before') return 'Before'
  if (align === 'alternate') return 'Alternate'
  if (align === 'alternateReverse') return 'AlternateReverse'
  return 'After'
}

export function timelineOrientationToEj2(
  orientation: UiOrientation,
): 'Horizontal' | 'Vertical' {
  return orientation === 'horizontal' ? 'Horizontal' : 'Vertical'
}

export function timelineListOppositeOf(item: UiTimelineItem): string | undefined {
  if (item.oppositeContent) return item.oppositeContent
  return item.timeText
}

export function timelineListContentOf(
  item: UiTimelineItem,
  index: number,
): string {
  return item.content ?? item.label ?? item.timeText ?? String(index + 1)
}

/** 列表侧行解析：字段绑定只在这里解析一次，皮肤直接吃 {@link UiTimelineItem}。 */
export function timelineItemsOf(props: UiTimelineProps): UiTimelineItem[] {
  const rows = Array.isArray(props.items) ? props.items : []
  const locale = props.locale ?? 'zh'
  const display = props.timeDisplay === 'absolute' ? 'absolute' : 'relative'
  const format = props.timeFormat ?? TIMELINE_TIME_FORMAT
  return rows.map((item, index) => {
    const label = timelineStringOf(item, index, props.labelField, 'label')
    const content =
      timelineStringOf(item, index, props.contentField, 'content') ?? label
    const timeRaw = timelineFieldValueOf(item, index, props.timeField, 'time')
    return {
      key: timelineKeyOf(item, index, props.keyField),
      label,
      content,
      oppositeContent: timelineStringOf(
        item,
        index,
        props.oppositeContentField,
        'oppositeContent',
      ),
      icon: timelineStringOf(item, index, props.iconField, 'icon'),
      disabled: timelineBoolOf(item, index, props.disabledField, 'disabled'),
      cssClass: timelineStringOf(item, index, props.cssClassField, 'cssClass'),
      time: timeRaw as Date | string | number | undefined,
      timeText: timelineTimeTextOf(timeRaw, locale, display, format),
    }
  })
}

export function timelineModifierClasses(props: UiTimelineProps): unknown[] {
  return [
    uiCssClass('timeline'),
    uiCssClass('timeline', undefined, timelineOrientationOf(props)),
    uiCssClass('timeline', undefined, timelineAlignOf(props)),
    props.reverse ? uiCssClass('timeline', undefined, 'reverse') : undefined,
    props.class,
  ]
}

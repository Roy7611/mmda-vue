/*
 * chrome 时间轴走 factory.timeline。vui 名是 timeline。
 * 默认皮肤是事件列表（EJ2 / Prime / Naive）。setTimelinePlugin 之后同一调用可换成 Tempis 轴。
 * 不要 ejs-timeline / TempisTimeline / NTimeline 当 vui 名。
 * 对侧时间缺省 core relativeTime。
 */
import {
  DateTime,
  relativeTime as formatRelativeTime,
  type MetaUiField,
} from '@mmda/core'
import type { VNode } from 'vue'
import type { PropData, UiOrientation } from '../layout/layout'
import { DATE_TIME_PICKER_FORMAT, dateOf } from './date_picker'

export type UiTimelineAlign =
  | 'before'
  | 'after'
  | 'alternate'
  | 'alternateReverse'

export type UiTimelineTimeDisplay = 'relative' | 'absolute'

export type UiTimelineFieldOf<T, R> =
  | string
  | ((item: T, index: number) => R)

export interface UiTimelineItem {
  key?: string | number
  label?: string
  content?: string
  oppositeContent?: string
  icon?: string
  disabled?: boolean
  cssClass?: string
  time?: Date | string | number
  timeText?: string
  start?: Date | string | number
  end?: Date | string | number
  grouping?: string
  category?: string
  progress?: number
}

export interface UiTimelineRange {
  start?: Date | string | number
  end?: Date | string | number
}

export interface UiTimelineController {
  focus: (target?: unknown) => void
  getRange: () => UiTimelineRange | undefined
  setSelection: (ids: Array<string | number>) => void
  toImage: () => Promise<Blob | undefined>
  redraw: () => void
}

export interface UiTimelineProps<T = any> extends PropData {
  items?: T[]
  keyField?: UiTimelineFieldOf<T, string | number>
  labelField?: UiTimelineFieldOf<T, string>
  contentField?: UiTimelineFieldOf<T, string>
  oppositeContentField?: UiTimelineFieldOf<T, string>
  iconField?: UiTimelineFieldOf<T, string>
  disabledField?: UiTimelineFieldOf<T, boolean>
  cssClassField?: UiTimelineFieldOf<T, string>
  timeField?: UiTimelineFieldOf<T, Date | string | number>
  startField?: UiTimelineFieldOf<T, Date | string | number>
  endField?: UiTimelineFieldOf<T, Date | string | number>
  groupingField?: UiTimelineFieldOf<T, string>
  categoryField?: UiTimelineFieldOf<T, string>
  progressField?: UiTimelineFieldOf<T, number>
  orientation?: UiOrientation
  align?: UiTimelineAlign
  reverse?: boolean
  timeDisplay?: UiTimelineTimeDisplay
  timeFormat?: string
  locale?: string
  rtl?: boolean
  persist?: boolean
  height?: string | number
  range?: UiTimelineRange
  template?: unknown
  onItemClick?: (id: string | number) => void
  onSelectionChange?: (ids: Array<string | number>) => void
  onRangeChange?: (start: Date, end: Date) => void
  onReady?: (controller: UiTimelineController) => void
}

export interface UiTimelinePlugin {
  timeline: (props: UiTimelineProps) => VNode
}

export type TimelineFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  isFieldReadonly?: (field: MetaUiField | string) => boolean
}

function readBoundField<T, R>(
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

function keyBound<T>(
  item: T,
  index: number,
  binder: UiTimelineFieldOf<T, string | number> | undefined,
): string | number | undefined {
  const raw = readBoundField(item, index, binder, 'key')
  if (raw == null || raw === '') return undefined
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  return String(raw)
}

function stringBound<T>(
  item: T,
  index: number,
  binder: UiTimelineFieldOf<T, string> | undefined,
  fallbackKey: string,
): string | undefined {
  const raw = readBoundField(item, index, binder, fallbackKey)
  if (raw == null || raw === '') return undefined
  return String(raw)
}

function boolBound<T>(
  item: T,
  index: number,
  binder: UiTimelineFieldOf<T, boolean> | undefined,
  fallbackKey: string,
): boolean | undefined {
  const raw = readBoundField(item, index, binder, fallbackKey)
  if (raw == null) return undefined
  return Boolean(raw)
}

export function timelineSqlOf(raw: unknown): string | undefined {
  if (raw == null || raw === '') return undefined
  const date = dateOf(raw)
  if (date) return DateTime.fromJSDate(date).toFormat(DATE_TIME_PICKER_FORMAT)
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

export function timelineTimeTextOf(
  raw: unknown,
  locale = 'zh',
  display: UiTimelineTimeDisplay = 'relative',
  format = DATE_TIME_PICKER_FORMAT,
): string | undefined {
  if (raw == null || raw === '') return undefined
  if (display === 'absolute') {
    const date = dateOf(raw)
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

/** 皮肤列表只吃规范化后的条目。 */
export function timelineItemsOf(props: UiTimelineProps): UiTimelineItem[] {
  const rows = Array.isArray(props.items) ? props.items : []
  const locale = props.locale ?? 'zh'
  const display = props.timeDisplay === 'absolute' ? 'absolute' : 'relative'
  const format = props.timeFormat ?? DATE_TIME_PICKER_FORMAT
  return rows.map((item, index) => {
    const label = stringBound(item, index, props.labelField, 'label')
    const content =
      stringBound(item, index, props.contentField, 'content') ?? label
    const timeRaw =
      readBoundField(item, index, props.timeField, 'time') ??
      readBoundField(item, index, props.startField, 'start')
    const startRaw =
      readBoundField(item, index, props.startField, 'start') ?? timeRaw
    const endRaw = readBoundField(item, index, props.endField, 'end')
    const progressRaw = readBoundField(item, index, props.progressField, 'progress')
    return {
      key: keyBound(item, index, props.keyField),
      label,
      content,
      oppositeContent: stringBound(
        item,
        index,
        props.oppositeContentField,
        'oppositeContent',
      ),
      icon: stringBound(item, index, props.iconField, 'icon'),
      disabled: boolBound(item, index, props.disabledField, 'disabled'),
      cssClass: stringBound(item, index, props.cssClassField, 'cssClass'),
      time: timeRaw as Date | string | number | undefined,
      timeText: timelineTimeTextOf(timeRaw, locale, display, format),
      start: startRaw as Date | string | number | undefined,
      end: endRaw as Date | string | number | undefined,
      grouping: stringBound(item, index, props.groupingField, 'grouping'),
      category: stringBound(item, index, props.categoryField, 'category'),
      progress:
        progressRaw == null || String(progressRaw) === ''
          ? undefined
          : Number(progressRaw),
    }
  })
}

export function tempisItemsOf(props: UiTimelineProps): Array<{
  id: string | number
  label: string
  start: Date | string | number
  end?: Date | string | number
  grouping?: string
  category?: string
  progress?: number
}> {
  return timelineItemsOf(props)
    .map((item, index) => {
      const start = item.start ?? item.time
      if (start == null || start === '') return undefined
      return {
        id: item.key ?? index,
        label: item.label ?? item.content ?? String(index + 1),
        start,
        end: item.end,
        grouping: item.grouping,
        category: item.category,
        progress: item.progress,
      }
    })
    .filter((row): row is NonNullable<typeof row> => row != null)
}

export function emitTimelineRangeChange(
  props: UiTimelineProps,
  start: Date,
  end: Date,
): void {
  props.onRangeChange?.(start, end)
}

export const noopTimelineController: UiTimelineController = {
  focus: () => undefined,
  getRange: () => undefined,
  setSelection: () => undefined,
  toImage: async () => undefined,
  redraw: () => undefined,
}

export function timelineModifierClasses(props: UiTimelineProps): unknown[] {
  return [
    'mmda-timeline',
    `mmda-timeline--${timelineOrientationOf(props)}`,
    `mmda-timeline--${timelineAlignOf(props)}`,
    props.reverse ? 'mmda-timeline--reverse' : undefined,
    props.class,
  ]
}

export function timelinePropsFromField(
  field: MetaUiField,
  context: TimelineFieldContext,
  extra: PropData = {},
): UiTimelineProps {
  const value = context.getFieldValue(field)
  const items = Array.isArray(extra.items)
    ? extra.items
    : Array.isArray(value)
      ? value
      : []
  return {
    items,
    keyField: extra.keyField,
    labelField: extra.labelField,
    contentField: extra.contentField,
    oppositeContentField: extra.oppositeContentField,
    iconField: extra.iconField,
    disabledField: extra.disabledField,
    cssClassField: extra.cssClassField,
    timeField: extra.timeField,
    startField: extra.startField,
    endField: extra.endField,
    groupingField: extra.groupingField,
    categoryField: extra.categoryField,
    progressField: extra.progressField,
    orientation: extra.orientation,
    align: extra.align,
    reverse: extra.reverse,
    timeDisplay: extra.timeDisplay,
    timeFormat: extra.timeFormat,
    locale: extra.locale,
    rtl: extra.rtl,
    persist: extra.persist,
    height: extra.height,
    range: extra.range,
    template: extra.template,
    onItemClick: extra.onItemClick,
    onSelectionChange: extra.onSelectionChange,
    onRangeChange: extra.onRangeChange,
    onReady: extra.onReady,
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...extra.htmlAttributes,
    },
  }
}

export function bindTimelineFactory(
  factory: { timeline: (props: UiTimelineProps) => VNode },
  pluginOf: () => UiTimelinePlugin | null | undefined,
): void {
  const skin = factory.timeline.bind(factory)
  factory.timeline = (props) => {
    const plugin = pluginOf()
    return plugin ? plugin.timeline(props) : skin(props)
  }
}

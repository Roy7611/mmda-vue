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

export interface UiTimelineProps<T = any> extends UiProps {
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

export function timelineItemsOf(props: UiTimelineProps): UiTimelineItem[] {
  const rows = Array.isArray(props.items) ? props.items : []
  const locale = props.locale ?? 'zh'
  const display = props.timeDisplay === 'absolute' ? 'absolute' : 'relative'
  const format = props.timeFormat ?? TIMELINE_TIME_FORMAT
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

export const noopTimelineController: UiTimelineController = {
  focus: () => undefined,
  getRange: () => undefined,
  setSelection: () => undefined,
  toImage: async () => undefined,
  redraw: () => undefined,
}

export function timelineModifierClasses(props: UiTimelineProps): unknown[] {
  return [
    uiCssClass('timeline'),
    uiCssClass('timeline', timelineOrientationOf(props)),
    uiCssClass('timeline', timelineAlignOf(props)),
    props.reverse ? uiCssClass('timeline', 'reverse') : undefined,
    props.class,
  ]
}

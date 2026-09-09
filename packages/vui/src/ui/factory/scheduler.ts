/*
 * 排程是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setSchedulerPlugin(createSfSchedulerPlugin()) 或 createFcSchedulerPlugin()。
 * 不是 factory.calendar（月视选日），也不是 gantt。
 */
import type { VNode } from 'vue'
import type {UiProps} from '../layout/layout'

export type UiSchedulerView =
  | 'day'
  | 'week'
  | 'workWeek'
  | 'month'
  | 'agenda'
  | 'year'
  | 'timelineDay'
  | 'timelineWeek'
  | 'timelineWorkWeek'
  | 'timelineMonth'

export const UI_SCHEDULER_TIMELINE_VIEWS = [
  'timelineDay',
  'timelineWeek',
  'timelineWorkWeek',
  'timelineMonth',
] as const

export type UiSchedulerEventDisplay = 'auto' | 'background'

export interface UiSchedulerEvent {
  id: string | number
  title?: string
  start: string | Date
  end?: string | Date | null
  allDay?: boolean
  resourceId?: string | number | null
  color?: string
  readonly?: boolean
  description?: string
  location?: string
  /** iCal RRULE。不要厂商 Recurrence 对象 */
  recurrenceRule?: string
  /** 例外日期。对应 EJ2 RecurrenceException */
  recurrenceException?: string
  /** `background` = 占档 */
  display?: UiSchedulerEventDisplay
  /** 点击打开。`onEventClick` 返回 `false` 才拦住 */
  url?: string
  [field: string]: unknown
}

export interface UiSchedulerResource {
  id: string | number
  title: string
  color?: string
}

export type UiSchedulerChangeAction =
  | 'add'
  | 'update'
  | 'delete'
  | 'move'
  | 'resize'

export interface UiSchedulerChangeEvent<T = unknown> {
  action: UiSchedulerChangeAction
  event: UiSchedulerEvent
  native?: T
}

export interface UiSchedulerVisibleRange {
  start: Date
  end: Date
}

export interface UiSchedulerExportExcelOptions {
  fileName?: string
}

export interface UiSchedulerController {
  refresh: (events?: UiSchedulerEvent[]) => void
  goToDate: (date: string | Date) => void
  setView: (view: UiSchedulerView) => void
  select: (id: string | number | null) => void
  prev: () => void
  next: () => void
  today: () => void
  getVisibleRange: () => UiSchedulerVisibleRange | null
  print: () => void
  exportExcel: (options?: UiSchedulerExportExcelOptions) => void
}

export interface UiSchedulerWorkHours {
  start: string
  end: string
}

export interface UiSchedulerViewProps extends UiProps {
  events?: UiSchedulerEvent[]
  resources?: UiSchedulerResource[]
  selectedDate?: string | Date
  view?: UiSchedulerView
  height?: string | number
  readonly?: boolean
  allowDrag?: boolean
  allowResize?: boolean
  allowAdd?: boolean
  locale?: string
  firstDayOfWeek?: number
  workDays?: number[]
  showWeekend?: boolean
  workHours?: UiSchedulerWorkHours
  startHour?: string
  endHour?: string
  slotDuration?: number
  showNowIndicator?: boolean
  minDate?: string | Date
  maxDate?: string | Date
  allowOverlap?: boolean
  allowSelectOverlap?: boolean
  allowSelect?: boolean
  showHeader?: boolean
  showQuickInfo?: boolean
  hideEmptyAgendaDays?: boolean
  dayCount?: number
  showWeekNumber?: boolean
  onReady?: (controller: UiSchedulerController) => void
  onEventChange?: (
    event: UiSchedulerChangeEvent,
  ) => void | boolean | Promise<void | boolean>
  onEventClick?: (
    event: UiSchedulerEvent,
  ) => void | boolean | Promise<void | boolean>
  onEventDblClick?: (event: UiSchedulerEvent) => void
  onDateClick?: (date: Date, allDay?: boolean) => void
  onDateDblClick?: (date: Date, allDay?: boolean) => void
  onViewChange?: (view: UiSchedulerView, date: Date) => void
  onSelectRange?: (start: Date, end: Date, allDay?: boolean) => void
  onRangeChange?: (start: Date, end: Date) => void
  onMoreEventsClick?: (date: Date, events: UiSchedulerEvent[]) => void
  onEventHover?: (event: UiSchedulerEvent | null) => void
  eventContent?: (event: UiSchedulerEvent) => VNode
  eventClassName?: (event: UiSchedulerEvent) => string | undefined
}

export interface UiSchedulerPlugin {
  schedulerView: (props: UiSchedulerViewProps) => VNode
}

export const SCHEDULER_PLUGIN_NOT_INSTALLED = 'scheduler plugin not installed'

export const SCHEDULER_TIMELINE_NOT_SUPPORTED =
  'scheduler timeline view is not supported'

function notInstalled(): never {
  throw new Error(SCHEDULER_PLUGIN_NOT_INSTALLED)
}

export function unimplementedSchedulerPlugin(): UiSchedulerPlugin {
  return { schedulerView: notInstalled }
}

export function schedulerHookClass(
  extra?: unknown,
  readonly?: boolean,
): unknown[] {
  return [
    'mmda-scheduler',
    readonly ? 'mmda-scheduler--readonly' : undefined,
    extra,
  ]
}

export function schedulerWorkDaysOf(workDays?: number[]): number[] {
  return workDays?.length ? [...workDays] : [1, 2, 3, 4, 5]
}

export function schedulerSlotDurationOf(minutes?: number): number {
  if (minutes == null || !Number.isFinite(minutes) || minutes <= 0) return 30
  return Math.floor(minutes)
}

export function schedulerSlotDurationHms(minutes?: number): string {
  const total = schedulerSlotDurationOf(minutes)
  const hours = Math.floor(total / 60)
  const mins = total % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`
}

export function schedulerHourHms(hour?: string, fallback = '00:00:00'): string {
  if (hour == null || hour === '') return fallback
  const parts = String(hour).split(':')
  const h = parts[0] ?? '00'
  const m = parts[1] ?? '00'
  const s = parts[2] ?? '00'
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`
}

export function isSchedulerTimelineView(
  view?: string | null,
): view is (typeof UI_SCHEDULER_TIMELINE_VIEWS)[number] {
  return UI_SCHEDULER_TIMELINE_VIEWS.includes(view as any)
}

export function schedulerHiddenDaysOf(props: {
  workDays?: number[]
  showWeekend?: boolean
  view?: UiSchedulerView
}): number[] {
  const workDays = schedulerWorkDaysOf(props.workDays)
  if (props.view === 'workWeek' || props.showWeekend === false) {
    return [0, 1, 2, 3, 4, 5, 6].filter((day) => !workDays.includes(day))
  }
  return []
}

export async function emitSchedulerChange(
  handler: UiSchedulerViewProps['onEventChange'] | undefined,
  event: UiSchedulerChangeEvent,
): Promise<boolean> {
  if (!handler) return true
  return (await handler(event)) !== false
}

export async function emitSchedulerEventClick(
  handler: UiSchedulerViewProps['onEventClick'] | undefined,
  event: UiSchedulerEvent,
): Promise<boolean> {
  if (!handler) return true
  return (await handler(event)) !== false
}

export function openSchedulerEventUrl(event: UiSchedulerEvent): void {
  if (!event.url) return
  window.open(event.url, '_blank', 'noopener,noreferrer')
}

export function schedulerEventsToCsv(events: UiSchedulerEvent[] = []): string {
  const header = [
    'id',
    'title',
    'start',
    'end',
    'allDay',
    'location',
    'resourceId',
    'recurrenceRule',
  ]
  const lines = [header.join(',')]
  for (const event of events) {
    lines.push(
      [
        csvCell(event.id),
        csvCell(event.title),
        csvCell(event.start),
        csvCell(event.end),
        csvCell(event.allDay ? 'true' : 'false'),
        csvCell(event.location),
        csvCell(event.resourceId),
        csvCell(event.recurrenceRule),
      ].join(','),
    )
  }
  return `\uFEFF${lines.join('\r\n')}`
}

export function downloadSchedulerExcel(
  events: UiSchedulerEvent[] = [],
  options?: UiSchedulerExportExcelOptions,
): string {
  const csv = schedulerEventsToCsv(events)
  const fileName = excelFileName(options?.fileName)
  if (typeof document !== 'undefined') {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`
    link.click()
    URL.revokeObjectURL(href)
  }
  return csv
}

export function excelFileName(fileName?: string): string {
  const raw = fileName?.trim() || 'scheduler'
  return raw.replace(/\.(xlsx|xls|csv)$/i, '') || 'scheduler'
}

function csvCell(value: unknown): string {
  if (value == null || value === '') return ''
  const text =
    value instanceof Date ? value.toISOString() : String(value)
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export function createNoopSchedulerController(): UiSchedulerController {
  return {
    refresh: () => undefined,
    goToDate: () => undefined,
    setView: () => undefined,
    select: () => undefined,
    prev: () => undefined,
    next: () => undefined,
    today: () => undefined,
    getVisibleRange: () => null,
    print: () => undefined,
    exportExcel: () => undefined,
  }
}

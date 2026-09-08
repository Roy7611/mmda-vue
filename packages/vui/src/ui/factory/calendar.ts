/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/calendar/vue3-getting-started
 *
 * chrome 月视选日走 factory.calendar。带输入框的选日仍是 datePicker / field_factory。
 */
import type { VNodeChild } from 'vue'
import type { PropData } from '../layout/layout'

export type UiCalendarView = 'month' | 'year' | 'decade'
export type UiCalendarSelection = 'single' | 'multiple'
export type UiCalendarValue = Date | Date[] | null

export interface UiCalendarDayCell {
  date: Date
  selected?: boolean
  disabled?: boolean
  otherMonth?: boolean
  today?: boolean
}

export interface UiCalendarProps extends PropData {
  value?: UiCalendarValue
  selectionMode?: UiCalendarSelection
  min?: Date
  max?: Date
  disabled?: boolean
  firstDayOfWeek?: number
  view?: UiCalendarView
  depth?: UiCalendarView
  showTodayButton?: boolean
  showOtherMonth?: boolean
  isDateDisabled?: (date: Date) => boolean
  dayCellRenderer?: (cell: UiCalendarDayCell) => VNodeChild
  /** BCP 47，如 `zh-Hans` / `en-US`。省略则跟应用/皮肤当前 i18n。 */
  locale?: string
  onChange?: (value: UiCalendarValue) => void
}

export function calendarModifierClasses(props: UiCalendarProps): unknown[] {
  const multiple =
    props.selectionMode === 'multiple' ? 'mmda-calendar--multiple' : undefined
  const noOther =
    props.showOtherMonth === false ? 'mmda-calendar--no-other-month' : undefined
  return ['mmda-calendar', multiple, noOther, props.class]
}

export function calendarBoundValue(props: UiCalendarProps): UiCalendarValue | undefined {
  const raw = props.value !== undefined ? props.value : props.modelValue
  if (raw === undefined) return undefined
  if (props.selectionMode === 'multiple') {
    if (raw == null) return []
    return Array.isArray(raw) ? raw : [raw]
  }
  return Array.isArray(raw) ? (raw[0] ?? null) : raw
}

export function emitCalendarChange(
  props: UiCalendarProps,
  next: UiCalendarValue,
): void {
  props.onChange?.(next)
  props['onUpdate:modelValue']?.(next)
}

export function sameCalendarDay(a?: Date | null, b?: Date | null): boolean {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function calendarDaySelected(
  value: UiCalendarValue | undefined,
  date: Date,
): boolean {
  if (value == null) return false
  if (Array.isArray(value)) return value.some((item) => sameCalendarDay(item, date))
  return sameCalendarDay(value, date)
}

export function calendarEj2View(
  view?: UiCalendarView,
): 'Month' | 'Year' | 'Decade' | undefined {
  if (!view) return undefined
  if (view === 'year') return 'Year'
  if (view === 'decade') return 'Decade'
  return 'Month'
}

export function calendarPrimeView(
  view?: UiCalendarView,
): 'date' | 'month' | 'year' | undefined {
  if (!view) return undefined
  if (view === 'year') return 'month'
  if (view === 'decade') return 'year'
  return 'date'
}

export function isCalendarDateDisabled(
  date: Date,
  props: Pick<UiCalendarProps, 'min' | 'max' | 'isDateDisabled'>,
): boolean {
  if (props.min && startOfDay(date).getTime() < startOfDay(props.min).getTime()) {
    return true
  }
  if (props.max && startOfDay(date).getTime() > startOfDay(props.max).getTime()) {
    return true
  }
  return props.isDateDisabled?.(date) === true
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

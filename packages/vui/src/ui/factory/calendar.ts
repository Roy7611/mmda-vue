/*
 * chrome 月视选日走 factory.calendar。带输入框的选日仍是 datePicker / field_factory。
 * 契约在 @mmda/core ui/date_picker.ts。
 */
import type { UiCalendarProps, UiCalendarValue } from '@mmda/core'

export type {
  UiCalendarDayCell,
  UiCalendarProps,
  UiCalendarSelection,
  UiCalendarValue,
  UiCalendarView,
} from '@mmda/core'
export {
  calendarBoundValue,
  calendarDaySelected,
  calendarEj2View,
  calendarModifierClasses,
  calendarPrimeView,
  isCalendarDateDisabled,
  sameCalendarDay,
  startOfDay,
} from '@mmda/core'

export function emitCalendarChange(
  props: UiCalendarProps,
  next: UiCalendarValue,
): void {
  props.onChange?.(next)
  ;(props as { 'onUpdate:modelValue'?: (value: UiCalendarValue) => void })[
    'onUpdate:modelValue'
  ]?.(next)
}

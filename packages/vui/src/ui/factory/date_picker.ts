/*
 * chrome 带输入框选日走 factory.datePicker。算法在 @mmda/core。
 * Vue v-model emit 与厂商格式映射留在本文件。
 */
import { vueUpdateOf } from '../vue_ui_props'

export type {
  UiDateEmitProps,
  UiDateInputProps,
  UiDatePickerProps,
  UiDatePrecision,
  UiDateShortcut,
  UiDateShortcutKind,
  UiDateShortcutValue,
} from '@mmda/core'
export type DatePickerFieldContext = import('@mmda/core').UiFieldBindContext
import type { UiDateEmitProps } from '@mmda/core'

export {
  DATE_PICKER_FIRST_DAY_OF_WEEK,
  DATE_PICKER_FORMAT,
  DATE_RANGE_PICKER_FORMAT,
  DATE_RANGE_SEPARATOR,
  DATE_TIME_PICKER_FORMAT,
  DATE_TIME_STEP_MINUTES,
  MONTH_PICKER_FORMAT,
  TIME_PICKER_FORMAT,
  dateOf,
  datePickerAllowInput,
  datePickerDateOf,
  datePickerFirstDayOfWeek,
  datePickerFormatOf,
  datePickerMaxOf,
  datePickerMinOf,
  datePickerModifierClasses,
  datePickerPropsFromField,
  datePickerShowClear,
  emitDateBlur,
  emitDateClear,
  emitDateFocus,
  monthPickerPropsFromField,
  resolveDateShortcutValue,
  resolveDateShortcuts,
  startOfLocalDay,
  startOfLocalMonth,
} from '@mmda/core'

/** Vue v-model + 产品 onChange / onUpdatePicker（成员具名在 core `UiDateEmitProps`）。 */
export function emitDateChange(props: UiDateEmitProps, value: unknown): void {
  props.onChange?.(value)
  vueUpdateOf(props)?.(value)
  props.onUpdatePicker?.(value)
}

/** Prime `dateFormat`：`yy` 是四位年 */
export function datePickerPrimeFormat(format: string): string {
  return format.replace(/yyyy/g, 'yy').replace(/MM/g, 'mm')
}

/** Naive / dayjs：`YYYY-MM-DD` */
export function datePickerNaiveFormat(format: string): string {
  return format.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD')
}

/** Naive `first-day-of-week`：0 是周一 */
export function datePickerNaiveFirstDayOfWeek(vuiDay: number): number {
  return (vuiDay + 6) % 7
}

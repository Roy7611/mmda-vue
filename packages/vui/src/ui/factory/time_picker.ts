/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/api/timepicker/
 *
 * chrome 时刻走 factory.timePicker。快捷日期忽略。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'
import {
  TIME_PICKER_FORMAT,
  dateOf,
  datePickerPropsFromField,
  type DatePickerFieldContext,
  type UiDateInputProps,
} from './date_picker'
import { dateTimePickerStepOf } from './date_time_picker'

export interface UiTimePickerProps extends UiDateInputProps {
  value?: Date | null
  /** 分钟步进，缺省 30 */
  step?: number
}

export function timePickerModifierClasses(props: UiTimePickerProps): unknown[] {
  return ['mmda-timepicker', props.class]
}

export function timePickerPropsFromField(
  field: MetaUiField,
  context: DatePickerFieldContext,
  extra: PropData = {},
): UiTimePickerProps {
  const { precision: _precision, ...base } = datePickerPropsFromField(
    field,
    context,
    extra,
  )
  return {
    ...base,
    value: dateOf(context.getFieldValue(field)),
    format: extra.format ?? TIME_PICKER_FORMAT,
    step: dateTimePickerStepOf(extra),
    showShortcuts: false,
    shortcuts: undefined,
  }
}

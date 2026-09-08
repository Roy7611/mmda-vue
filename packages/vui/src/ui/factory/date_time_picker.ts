/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/api/datetimepicker/
 *
 * chrome 日期+时间走 factory.dateTimePicker。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'
import {
  DATE_TIME_PICKER_FORMAT,
  DATE_TIME_STEP_MINUTES,
  dateOf,
  datePickerPropsFromField,
  type DatePickerFieldContext,
  type UiDateInputProps,
} from './date_picker'

export interface UiDateTimePickerProps extends UiDateInputProps {
  value?: Date | null
  /** 分钟步进，缺省 30 */
  step?: number
}

export function dateTimePickerModifierClasses(
  props: UiDateTimePickerProps,
): unknown[] {
  return ['mmda-datetimepicker', props.class]
}

export function dateTimePickerStepOf(props: PropData): number {
  return typeof props.step === 'number' ? props.step : DATE_TIME_STEP_MINUTES
}

export function dateTimePickerPropsFromField(
  field: MetaUiField,
  context: DatePickerFieldContext,
  extra: PropData = {},
): UiDateTimePickerProps {
  const { precision: _precision, ...base } = datePickerPropsFromField(
    field,
    context,
    extra,
  )
  return {
    ...base,
    value: dateOf(context.getFieldValue(field)),
    format: extra.format ?? DATE_TIME_PICKER_FORMAT,
    step: dateTimePickerStepOf(extra),
  }
}

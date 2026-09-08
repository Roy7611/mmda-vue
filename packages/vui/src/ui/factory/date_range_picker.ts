/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/api/daterangepicker/
 *
 * chrome 日期区间走 factory.dateRangePicker。值只暴露 [start, end] | null。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'
import {
  DATE_RANGE_PICKER_FORMAT,
  DATE_RANGE_SEPARATOR,
  dateOf,
  datePickerPropsFromField,
  type DatePickerFieldContext,
  type UiDateInputProps,
} from './date_picker'

export type UiDateRangeValue = [Date, Date] | null

export interface UiDateRangePickerProps extends UiDateInputProps {
  value?: UiDateRangeValue
  separator?: string
  minDays?: number
  maxDays?: number
}

export function dateRangePickerModifierClasses(
  props: UiDateRangePickerProps,
): unknown[] {
  return ['mmda-daterangepicker', props.class]
}

export function dateRangePickerSeparatorOf(props: PropData): string {
  return typeof props.separator === 'string' && props.separator.length
    ? props.separator
    : DATE_RANGE_SEPARATOR
}

export function dateRangeValueOf(raw: unknown): UiDateRangeValue | undefined {
  if (raw === undefined) return undefined
  if (raw == null) return null
  if (!Array.isArray(raw) || raw.length < 2) return null
  const start = dateOf(raw[0])
  const end = dateOf(raw[1])
  if (!start || !end) return null
  return [start, end]
}

export function dateRangePickerValueOf(
  props: PropData,
): UiDateRangeValue | undefined {
  if (props.value !== undefined) return dateRangeValueOf(props.value)
  if (props.modelValue !== undefined) return dateRangeValueOf(props.modelValue)
  return undefined
}

export function dateRangePickerPropsFromField(
  field: MetaUiField,
  context: DatePickerFieldContext,
  extra: PropData = {},
): UiDateRangePickerProps {
  const { precision: _precision, ...base } = datePickerPropsFromField(
    field,
    context,
    extra,
  )
  return {
    ...base,
    value: dateRangeValueOf(context.getFieldValue(field)) ?? null,
    format: extra.format ?? DATE_RANGE_PICKER_FORMAT,
    separator: dateRangePickerSeparatorOf(extra),
    minDays: extra.minDays,
    maxDays: extra.maxDays,
  }
}

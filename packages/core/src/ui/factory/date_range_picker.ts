import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'
import {
  DATE_RANGE_PICKER_FORMAT,
  DATE_RANGE_SEPARATOR,
  dateOf,
  type UiDateInputProps,
} from './date_common'
import { datePickerPropsFromField } from './date_picker'

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
  return [uiCssClass('daterangepicker'), props.class]
}

export function dateRangePickerSeparatorOf(props: UiProps): string {
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
  props: UiProps,
): UiDateRangeValue | undefined {
  if (props.value !== undefined) return dateRangeValueOf(props.value)
  if (props.modelValue !== undefined) return dateRangeValueOf(props.modelValue)
  return undefined
}

export function dateRangePickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiDateRangePickerProps {
  const { precision: _precision, ...base } = datePickerPropsFromField(
    field,
    context,
    extra,
  )
  return {
    ...base,
    value: dateRangeValueOf(context.getFieldValue(field)) ?? null,
    format: (extra.format as string | undefined) ?? DATE_RANGE_PICKER_FORMAT,
    separator: dateRangePickerSeparatorOf(extra),
    minDays: extra.minDays as number | undefined,
    maxDays: extra.maxDays as number | undefined,
  }
}

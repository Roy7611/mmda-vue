import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'
import {
  dateOf,
  datePickerAllowInput,
  datePickerMaxOf,
  datePickerMinOf,
  datePickerShowClear,
  MONTH_PICKER_FORMAT,
  type UiDateInputProps,
  type UiDatePrecision,
  type UiDateShortcut,
} from './date_common'

export interface UiDatePickerProps extends UiDateInputProps {
  value?: Date | null
  precision?: UiDatePrecision
}

export function datePickerModifierClasses(props: UiDatePickerProps): unknown[] {
  const month =
    props.precision === 'month'
      ? uiCssClass('datepicker', undefined, 'month')
      : undefined
  return [uiCssClass('datepicker'), month, props.class]
}

function fieldDateProps(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps,
): UiDateInputProps {
  return {
    min: datePickerMinOf(extra) ?? undefined,
    max: datePickerMaxOf(extra) ?? undefined,
    format: extra.format as string | undefined,
    placeholder: (extra.placeholder as string | undefined) ?? field.placeholder,
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
    allowInput: datePickerAllowInput(extra),
    showClear: datePickerShowClear(extra, field.nullable),
    openOnFocus: extra.openOnFocus as boolean | undefined,
    inputFormats: extra.inputFormats as string[] | undefined,
    readonly: extra.readonly as boolean | undefined,
    showShortcuts: extra.showShortcuts as boolean | undefined,
    shortcuts: extra.shortcuts as UiDateShortcut[] | undefined,
    firstDayOfWeek: extra.firstDayOfWeek as number | undefined,
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}

export function datePickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiDatePickerProps {
  const base = fieldDateProps(field, context, extra)
  return {
    ...base,
    value: dateOf(context.getFieldValue(field)),
    precision: extra.precision === 'month' ? 'month' : 'day',
    onChange: (value) => {
      context.setFieldValue(field, value)
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
      if (typeof extra.onUpdatePicker === 'function') extra.onUpdatePicker(value)
    },
    onClear: extra.onClear as UiDateInputProps['onClear'],
    onFocus: extra.onFocus as UiDateInputProps['onFocus'],
    onBlur: extra.onBlur as UiDateInputProps['onBlur'],
  }
}

export function monthPickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiDatePickerProps {
  return datePickerPropsFromField(field, context, {
    ...extra,
    precision: 'month',
    format: (extra.format as string | undefined) ?? MONTH_PICKER_FORMAT,
  })
}

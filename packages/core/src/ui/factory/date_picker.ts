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
  context: UiFieldBindContext
): UiDateInputProps {
  return {
    placeholder: field.placeholder,
    disabled:
      context.isFieldReadonly(field),
    showClear: field.nullable !== false,
    allowInput: false,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...({}),
    },
  }
}

export function datePickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext
): UiDatePickerProps {
  const base = fieldDateProps(field, context)
  return {
    ...base,
    value: dateOf(context.getFieldValue(field)),
    onChange: (value) => {
      context.setFieldValue(field, value)
    },
  }
}

export function monthPickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
): UiDatePickerProps {
  return {
    ...datePickerPropsFromField(field, context),
    precision: 'month',
    format: MONTH_PICKER_FORMAT,
  }
}

import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'
import { dateOf, TIME_PICKER_FORMAT, type UiDateInputProps } from './date_common'
import { datePickerPropsFromField } from './date_picker'
import { dateTimePickerStepOf } from './date_time_picker'

export interface UiTimePickerProps extends UiDateInputProps {
  value?: Date | null
  step?: number
}

export function timePickerModifierClasses(props: UiTimePickerProps): unknown[] {
  return [uiCssClass('timepicker'), props.class]
}

export function timePickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext
): UiTimePickerProps {
  const { precision: _precision, ...base } = datePickerPropsFromField(
    field,
    context,
  )
  return {
    ...base,
    value: dateOf(context.getFieldValue(field)),
    format: TIME_PICKER_FORMAT,
  }
}

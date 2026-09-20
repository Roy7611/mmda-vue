import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'
import { dateOf, TIME_PICKER_FORMAT, type UiDateEmitProps, type UiDateShortcut } from './date_common'
import { datePickerPropsFromField } from './date_picker'
import { dateTimePickerStepOf } from './date_time_picker'

export interface UiTimePickerProps extends UiDateEmitProps {
  value?: Date | null
  format?: string
  placeholder?: string
  disabled?: boolean
  allowInput?: boolean
  showClear?: boolean
  step?: number
  /** 快捷选项（与日期选择器同形）。 */
  shortcuts?: UiDateShortcut[]
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

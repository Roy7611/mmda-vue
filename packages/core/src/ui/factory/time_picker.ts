import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'
import { dateOf, TIME_PICKER_FORMAT } from './date_common'
import { datePickerPropsFromField } from './date_picker'
import { dateTimePickerStepOf } from './date_time_picker'

export interface UiTimePickerProps extends UiProps {
  value?: Date | null
  format?: string
  placeholder?: string
  disabled?: boolean
  allowInput?: boolean
  showClear?: boolean
  step?: number
  onChange?: (value: unknown) => void
  onClear?: () => void
}

export function timePickerModifierClasses(props: UiTimePickerProps): unknown[] {
  return [uiCssClass('timepicker'), props.class]
}

export function timePickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiTimePickerProps {
  const { precision: _precision, ...base } = datePickerPropsFromField(
    field,
    context,
    extra,
  )
  return {
    ...base,
    value: dateOf(context.getFieldValue(field)),
    format: (extra.format as string | undefined) ?? TIME_PICKER_FORMAT,
    step: dateTimePickerStepOf(extra),
    showShortcuts: false,
    shortcuts: undefined,
  }
}

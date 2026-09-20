import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'
import {
  DATE_TIME_PICKER_FORMAT,
  DATE_TIME_STEP_MINUTES,
  dateOf,
  type UiDateInputProps,
} from './date_common'
import { datePickerPropsFromField } from './date_picker'

export interface UiDateTimePickerProps extends UiDateInputProps {
  value?: Date | null
  /** 分钟步进；缺省见皮肤 */
  step?: number
}

export function dateTimePickerModifierClasses(
  props: UiDateTimePickerProps,
): unknown[] {
  return [uiCssClass('datetimepicker'), props.class]
}

export function dateTimePickerStepOf(props: Pick<UiDateTimePickerProps, 'step'>): number {
  return typeof props.step === 'number' ? props.step : DATE_TIME_STEP_MINUTES
}

export function dateTimePickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext
): UiDateTimePickerProps {
  const { precision: _precision, ...base } = datePickerPropsFromField(
    field,
    context,
  )
  return {
    ...base,
    value: dateOf(context.getFieldValue(field)),
    format: DATE_TIME_PICKER_FORMAT,
  }
}

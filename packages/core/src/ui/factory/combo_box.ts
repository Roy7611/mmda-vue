import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'
import { type UiProps } from '../props'
import { uiCssClass } from '../css'
import {
  dropDownListPropsFromField,
  type UiDropDownListProps,
} from './drop_down_list'

export interface UiComboBoxProps extends UiDropDownListProps {
  /** 允许自由文本；缺省 true */
  allowCustom?: boolean
}

export function comboBoxModifierClasses(props: UiComboBoxProps): unknown[] {
  const custom =
    props.allowCustom !== false
      ? uiCssClass('combobox', 'custom')
      : undefined
  return [uiCssClass('combobox'), custom, props.class]
}

export function comboBoxValueOf(props: UiComboBoxProps) {
  return props.value !== undefined ? props.value ?? null : props.modelValue ?? null
}


export function comboBoxAllowCustom(props: UiComboBoxProps): boolean {
  return props.allowCustom !== false
}

export function comboBoxPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiComboBoxProps {
  return {
    ...dropDownListPropsFromField(field, context, extra),
    allowCustom: extra.allowCustom as boolean | undefined,
  }
}

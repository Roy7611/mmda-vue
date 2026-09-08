/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/combo-box/getting-started
 *
 * chrome 可编下拉走 factory.comboBox（默认可自填）。提交选项 value；自填则为输入字符串。
 * 字段 fldFactory.comboBox 译 MetaUiField 后再调本控件。不要等于 dropDownList。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'
import {
  dropDownListPropsFromField,
  type DropDownListFieldContext,
  type UiDropDownListProps,
} from './drop_down_list'

export type {
  UiSelectOption,
  UiSelectSuggest,
} from './drop_down_list'

export interface UiComboBoxProps extends UiDropDownListProps {
  /** 允许不在 options 里的值。缺省 true（EJ2 ComboBox 默认） */
  allowCustom?: boolean
}

export type ComboBoxFieldContext = DropDownListFieldContext

export function comboBoxValueOf(props: UiComboBoxProps) {
  return props.value !== undefined ? props.value ?? null : props.modelValue ?? null
}

export function emitComboBoxChange(
  props: UiComboBoxProps,
  value: string | number | null,
): void {
  props.onChange?.(value)
  props['onUpdate:modelValue']?.(value)
  props.onUpdate?.(value)
}

export function comboBoxAllowCustom(props: UiComboBoxProps): boolean {
  return props.allowCustom !== false
}

export function comboBoxModifierClasses(props: UiComboBoxProps): unknown[] {
  const custom =
    comboBoxAllowCustom(props) ? 'mmda-combobox--custom' : undefined
  return ['mmda-combobox', custom, props.class]
}

export function comboBoxPropsFromField(
  field: MetaUiField,
  context: ComboBoxFieldContext,
  extra: PropData = {},
): UiComboBoxProps {
  return {
    ...dropDownListPropsFromField(field, context, extra),
    allowCustom: extra.allowCustom,
  }
}

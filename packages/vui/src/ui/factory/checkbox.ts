/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/check-box/getting-started
 *
 * chrome 勾选走 factory.checkBox。字段布尔格 fldFactory.checkbox 译 MetaUiField 后再调本控件。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'

export interface UiCheckBoxProps extends PropData {
  checked?: boolean
  label?: string
  /** 半选。默认 false；省略即未半选。 */
  indeterminate?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export type CheckBoxFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

export function checkBoxCheckedOf(props: UiCheckBoxProps): boolean {
  if (props.checked !== undefined) return Boolean(props.checked)
  if (props.modelValue !== undefined) return Boolean(props.modelValue)
  return false
}

export function emitCheckBoxChange(
  props: UiCheckBoxProps,
  checked: boolean,
): void {
  props.onChange?.(checked)
  props['onUpdate:modelValue']?.(checked)
  props.onUpdate?.(checked)
}

export function checkBoxModifierClasses(props: UiCheckBoxProps): unknown[] {
  const indeterminate =
    props.indeterminate === true ? 'mmda-checkbox--indeterminate' : undefined
  return ['mmda-checkbox', indeterminate, props.class]
}

export function checkBoxPropsFromField(
  field: MetaUiField,
  context: CheckBoxFieldContext,
  extra: PropData = {},
): UiCheckBoxProps {
  const label =
    extra.label === '' ? '' : (extra.label ?? field.displayLabel)
  return {
    checked: Boolean(context.getFieldValue(field)),
    label,
    indeterminate: extra.indeterminate === true ? true : undefined,
    disabled: extra.disabled ?? context.isFieldReadonly(field),
    onChange: (checked) => {
      context.setFieldValue(field, checked)
      if (typeof extra.onChange === 'function') extra.onChange(checked)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(checked)
    },
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...extra.htmlAttributes,
    },
  }
}

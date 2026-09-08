/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/switch/vue-3-getting-started
 *
 * chrome 滑动开关走 factory.switch。字段 fldFactory.switch 译 MetaUiField 后再调本控件。
 * vui 名是 switch（对象属性）。不要 function switch / import { switch }。
 * 实现函数 createSwitch。不要 CheckBox 冒充开关。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'

export interface UiSwitchProps extends PropData {
  checked?: boolean
  /** 对应 EJ2 onLabel。Prime / Naive 忽略 */
  onLabel?: string
  /** 对应 EJ2 offLabel。Prime / Naive 忽略 */
  offLabel?: string
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export type SwitchFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

export function switchArgs(
  valueOrProps?: boolean | UiSwitchProps | null,
  props: UiSwitchProps = {},
): UiSwitchProps {
  if (
    valueOrProps != null &&
    (typeof valueOrProps !== 'object' || Array.isArray(valueOrProps))
  ) {
    return { ...props, checked: Boolean(valueOrProps) }
  }
  return { ...(valueOrProps as UiSwitchProps | undefined), ...props }
}

export function switchCheckedOf(props: UiSwitchProps): boolean {
  if (props.checked !== undefined) return Boolean(props.checked)
  if (props.modelValue !== undefined) return Boolean(props.modelValue)
  return false
}

export function emitSwitchChange(
  props: UiSwitchProps,
  checked: boolean,
): void {
  props.onChange?.(checked)
  props['onUpdate:modelValue']?.(checked)
  props.onUpdate?.(checked)
}

export function switchModifierClasses(props: UiSwitchProps): unknown[] {
  return [
    'mmda-switch',
    switchCheckedOf(props) ? 'mmda-switch--checked' : undefined,
    props.disabled ? 'mmda-switch--disabled' : undefined,
    props.class,
  ]
}

export function switchPropsFromField(
  field: MetaUiField,
  context: SwitchFieldContext,
  extra: PropData = {},
): UiSwitchProps {
  return {
    checked: Boolean(context.getFieldValue(field)),
    onLabel: extra.onLabel as string | undefined,
    offLabel: extra.offLabel as string | undefined,
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

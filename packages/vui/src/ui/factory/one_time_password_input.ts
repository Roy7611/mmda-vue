/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/otp-input/vue-3-getting-started
 *
 * chrome 一次性口令走 factory.oneTimePasswordInput。长度 / 类型用 EJ2 词，不要写 Prime mask / integerOnly。
 * 字段 fieldFactory.oneTimePasswordInput 译 MetaUiField 后再调本控件。
 */
import type {
  MetaUiField,
  UiOneTimePasswordInputProps,
  UiOneTimePasswordType,
} from '@mmda/core'
import type {UiProps} from '../layout'
import { vueUpdateOf, type VueModelProps } from '../vue_ui_props'

export const DEFAULT_OTP_LENGTH = 4

export type { UiOneTimePasswordType, UiOneTimePasswordInputProps } from '@mmda/core'

export type OneTimePasswordFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

export function oneTimePasswordValueOf(
  props: VueModelProps<UiOneTimePasswordInputProps>,
): string {
  if (props.value !== undefined && props.value != null) return String(props.value)
  if (props.modelValue !== undefined && props.modelValue != null) {
    return String(props.modelValue)
  }
  return ''
}

export function oneTimePasswordLengthOf(
  props: UiOneTimePasswordInputProps,
): number {
  const n = Number(props.length)
  if (Number.isFinite(n) && n >= 1) return Math.floor(n)
  return DEFAULT_OTP_LENGTH
}

export function oneTimePasswordTypeOf(
  props: UiOneTimePasswordInputProps,
): UiOneTimePasswordType {
  if (props.type === 'text' || props.type === 'password' || props.type === 'number') {
    return props.type
  }
  return 'number'
}

export function emitOneTimePasswordChange(
  props: UiOneTimePasswordInputProps,
  value: unknown,
): void {
  const next = value == null ? '' : String(value)
  props.onChange?.(next)
  vueUpdateOf(props)?.(next)
}

export { oneTimePasswordModifierClasses } from '@mmda/core'

function otpLengthFromField(
  field: MetaUiField
): number {
  const max = field.maxLength
  if (typeof max === 'number' && max >= 1 && max <= 12) return max
  return DEFAULT_OTP_LENGTH
}

export function oneTimePasswordPropsFromField(
  field: MetaUiField,
  context: OneTimePasswordFieldContext
): UiOneTimePasswordInputProps {
  const typeRaw: unknown = undefined
  const type: UiOneTimePasswordType =
    typeRaw === 'text' || typeRaw === 'password' || typeRaw === 'number'
      ? typeRaw
      : 'number'
  return {
    value: (() => {
      const raw = context.getFieldValue(field)
      return raw == null ? '' : String(raw)
    })(),
    length: otpLengthFromField(field),
    type,
    placeholder:
      field.placeholder,
    disabled:
      context.isFieldReadonly(field),
    onChange: (value) => {
      context.setFieldValue(field, value)
    },
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...({}),
    },
  }
}

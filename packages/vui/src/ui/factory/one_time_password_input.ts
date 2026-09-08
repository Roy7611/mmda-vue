/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/otp-input/vue-3-getting-started
 *
 * chrome 一次性口令走 factory.oneTimePasswordInput。长度 / 类型用 EJ2 词，不要写 Prime mask / integerOnly。
 * 字段 fldFactory.oneTimePasswordInput 译 MetaUiField 后再调本控件。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'

export const DEFAULT_OTP_LENGTH = 4

export type UiOneTimePasswordType = 'number' | 'text' | 'password'

export interface UiOneTimePasswordInputProps extends PropData {
  value?: string
  /** 格数。默认 4。 */
  length?: number
  /** EJ2：number / text / password。默认 number。 */
  type?: UiOneTimePasswordType
  /** 格间分隔符。对应 EJ2 separator */
  separator?: string
  placeholder?: string
  disabled?: boolean
  onChange?: (value: string) => void
}

export type OneTimePasswordFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

export function oneTimePasswordValueOf(
  props: UiOneTimePasswordInputProps,
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
  props['onUpdate:modelValue']?.(next)
  props.onUpdate?.(next)
}

export function oneTimePasswordModifierClasses(
  props: UiOneTimePasswordInputProps,
): unknown[] {
  return ['mmda-otpinput', props.class]
}

function otpLengthFromField(
  field: MetaUiField,
  extra: PropData,
): number {
  if (extra.length != null && extra.length !== '') {
    const n = Number(extra.length)
    if (Number.isFinite(n) && n >= 1) return Math.floor(n)
  }
  const max = field.maxLength
  if (typeof max === 'number' && max >= 1 && max <= 12) return max
  return DEFAULT_OTP_LENGTH
}

export function oneTimePasswordPropsFromField(
  field: MetaUiField,
  context: OneTimePasswordFieldContext,
  extra: PropData = {},
): UiOneTimePasswordInputProps {
  const typeRaw = extra.type
  const type: UiOneTimePasswordType =
    typeRaw === 'text' || typeRaw === 'password' || typeRaw === 'number'
      ? typeRaw
      : 'number'
  return {
    value: (() => {
      const raw = context.getFieldValue(field)
      return raw == null ? '' : String(raw)
    })(),
    length: otpLengthFromField(field, extra),
    type,
    separator: extra.separator,
    placeholder: extra.placeholder ?? field.placeholder,
    disabled: extra.disabled ?? context.isFieldReadonly(field),
    onChange: (value) => {
      context.setFieldValue(field, value)
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...extra.htmlAttributes,
    },
  }
}

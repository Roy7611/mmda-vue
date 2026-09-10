/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/otp-input/vue-3-getting-started
 *
 * chrome 一次性口令走 factory.oneTimePasswordInput。长度 / 类型用 EJ2 词，不要写 Prime mask / integerOnly。
 * 字段 fieldFactory.oneTimePasswordInput 译 MetaUiField 后再调本控件。
 */
import { callUiBagFn } from '@mmda/core'
import type {
  MetaUiField,
  UiOneTimePasswordInputProps,
  UiOneTimePasswordType,
} from '@mmda/core'
import type {UiProps} from '../layout/layout'

export const DEFAULT_OTP_LENGTH = 4

export type { UiOneTimePasswordType, UiOneTimePasswordInputProps } from '@mmda/core'

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
  callUiBagFn(props, 'onUpdate:modelValue', next)
  callUiBagFn(props, 'onUpdate', next)
}

export { oneTimePasswordModifierClasses } from '@mmda/core'

function otpLengthFromField(
  field: MetaUiField,
  extra: UiProps,
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
  extra: UiProps = {},
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
    separator: extra.separator as string | undefined,
    placeholder:
      (extra.placeholder as string | undefined) ?? field.placeholder,
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
    onChange: (value) => {
      context.setFieldValue(field, value)
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}

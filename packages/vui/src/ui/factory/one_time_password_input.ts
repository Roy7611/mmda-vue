/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/otp-input/vue-3-getting-started
 *
 * chrome 一次性口令走 factory.oneTimePasswordInput。长度 / 类型用 EJ2 词，不要写 Prime mask / integerOnly。
 * 字段 fieldFactory.oneTimePasswordInput 译 MetaUiField 后再调本控件。
 */
import type {
  UiOneTimePasswordInputProps,
  UiOneTimePasswordType,
} from '@mmda/core'
import type {UiProps} from '@mmda/core'
import { vuiUpdateOf, type VuiModelProps } from '../vui_props'
import { DEFAULT_OTP_LENGTH as coreDefaultOtpLength } from '@mmda/core'
export {
  DEFAULT_OTP_LENGTH,
  oneTimePasswordPropsFromField,
} from '@mmda/core'

export type { UiOneTimePasswordType, UiOneTimePasswordInputProps } from '@mmda/core'

export type { UiFieldBindContext as OneTimePasswordFieldContext } from '@mmda/core'

export function oneTimePasswordValueOf(
  props: VuiModelProps<UiOneTimePasswordInputProps>,
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
  return coreDefaultOtpLength
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
  vuiUpdateOf(props)?.(next)
}

export { oneTimePasswordModifierClasses } from '@mmda/core'

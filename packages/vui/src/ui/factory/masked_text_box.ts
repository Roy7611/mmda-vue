/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/maskedtextbox/vue3-getting-started
 *
 * chrome 掩码输入走 factory.maskedTextBox。vui mask 用 EJ2 元素，不要写 Prime 的 9。
 * 字段 fldFactory.maskedTextBox / mobileInput / zipCodeInput 译 MetaUiField 后再调本控件。
 */
import { callUiBagFn } from '@mmda/core'
import type { MetaUiField, UiMaskedTextBoxProps } from '@mmda/core'
import type {UiProps, UiBagExtra} from '../layout/layout'

/** 大陆手机：11 位数字，中间空格。EJ2 `0` = 数字。 */
export const MOBILE_MASK = '000 0000 0000'
/** 6 位邮编。 */
export const ZIP_MASK = '000000'

export type { UiMaskedTextBoxProps } from '@mmda/core'

export type MaskedTextBoxFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

export function maskedTextBoxValueOf(props: UiMaskedTextBoxProps): string {
  if (props.value !== undefined && props.value != null) return String(props.value)
  if (props.modelValue !== undefined && props.modelValue != null) {
    return String(props.modelValue)
  }
  return ''
}

export function emitMaskedTextBoxChange(
  props: UiMaskedTextBoxProps,
  value: unknown,
): void {
  const next = value == null ? '' : String(value)
  props.onChange?.(next)
  callUiBagFn(props, 'onUpdate:modelValue', next)
  callUiBagFn(props, 'onUpdate', next)
}

export { maskedTextBoxModifierClasses } from '@mmda/core'

/**
 * EJ2 mask → Prime InputMask。
 * `0`/`9`/`#` → `9`，`L`/`?` → `a`，`A`/`a`/`&`/`C` → `*`，`\` 后一字面量。
 */
export function primeMaskOf(mask: string): string {
  let out = ''
  for (let i = 0; i < mask.length; i += 1) {
    const ch = mask[i]!
    if (ch === '\\') {
      const next = mask[i + 1]
      if (next != null) {
        out += next
        i += 1
      }
      continue
    }
    if (ch === '0' || ch === '9' || ch === '#') {
      out += '9'
      continue
    }
    if (ch === 'L' || ch === '?') {
      out += 'a'
      continue
    }
    if (ch === 'A' || ch === 'a' || ch === '&' || ch === 'C') {
      out += '*'
      continue
    }
    out += ch
  }
  return out
}

export function maskedTextBoxPropsFromField(
  field: MetaUiField,
  context: MaskedTextBoxFieldContext,
  extra: UiBagExtra = {},
): UiMaskedTextBoxProps {
  const mask = String(extra.mask ?? '')
  return {
    value: (() => {
      const raw = context.getFieldValue(field)
      return raw == null ? '' : String(raw)
    })(),
    mask,
    placeholder: extra.placeholder ?? field.placeholder,
    disabled: extra.disabled ?? context.isFieldReadonly(field),
    promptChar: extra.promptChar,
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

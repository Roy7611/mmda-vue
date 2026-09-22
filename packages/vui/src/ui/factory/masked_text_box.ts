/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/maskedtextbox/vue3-getting-started
 *
 * chrome 掩码输入走 factory.maskedTextBox。vui mask 用 EJ2 元素，不要写 Prime 的 9。
 * 字段 fieldFactory.maskedTextBox / mobileInput / zipCodeInput 译 MetaUiField 后再调本控件。
 */
import type { UiMaskedTextBoxProps } from '@mmda/core'
import type {UiProps} from '@mmda/core'
import { vuiUpdateOf, type VuiModelProps } from '../vui_props'
export {
  MOBILE_MASK,
  ZIP_MASK,
  maskedTextBoxPropsFromField,
  type MaskedTextBoxFieldContext,
} from '@mmda/core'

export type { UiMaskedTextBoxProps } from '@mmda/core'

export function maskedTextBoxValueOf(
  props: VuiModelProps<UiMaskedTextBoxProps>,
): string {
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
  vuiUpdateOf(props)?.(next)
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

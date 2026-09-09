import { uiCssClass } from '../css'
import type { UiProps } from '../props'

export interface UiMaskedTextBoxProps extends UiProps {
  value?: string
  /** EJ2 掩码元素：`0` 数字、`L` 字母、`A` 字母数字；字面量原样。 */
  mask: string
  placeholder?: string
  disabled?: boolean
  /** 未填位提示符。对应 EJ2 promptChar */
  promptChar?: string
  onChange?: (value: string) => void
}

export function maskedTextBoxModifierClasses(
  props: UiMaskedTextBoxProps,
): unknown[] {
  return [uiCssClass('maskedtextbox'), props.class]
}

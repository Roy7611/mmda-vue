import { uiCssClass } from '../css'
import type { UiProps } from '../props'

export type UiOneTimePasswordType = 'number' | 'text' | 'password'

export interface UiOneTimePasswordInputProps extends UiProps {
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

export function oneTimePasswordModifierClasses(
  props: UiOneTimePasswordInputProps,
): unknown[] {
  return [uiCssClass('otpinput'), props.class]
}

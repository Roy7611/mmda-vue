import { uiCssClass } from '../css'
import type { UiProps } from '../props'
import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'
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

export const DEFAULT_OTP_LENGTH = 4

function otpLengthFromField(field: MetaUiField): number {
  const max = field.maxLength
  if (typeof max === 'number' && max >= 1 && max <= 12) return max
  return DEFAULT_OTP_LENGTH
}

export function oneTimePasswordPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
): UiOneTimePasswordInputProps {
  const raw = context.getFieldValue(field)
  return {
    value: raw == null ? '' : String(raw),
    length: otpLengthFromField(field),
    type: 'number',
    placeholder: field.placeholder,
    disabled: context.isFieldReadonly(field),
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

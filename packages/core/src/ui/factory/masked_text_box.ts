import { uiCssClass } from '../css'
import type { UiProps } from '../props'
import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'
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

/** 大陆手机：11 位数字，中间空格。EJ2 `0` = 数字。 */
export const MOBILE_MASK = '000 0000 0000'
/** 6 位邮编。 */
export const ZIP_MASK = '000000'

export type MaskedTextBoxFieldContext = UiFieldBindContext

export function maskedTextBoxPropsFromField(
  field: MetaUiField,
  context: MaskedTextBoxFieldContext,
  options?: Partial<UiMaskedTextBoxProps>,
): UiMaskedTextBoxProps {
  const raw = context.getFieldValue(field)
  return {
    value: raw == null ? '' : String(raw),
    mask: options?.mask ?? (field as { mask?: string }).mask ?? '',
    placeholder: field.placeholder,
    disabled: context.isFieldReadonly(field),
    onChange: (value) => {
      context.setFieldValue(field, value)
    },
    ...options,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...({}),
    },
  }
}

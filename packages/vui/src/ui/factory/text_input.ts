/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/textbox/vue3-getting-started
 *
 * chrome 单行文本走 factory.textInput。vui 名是 textInput，不要 input / textBox / InputText / NInput。
 * 字段 fldFactory.textInput 译 MetaUiField 后再调本控件。多行仍是 factory.textArea。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'

export type UiTextInputType =
  | 'Text'
  | 'Password'
  | 'Email'
  | 'Number'
  | 'Search'
  | 'Tel'
  | 'Url'

export interface UiTextInputProps extends PropData {
  value?: string
  placeholder?: string
  disabled?: boolean
  /** HTML / EJ2 TextBox 原词。不要 Rating 那套 readOnly */
  readonly?: boolean
  type?: UiTextInputType
  maxLength?: number
  showClearButton?: boolean
  autocomplete?: string
  width?: string | number
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

export type TextInputFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

function isTrue(raw: unknown): boolean {
  return raw === true || raw === 'true'
}

export function textInputValueOf(props: UiTextInputProps): string {
  const raw = props.value !== undefined ? props.value : props.modelValue
  if (raw == null) return ''
  return String(raw)
}

export function textInputPlaceholderOf(
  props: UiTextInputProps,
): string | undefined {
  if (props.placeholder == null || props.placeholder === '') return undefined
  return String(props.placeholder)
}

export function textInputTypeOf(props: UiTextInputProps): UiTextInputType {
  const raw = props.type
  if (typeof raw !== 'string' || !raw) return 'Text'
  const n = raw.replace(/[-_\s]/g, '').toLowerCase()
  if (n === 'password') return 'Password'
  if (n === 'email') return 'Email'
  if (n === 'number') return 'Number'
  if (n === 'search') return 'Search'
  if (n === 'tel') return 'Tel'
  if (n === 'url') return 'Url'
  if (n === 'text') return 'Text'
  return 'Text'
}

export function textInputHtmlTypeOf(type: UiTextInputType): string {
  return type.toLowerCase()
}

export function textInputMaxLengthOf(
  props: UiTextInputProps,
): number | undefined {
  const raw = props.maxLength ?? props.maxlength
  const n = Number(raw)
  if (!Number.isFinite(n) || n < 0) return undefined
  return Math.floor(n)
}

export function textInputReadonlyOf(props: UiTextInputProps): boolean {
  return isTrue(props.readonly) || isTrue(props.readOnly)
}

export function textInputDisabledOf(props: UiTextInputProps): boolean {
  return isTrue(props.disabled)
}

export function textInputShowClearButtonOf(props: UiTextInputProps): boolean {
  return isTrue(props.showClearButton)
}

export function textInputAutocompleteOf(
  props: UiTextInputProps,
): string | undefined {
  if (props.autocomplete == null || props.autocomplete === '') return undefined
  return String(props.autocomplete)
}

export function emitTextInputChange(
  props: UiTextInputProps,
  raw: unknown,
): void {
  let unpacked = raw
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    const args = raw as { value?: unknown }
    if (args.value !== undefined) unpacked = args.value
  }
  const next = unpacked == null ? '' : String(unpacked)
  props.onChange?.(next)
  props['onUpdate:modelValue']?.(next)
  props.onUpdate?.(next)
}

export function emitTextInputFocus(props: UiTextInputProps): void {
  props.onFocus?.()
}

export function emitTextInputBlur(props: UiTextInputProps): void {
  props.onBlur?.()
}

export function textInputModifierClasses(props: UiTextInputProps): unknown[] {
  const type = textInputTypeOf(props)
  return [
    'mmda-textinput',
    type !== 'Text' ? `mmda-textinput--${type.toLowerCase()}` : undefined,
    textInputShowClearButtonOf(props) ? 'mmda-textinput--clear' : undefined,
    props.class,
  ]
}

export function textInputPropsFromField(
  field: MetaUiField,
  context: TextInputFieldContext,
  extra: PropData = {},
): UiTextInputProps {
  const raw = context.getFieldValue(field)
  return {
    value: raw == null ? '' : String(raw),
    placeholder: extra.placeholder ?? field.placeholder,
    disabled: extra.disabled ?? context.isFieldReadonly(field),
    readonly: extra.readonly ?? extra.readOnly ?? context.isFieldReadonly(field),
    type: extra.type as UiTextInputType | undefined,
    maxLength: extra.maxLength ?? extra.maxlength ?? field.maxLength,
    showClearButton: extra.showClearButton,
    autocomplete: extra.autocomplete,
    width: extra.width,
    onChange: (value) => {
      context.setFieldValue(field, value)
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    onFocus: extra.onFocus,
    onBlur: extra.onBlur,
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...extra.htmlAttributes,
    },
  }
}

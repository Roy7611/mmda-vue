import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import { type UiProps } from '../props'

export type UiTextInputType =
  | 'Text'
  | 'Password'
  | 'Email'
  | 'Number'
  | 'Search'
  | 'Tel'
  | 'Url'

export interface UiTextInputProps extends UiProps {
  value?: string
  placeholder?: string
  disabled?: boolean
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

function textInputTypeStem(props: UiTextInputProps): UiTextInputType {
  const raw = props.type
  if (typeof raw !== 'string' || !raw) return 'Text'
  const n = raw.replace(/[-_\s]/g, '').toLowerCase()
  if (n === 'password') return 'Password'
  if (n === 'email') return 'Email'
  if (n === 'number') return 'Number'
  if (n === 'search') return 'Search'
  if (n === 'tel') return 'Tel'
  if (n === 'url') return 'Url'
  return 'Text'
}

export function textInputModifierClasses(props: UiTextInputProps): unknown[] {
  const type = textInputTypeStem(props)
  const showClear = props.showClearButton === true
  return [
    uiCssClass('textinput'),
    type !== 'Text' ? uiCssClass('textinput', type.toLowerCase()) : undefined,
    showClear ? uiCssClass('textinput', 'clear') : undefined,
    props.class,
  ]
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
  return textInputTypeStem(props)
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

export function emitTextInputFocus(props: UiTextInputProps): void {
  props.onFocus?.()
}

export function emitTextInputBlur(props: UiTextInputProps): void {
  props.onBlur?.()
}

export function textInputPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiTextInputProps {
  const raw = context.getFieldValue(field)
  return {
    value: raw == null ? '' : String(raw),
    placeholder: (extra.placeholder as string | undefined) ?? field.placeholder,
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
    readonly:
      (extra.readonly as boolean | undefined) ??
      (extra.readOnly as boolean | undefined) ??
      context.isFieldReadonly(field),
    type: extra.type as UiTextInputType | undefined,
    maxLength:
      (extra.maxLength as number | undefined) ??
      (extra.maxlength as number | undefined) ??
      field.maxLength,
    showClearButton: extra.showClearButton as boolean | undefined,
    autocomplete: extra.autocomplete as string | undefined,
    width: extra.width as string | number | undefined,
    onChange: (value) => {
      context.setFieldValue(field, value)
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    onFocus: extra.onFocus as UiTextInputProps['onFocus'],
    onBlur: extra.onBlur as UiTextInputProps['onBlur'],
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}

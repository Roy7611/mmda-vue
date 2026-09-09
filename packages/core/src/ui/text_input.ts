import type { MetaUiField } from '../metaui/metaui_field'
import { uiCssClass } from './css'
import type { UiFieldBindContext } from './field_factory'
import { callUiBagFn, type UiProps } from './props'

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

export type UiTextAreaResizeMode = 'None' | 'Both' | 'Horizontal' | 'Vertical'

export interface UiTextAreaProps extends UiProps {
  value?: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  rows?: number
  cols?: number
  maxLength?: number
  resizeMode?: UiTextAreaResizeMode
  onChange?: (value: string) => void
}

export function textAreaModifierClasses(props: UiTextAreaProps): unknown[] {
  const m = props.resizeMode
  const mode: UiTextAreaResizeMode =
    m === 'None' || m === 'Both' || m === 'Horizontal' || m === 'Vertical'
      ? m
      : 'Vertical'
  const autoResize =
    props.autoResize === true || props.autoResize === 'true'
  return [
    uiCssClass('textarea'),
    uiCssClass('textarea', mode.toLowerCase()),
    autoResize ? uiCssClass('textarea', 'autoresize') : undefined,
    props.class,
  ]
}

export type UiNumberInputKind = 'number' | 'percent'

export interface UiNumberInputProps extends UiProps {
  value?: number | null
  min?: number
  max?: number
  step?: number
  decimals?: number
  format?: string
  placeholder?: string
  disabled?: boolean
  showSpinButton?: boolean
  suffix?: string
  kind?: UiNumberInputKind
  onChange?: (value: number | null) => void
}

export function numberInputModifierClasses(props: UiNumberInputProps): unknown[] {
  return [
    uiCssClass('numberinput'),
    props.kind === 'percent'
      ? uiCssClass('numberinput', 'percent')
      : undefined,
    props.suffix ? uiCssClass('numeric-with-unit') : undefined,
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
  callUiBagFn(props, 'onUpdate:modelValue', next)
  callUiBagFn(props, 'onUpdate', next)
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

export const DEFAULT_TEXT_AREA_ROWS = 3

export function textAreaValueOf(props: UiTextAreaProps): string {
  const raw = props.value !== undefined ? props.value : props.modelValue
  if (raw == null) return ''
  return String(raw)
}

export function textAreaRowsOf(props: UiTextAreaProps): number {
  const n = Number(props.rows)
  if (Number.isFinite(n) && n >= 1) return Math.floor(n)
  return DEFAULT_TEXT_AREA_ROWS
}

export function textAreaColsOf(props: UiTextAreaProps): number | undefined {
  const n = Number(props.cols)
  if (!Number.isFinite(n) || n < 1) return undefined
  return Math.floor(n)
}

export function textAreaMaxLengthOf(
  props: UiTextAreaProps,
): number | undefined {
  const n = Number(props.maxLength)
  if (!Number.isFinite(n) || n < 0) return undefined
  return Math.floor(n)
}

export function textAreaResizeModeOf(
  props: UiTextAreaProps,
): UiTextAreaResizeMode {
  const m = props.resizeMode
  if (m === 'None' || m === 'Both' || m === 'Horizontal' || m === 'Vertical') {
    return m
  }
  return 'Vertical'
}

export function textAreaCssResizeOf(mode: UiTextAreaResizeMode): string {
  return mode.toLowerCase()
}

export function textAreaAutoResizeOf(props: UiTextAreaProps): boolean {
  return isTrue(props.autoResize)
}

export function textAreaReadOnlyOf(props: UiTextAreaProps): boolean {
  return isTrue(props.readOnly)
}

export function textAreaDisabledOf(props: UiTextAreaProps): boolean {
  return isTrue(props.disabled)
}

export function emitTextAreaChange(
  props: UiTextAreaProps,
  raw: unknown,
): void {
  let unpacked = raw
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    const args = raw as { value?: unknown }
    if (args.value !== undefined) unpacked = args.value
  }
  const next = unpacked == null ? '' : String(unpacked)
  props.onChange?.(next)
  callUiBagFn(props, 'onUpdate:modelValue', next)
  callUiBagFn(props, 'onUpdate', next)
}

export function textAreaPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiTextAreaProps {
  const raw = context.getFieldValue(field)
  return {
    value: raw == null ? '' : String(raw),
    placeholder: (extra.placeholder as string | undefined) ?? field.placeholder,
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
    readOnly:
      (extra.readOnly as boolean | undefined) ?? context.isFieldReadonly(field),
    rows: extra.rows as number | undefined,
    cols: extra.cols as number | undefined,
    maxLength: (extra.maxLength as number | undefined) ?? field.maxLength,
    resizeMode: extra.resizeMode as UiTextAreaResizeMode | undefined,
    autoResize: extra.autoResize,
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

export function numberInputStepOf(
  props: Pick<UiNumberInputProps, 'step' | 'kind'>,
): number {
  if (props.step != null) return Number(props.step)
  return props.kind === 'percent' ? 0.01 : 1
}

export function numberInputFormatOf(
  props: Pick<UiNumberInputProps, 'format' | 'kind'>,
): string {
  if (props.format != null && String(props.format) !== '') {
    return String(props.format)
  }
  return props.kind === 'percent' ? 'p' : 'n'
}

export function numberInputDecimalsOf(
  props: UiNumberInputProps,
): number | undefined {
  const raw = props.decimals ?? props.maxFractionDigits
  if (raw == null || raw === '') return undefined
  const n = Number(raw)
  return Number.isNaN(n) ? undefined : n
}

export function emitNumberInputChange(
  props: UiNumberInputProps,
  value: unknown,
): void {
  let next: number | null = null
  if (value != null && value !== '') {
    if (typeof value === 'object' && 'value' in (value as object)) {
      emitNumberInputChange(props, (value as { value?: unknown }).value)
      return
    }
    const n = Number(value)
    next = Number.isFinite(n) ? n : null
  }
  props.onChange?.(next)
  callUiBagFn(props, 'onUpdate:modelValue', next)
  callUiBagFn(props, 'onUpdate', next)
}

function fieldNumberOf(raw: unknown): number | null {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function numberInputPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiNumberInputProps {
  const kind = (extra.kind as UiNumberInputKind | undefined) ?? 'number'
  const decimalsRaw =
    extra.decimals ??
    extra.maxFractionDigits ??
    (field as { scale?: unknown }).scale ??
    field.numericScale
  const decimals =
    decimalsRaw == null || decimalsRaw === ''
      ? undefined
      : Number(decimalsRaw)
  const draft: UiNumberInputProps = {
    kind,
    min: extra.min as number | undefined,
    max: extra.max as number | undefined,
    step: extra.step as number | undefined,
    format: extra.format as string | undefined,
  }
  return {
    value: fieldNumberOf(context.getFieldValue(field)),
    kind,
    min: draft.min,
    max: draft.max,
    step: numberInputStepOf(draft),
    decimals: decimals != null && !Number.isNaN(decimals) ? decimals : undefined,
    format: numberInputFormatOf(draft),
    placeholder: (extra.placeholder as string | undefined) ?? field.placeholder,
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
    showSpinButton: extra.showSpinButton as boolean | undefined,
    suffix: extra.suffix as string | undefined,
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

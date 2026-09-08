/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/textarea/vue3-getting-started
 *
 * chrome 多行文本走 factory.textArea。vui 名是 textArea，不要 textarea / Textarea / NInput。
 * 字段 fldFactory.textArea 译 MetaUiField 后再调本控件。普通单行仍是 factory.textInput。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'

export const DEFAULT_TEXT_AREA_ROWS = 3

export type UiTextAreaResizeMode = 'None' | 'Both' | 'Horizontal' | 'Vertical'

export interface UiTextAreaProps extends PropData {
  value?: string
  placeholder?: string
  disabled?: boolean
  /** EJ2 拼写。不要 vui 主名 readonly */
  readOnly?: boolean
  rows?: number
  cols?: number
  maxLength?: number
  /** EJ2：拖拽改大小。默认 Vertical */
  resizeMode?: UiTextAreaResizeMode
  onChange?: (value: string) => void
}

export type TextAreaFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

function isTrue(raw: unknown): boolean {
  return raw === true || raw === 'true'
}

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

/** 入口旧词 autoResize：随内容长高。不是 vui 主名。 */
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
  props['onUpdate:modelValue']?.(next)
  props.onUpdate?.(next)
}

export function textAreaModifierClasses(props: UiTextAreaProps): unknown[] {
  const mode = textAreaResizeModeOf(props).toLowerCase()
  return [
    'mmda-textarea',
    `mmda-textarea--${mode}`,
    textAreaAutoResizeOf(props) ? 'mmda-textarea--autoresize' : undefined,
    props.class,
  ]
}

export function textAreaPropsFromField(
  field: MetaUiField,
  context: TextAreaFieldContext,
  extra: PropData = {},
): UiTextAreaProps {
  const raw = context.getFieldValue(field)
  return {
    value: raw == null ? '' : String(raw),
    placeholder: extra.placeholder ?? field.placeholder,
    disabled: extra.disabled ?? context.isFieldReadonly(field),
    readOnly: extra.readOnly ?? context.isFieldReadonly(field),
    rows: extra.rows as number | undefined,
    cols: extra.cols as number | undefined,
    maxLength: extra.maxLength ?? field.maxLength,
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
      ...extra.htmlAttributes,
    },
  }
}

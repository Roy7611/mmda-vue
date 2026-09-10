import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import { type UiProps } from '../props'

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

function isTrue(raw: unknown): boolean {
  return raw === true || raw === 'true'
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

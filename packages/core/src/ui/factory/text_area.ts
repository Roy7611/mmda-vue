import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'
export type UiTextAreaResizeMode = 'None' | 'Both' | 'Horizontal' | 'Vertical'

export interface UiTextAreaProps extends UiProps {
  /** 高度随内容自适应。 */
  autoResize?: boolean
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
    props.autoResize === true
  return [
    uiCssClass('textarea'),
    uiCssClass('textarea', undefined, mode.toLowerCase()),
    autoResize ? uiCssClass('textarea', undefined, 'autoresize') : undefined,
    props.class,
  ]
}

function isTrue(raw: unknown): boolean {
  return raw === true || raw === 'true'
}

export const DEFAULT_TEXT_AREA_ROWS = 3

export function textAreaValueOf(props: UiTextAreaProps): string {
  const raw = props.value
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
  context: UiFieldBindContext
): UiTextAreaProps {
  const raw = context.getFieldValue(field)
  return {
    value: raw == null ? '' : String(raw),
    placeholder: field.placeholder,
    disabled:
      context.isFieldReadonly(field),
    readOnly:
      context.isFieldReadonly(field),
    maxLength: field.maxLength,
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

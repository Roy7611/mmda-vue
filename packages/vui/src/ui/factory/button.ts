import type { LinkHTMLAttributes, VNode } from 'vue'
import type { UiAction } from './action'
import type { UiColorRole } from '../../app/material'
import type { PropData, UiDirection } from '../layout/layout'

export type UiButtonShape = 'square' | 'round' | 'circle'
export type UiButtonType =
  | 'filled'
  | 'outlined'
  | 'elevated'
  | 'tonal'
  | 'link'
  | 'text'
export type UiButtonSize = 'small' | 'large'

export interface UiButtonProps extends PropData, UiAction {
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  buttonType?: UiButtonType
  size?: UiButtonSize
  shape?: UiButtonShape
  colorRole?: UiColorRole
  type?: 'button' | 'submit' | 'reset'
  onClick?: UiAction['onAction']
}

export function buttonModifierClasses(props: UiButtonProps): unknown[] {
  const role = props.colorRole ? `mmda-button--${props.colorRole}` : undefined
  const surface =
    props.buttonType && props.buttonType !== 'filled'
      ? `mmda-button--${props.buttonType}`
      : undefined
  const shape =
    props.shape && props.shape !== 'square'
      ? `mmda-button--${props.shape}`
      : undefined
  return ['mmda-button', role, surface, shape, props.class]
}

export interface UiButtonSlots {
  default: () => VNode[]
}

export interface UiButtonGroupProps extends PropData {
  orientation?: UiDirection
}

export interface UiSelectButtonGroupProps extends PropData {
  options?: unknown[]
  optionLabel?: string
  optionValue?: string
  /** 默认 `single`。与表格等同一术语。`multiple` 时 value / onUpdate 为数组。 */
  selectionMode?: 'single' | 'multiple'
  modelValue?: unknown
  onUpdate?: (value: unknown) => void
  orientation?: UiDirection
}

export interface UiLinkProps extends LinkHTMLAttributes {
  [index: string]: unknown
  text?: string
  target?: '_self' | '_blank' | '_parent' | '_top'
  colorRole?: UiColorRole
}
export interface UiLinkSlots {
  default: () => VNode[]
}

export type UiLinkType = UiLinkProps & UiLinkSlots

export function selectButtonOptionLabel(
  option: unknown,
  optionLabel?: string,
): string {
  if (option == null) return ''
  if (typeof option !== 'object') return String(option)
  const row = option as Record<string, unknown>
  const key = optionLabel && optionLabel in row ? optionLabel : undefined
  const raw = key
    ? row[key]
    : (row.label ?? row.name ?? row.text ?? row.value)
  return raw == null ? '' : String(raw)
}

export function selectButtonOptionValue(
  option: unknown,
  optionValue?: string,
): unknown {
  if (option == null || typeof option !== 'object') return option
  const row = option as Record<string, unknown>
  if (optionValue && optionValue in row) return row[optionValue]
  if ('value' in row) return row.value
  return option
}

export function selectButtonGroupUpdateOf(
  props: UiSelectButtonGroupProps,
): ((value: unknown) => void) | undefined {
  return props.onUpdate ?? props['onUpdate:modelValue']
}

export function selectButtonGroupSelected(
  current: unknown,
  optionValue: unknown,
  selectionMode?: 'single' | 'multiple',
): boolean {
  if (selectionMode === 'multiple') {
    return Array.isArray(current)
      ? current.some((item) => item === optionValue)
      : false
  }
  return current === optionValue
}

export function toggleSelectButtonGroupValue(
  current: unknown,
  optionValue: unknown,
  selectionMode?: 'single' | 'multiple',
): unknown {
  if (selectionMode !== 'multiple') return optionValue
  const list = Array.isArray(current) ? [...current] : []
  const index = list.findIndex((item) => item === optionValue)
  if (index >= 0) list.splice(index, 1)
  else list.push(optionValue)
  return list
}

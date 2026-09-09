import type { UiAction } from '../action'
import type { UiOrientation } from '../layout'
import type { UiColorRole, UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiButtonShape = 'square' | 'round' | 'circle'
export type UiButtonType =
  | 'filled'
  | 'outlined'
  | 'elevated'
  | 'tonal'
  | 'link'
  | 'text'
export type UiButtonSize = 'small' | 'large'

export interface UiButtonProps extends UiProps, UiAction {
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  buttonType?: UiButtonType
  size?: UiButtonSize
  shape?: UiButtonShape
  colorRole?: UiColorRole
  type?: 'button' | 'submit' | 'reset'
  onClick?: UiAction['onAction']
}

export function buttonModifierClasses(props: UiButtonProps): unknown[] {
  const role = props.colorRole
    ? uiCssClass('button', props.colorRole)
    : undefined
  const surface =
    props.buttonType && props.buttonType !== 'filled'
      ? uiCssClass('button', props.buttonType)
      : undefined
  const shape =
    props.shape && props.shape !== 'square'
      ? uiCssClass('button', props.shape)
      : undefined
  return [uiCssClass('button'), role, surface, shape, props.class]
}

export interface UiButtonSlots<TNode = any> {
  default: () => TNode[]
}

export interface UiButtonGroupProps extends UiProps {
  orientation?: UiOrientation
}

export interface UiSelectButtonGroupProps extends UiProps {
  options?: unknown[]
  optionLabel?: string
  optionValue?: string
  /** 默认 `single`。`multiple` 时 value / onUpdate 为数组。 */
  selectionMode?: 'single' | 'multiple'
  modelValue?: unknown
  onUpdate?: (value: unknown) => void
  orientation?: UiOrientation
}

export interface UiLinkProps extends UiProps {
  text?: string
  href?: string
  target?: '_self' | '_blank' | '_parent' | '_top'
  colorRole?: UiColorRole
}

export interface UiLinkSlots<TNode = any> {
  default: () => TNode[]
}

export type UiLinkType<TNode = any> = UiLinkProps & UiLinkSlots<TNode>

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
  if (props.onUpdate) return props.onUpdate
  const bag = props['onUpdate:modelValue']
  return typeof bag === 'function' ? (bag as (value: unknown) => void) : undefined
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

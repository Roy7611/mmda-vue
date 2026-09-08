import type { VNode } from 'vue'
import type { UiAction } from './action'
import type { UiButtonProps } from './button'
import type { UiSlots } from '../layout/layout'

export type UiDropDownButtonPlacement =
  | 'bottom'
  | 'bottom-end'
  | 'top'
  | 'top-end'

export interface UiDropDownButtonProps extends UiButtonProps {
  hideCaret?: boolean
  /** 弹出方向；`top` / `top-end` 时 SF 走上弹壳 */
  popupPlacement?: UiDropDownButtonPlacement
}

export type UiDropDownButtonRenderer = (
  props: UiDropDownButtonProps,
  actions: UiAction[],
  slots?: UiSlots,
) => VNode

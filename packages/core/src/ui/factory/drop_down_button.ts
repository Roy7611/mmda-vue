import type { UiButtonProps } from './button'

export type UiDropDownButtonPlacement =
  | 'bottom'
  | 'bottom-end'
  | 'top'
  | 'top-end'

export interface UiDropDownButtonProps extends UiButtonProps {
  hideCaret?: boolean
  /** 弹出方向；`top` / `top-end` 向上（SF 走上弹壳，Naive 用 NDropdown placement） */
  popupPlacement?: UiDropDownButtonPlacement
}

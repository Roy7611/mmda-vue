import type { UiButtonProps, UiButtonSlots } from './button'

/**
 * 下拉按钮（`dropDownButton` / `moreMenuButton`）透传插槽。
 * 菜单键名字随厂商，这一层留索引。
 */
export interface UiDropDownButtonSlots<TNode = any>
  extends UiButtonSlots<TNode> {
  [slot: string]: (() => TNode[]) | undefined
}

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

import type { UiButtonProps } from './button'
import { uiCssClass } from '../css'

export type UiFabPosition =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'middleLeft'
  | 'middleCenter'
  | 'middleRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight'

export interface UiFloatingActionButtonProps extends UiButtonProps {
  /** 相对 target（或视口）九宫格；默认 bottomRight。不要写 EJ2 TopLeft。 */
  position?: UiFabPosition
  /** CSS 选择器。对应 EJ2 `target`；无则相对视口。 */
  target?: string
  /** 有 label 时图标在左/右；默认 left */
  iconPosition?: 'left' | 'right'
}

export function fabModifierClasses(
  props: UiFloatingActionButtonProps,
): unknown[] {
  const pos = props.position ?? 'bottomRight'
  return [uiCssClass('fab'), uiCssClass('fab', undefined, pos), props.class]
}

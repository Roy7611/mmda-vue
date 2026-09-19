import type { UiProps } from '../props'
import { uiCssClass } from '../css'

/**
 * 原生 Toolbar 单控件。不是页头 Topbar。
 * 页头见 {@link import('../builder/topbar').UiIndexTopbar}。
 */
export interface UiToolbarProps extends UiProps {
  overflow?: 'popup' | 'scroll' | 'multirow' | 'none'
  disabled?: boolean
}

export type UiToolbarSlotName = 'start' | 'center' | 'end'

export interface UiToolbarSlots<TNode = any> {
  start?: () => TNode
  center?: () => TNode
  end?: () => TNode
  /** 无 named 槽时当作 start。 */
  default?: () => TNode
}

export type UiToolbarRegions<TNode = any> = {
  start?: () => TNode
  center?: () => TNode
  end?: () => TNode
}

/** 有 start/center/end 用 named；否则 default → start。 */
export function toolbarRegionsOf<TNode>(
  slots?: UiToolbarSlots<TNode>,
): UiToolbarRegions<TNode> {
  const named =
    typeof slots?.start === 'function' ||
    typeof slots?.center === 'function' ||
    typeof slots?.end === 'function'
  if (named) {
    return {
      start: slots?.start,
      center: slots?.center,
      end: slots?.end,
    }
  }
  return { start: slots?.default }
}

export function toolbarModifierClasses(props: UiToolbarProps = {}): unknown[] {
  const overflow =
    props.overflow === 'scroll' ||
    props.overflow === 'none' ||
    props.overflow === 'multirow'
      ? props.overflow
      : undefined
  return [
    uiCssClass('toolbar'),
    overflow ? uiCssClass('toolbar', undefined, overflow) : undefined,
    props.disabled ? uiCssClass('toolbar', undefined, 'disabled') : undefined,
    props.class,
  ]
}

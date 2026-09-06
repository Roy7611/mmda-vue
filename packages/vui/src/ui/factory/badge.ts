/*
 * Syncfusion types: https://ej2.syncfusion.com/vue/documentation/badge/types
 * Material 3 badge: https://m3.material.io/
 *
 * `dot` → small badge（存在性）；`overlay` + 数字 → large badge（计数，可截断如 99+）。
 * `colorRole` → MD3 语义色。`position` 默认 topRight（MD3 top-end）。
 * 仓库 `UiPosition` 是 tooltip 单边，角标不用它。
 */
import type { UiColorRole } from '../../app/material'
import type { PropData } from '../layout/layout'

/** 形状，对齐 UiButtonShape；overlay（角标）不是形状。 */
export type UiBadgeShape = 'default' | 'circle' | 'pill' | 'dot'

/** 角标相对父元素的角落。MD3 默认 top-end（LTR 即右上）。 */
export type UiBadgePosition = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'

/** MD3 语义色 + Syncfusion light/dark */
export type UiBadgeColor = UiColorRole | 'light' | 'dark'

export interface UiBadgeProps extends PropData {
  value?: string | number
  colorRole?: UiBadgeColor
  shape?: UiBadgeShape
  overlay?: boolean
  position?: UiBadgePosition
}

export function badgePositionClass(
  position?: UiBadgePosition,
): string | undefined {
  if (!position || position === 'topRight') return undefined
  return `mmda-badge--${position.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`)}`
}

/** Prime / Naive 用的修饰 class；Syncfusion 形状走 e-badge-*。 */
export function badgeModifierClasses(props: UiBadgeProps): unknown[] {
  const shape =
    props.shape && props.shape !== 'default'
      ? `mmda-badge--${props.shape}`
      : undefined
  const overlay = props.overlay ? 'mmda-badge--overlay' : undefined
  const position = props.overlay
    ? badgePositionClass(props.position)
    : undefined
  return [shape, overlay, position, props.class]
}

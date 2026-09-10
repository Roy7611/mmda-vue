import type { UiColorRole, UiProps } from '../props'
import { uiCssClass } from '../css'

/** 形状，对齐 UiButtonShape；overlay（角标）不是形状。 */
export type UiBadgeShape = 'default' | 'circle' | 'pill' | 'dot'

/** 角标相对父元素的角落。MD3 默认 top-end（LTR 即右上）。 */
export type UiBadgePosition = 'topRight' | 'topLeft' | 'bottomRight' | 'bottomLeft'

/** MD3 语义色 + Syncfusion light/dark */
export type UiBadgeColor = UiColorRole | 'light' | 'dark'

export interface UiBadgeProps extends UiProps {
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
  return uiCssClass(
    'badge',
    undefined,
    position.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`),
  )
}

/** Prime / Naive 用的修饰 class；Syncfusion 形状走 e-badge-*。 */
export function badgeModifierClasses(props: UiBadgeProps): unknown[] {
  const shape =
    props.shape && props.shape !== 'default'
      ? uiCssClass('badge', undefined, props.shape)
      : undefined
  const overlay = props.overlay ? uiCssClass('badge', undefined, 'overlay') : undefined
  const position = props.overlay
    ? badgePositionClass(props.position)
    : undefined
  return [shape, overlay, position, props.class]
}

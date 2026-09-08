/*
 * Syncfusion types: https://ej2.syncfusion.com/vue/documentation/avatar/types
 *
 * 内容优先级：src → icon → label。shape 默认 circle；size 默认 medium（EJ2 默认档）。
 * colorRole 只给缩写/图标填底色；有 src 不填色。角标叠头像用 factory.badge + overlay，本控件无 position。
 */
import type { UiColorRole } from '../../app/material'
import type { PropData } from '../layout/layout'

/** default = 方（EJ2 默认轮廓）；circle = e-avatar-circle */
export type UiAvatarShape = 'default' | 'circle'

/** medium = EJ2 不加尺寸类的默认档 */
export type UiAvatarSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'

export interface UiAvatarProps extends PropData {
  src?: string
  icon?: string
  label?: string
  shape?: UiAvatarShape
  size?: UiAvatarSize
  colorRole?: UiColorRole
}

export function avatarModifierClasses(props: UiAvatarProps): unknown[] {
  const shape = (props.shape ?? 'circle') === 'circle'
    ? 'mmda-avatar--circle'
    : 'mmda-avatar--square'
  const size =
    props.size && props.size !== 'medium'
      ? `mmda-avatar--${props.size}`
      : undefined
  const color =
    !props.src && props.colorRole
      ? `mmda-avatar--${props.colorRole}`
      : undefined
  return [shape, size, color, props.class]
}

import type { UiColorRole, UiProps } from '../props'
import { uiCssClass } from '../css'

/** default = 方（EJ2 默认轮廓）；circle = e-avatar-circle */
export type UiAvatarShape = 'default' | 'circle'

/** medium = EJ2 不加尺寸类的默认档 */
export type UiAvatarSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'

export interface UiAvatarProps extends UiProps {
  src?: string
  icon?: string
  label?: string
  shape?: UiAvatarShape
  size?: UiAvatarSize
  colorRole?: UiColorRole
}

export function avatarModifierClasses(props: UiAvatarProps): unknown[] {
  const shape =
    (props.shape ?? 'circle') === 'circle'
      ? uiCssClass('avatar', 'circle')
      : uiCssClass('avatar', 'square')
  const size =
    props.size && props.size !== 'medium'
      ? uiCssClass('avatar', props.size)
      : undefined
  const color =
    !props.src && props.colorRole
      ? uiCssClass('avatar', props.colorRole)
      : undefined
  return [shape, size, color, props.class]
}

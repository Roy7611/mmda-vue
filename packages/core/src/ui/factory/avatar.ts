import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'
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
      ? uiCssClass('avatar', undefined, 'circle')
      : uiCssClass('avatar', undefined, 'square')
  const size =
    props.size && props.size !== 'medium'
      ? uiCssClass('avatar', undefined, props.size)
      : undefined
  const color =
    !props.src && props.colorRole
      ? uiCssClass('avatar', undefined, props.colorRole)
      : undefined
  return [shape, size, color, props.class]
}

/** 字段头像；getFieldValue 可带行。 */
export type AvatarFieldContext = Pick<UiFieldBindContext, 'getFieldValue'>

const DEFAULT_AVATAR_ICON = 'fas fa-user'

function avatarSrcOf(raw: unknown): string | undefined {
  if (raw == null) return undefined
  const text = String(raw).trim()
  return text || undefined
}

export function avatarPropsFromField(
  field: MetaUiField,
  context: AvatarFieldContext
): UiAvatarProps {
  const src = avatarSrcOf(context.getFieldValue(field))
  return {
    src,
    icon:
      (src ? undefined : DEFAULT_AVATAR_ICON),
    shape: 'circle',
        size: 'medium',
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...({}),
    },
  }
}

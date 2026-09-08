import { h } from 'vue'
import { NAvatar } from 'naive-ui'
import type { IconResolver, UiAvatarProps, UiAvatarSize } from '@mmda/vui'
import { avatarModifierClasses, createIconVNode } from '@mmda/vui'

const naiveSize = (size?: UiAvatarSize) => {
  if (size === 'xsmall') return 20
  if (size === 'xlarge') return 48
  if (size === 'small' || size === 'medium' || size === 'large') return size
  return 'medium'
}

export function createAvatar(props: UiAvatarProps, resolveIcon: IconResolver) {
  const {
    src,
    icon,
    label,
    shape = 'circle',
    size = 'medium',
    colorRole: _colorRole,
    class: _class,
    htmlAttributes,
    ...rest
  } = props
  const fallback =
    !src && icon
      ? () => [createIconVNode(resolveIcon(icon))]
      : !src && label
        ? () => [label]
        : undefined
  return h(
    NAvatar,
    {
      ...rest,
      ...htmlAttributes,
      src,
      round: shape !== 'default',
      size: naiveSize(size),
      class: ['mmda-avatar', avatarModifierClasses(props)],
    },
    fallback ? { default: fallback } : undefined,
  )
}

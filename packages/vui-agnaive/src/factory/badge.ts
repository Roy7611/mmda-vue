import { h } from 'vue'
import { NBadge } from 'naive-ui'
import type { UiBadgeProps } from '@mmda/vui'
import { badgeModifierClasses } from '@mmda/vui'

const naiveType = (role?: string) => {
  const roles: Record<string, 'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'> = {
    primary: 'primary',
    secondary: 'default',
    success: 'success',
    info: 'info',
    warning: 'warning',
    danger: 'error',
    light: 'default',
    dark: 'default',
  }
  return role ? roles[role] : undefined
}

export function createBadge(props: UiBadgeProps) {
  const {
    value,
    colorRole,
    shape,
    overlay: _overlay,
    position: _position,
    class: _class,
    ...rest
  } = props
  return h(NBadge, {
    ...rest,
    value: shape === 'dot' ? undefined : value,
    type: naiveType(colorRole) as any,
    dot: shape === 'dot',
    class: ['mmda-badge', badgeModifierClasses(props)],
  })
}

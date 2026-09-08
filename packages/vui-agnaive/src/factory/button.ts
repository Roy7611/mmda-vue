import { h, type VNode } from 'vue'
import { NButton } from 'naive-ui'
import type { UiButtonProps, UiButtonSlots } from '@mmda/vui'
import { buttonModifierClasses, createIconVNode } from '@mmda/vui'

const naiveType = (role?: string) => {
  const roles: Record<
    string,
    'default' | 'primary' | 'info' | 'success' | 'warning' | 'error'
  > = {
    primary: 'primary',
    secondary: 'default',
    success: 'success',
    info: 'info',
    warning: 'warning',
    warn: 'warning',
    danger: 'error',
    error: 'error',
  }
  return role ? roles[role] : undefined
}

export function createButton(
  props: UiButtonProps = {},
  slots?: UiButtonSlots & { icon?: () => VNode },
  resolveIcon: (icon: string) => string = (icon) => icon,
) {
  const {
    htmlAttributes,
    class: className,
    label,
    icon,
    tooltip,
    buttonType,
    shape,
    colorRole,
    disabled,
    type,
    size,
    loading,
    id,
    onClick,
    onAction,
    command,
    ...rest
  } = props
  const iconName = icon as string | undefined
  const hideLabel = shape === 'circle' && !label
  return h(
    NButton,
    {
      ...rest,
      ...htmlAttributes,
      attrType: type ?? 'button',
      type: naiveType(
        colorRole ??
          (props as { severity?: string }).severity ??
          (buttonType === 'tonal' ? 'secondary' : undefined),
      ),
      secondary: buttonType === 'tonal',
      ghost: buttonType === 'outlined',
      text: buttonType === 'text' || buttonType === 'link',
      circle: shape === 'circle',
      round: shape === 'round',
      disabled: disabled === true || disabled === 'true',
      loading,
      title: tooltip ?? htmlAttributes?.title,
      size: size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium',
      class: buttonModifierClasses(props),
      id,
      label,
      onClick: onClick ?? onAction ?? command,
    },
    {
      default: () =>
        slots?.default?.() ?? (hideLabel ? undefined : label),
      icon: iconName
        ? () => createIconVNode(resolveIcon(iconName))
        : slots?.icon,
    },
  )
}

import { h, type VNode } from 'vue'
import { NButton } from 'naive-ui'
import type { UiButtonProps, UiButtonSlots } from '@mmda/core'
import { buttonModifierClasses } from '@mmda/core'
import { createIconVNode } from '@mmda/vui'

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
  return role ? roles[String(role).toLowerCase()] : undefined
}

export function createButton(
  props: UiButtonProps = {},
  slots?: UiButtonSlots & { icon?: () => VNode },
  resolveIcon: (icon: string) => string = (icon) => icon,
) {
  const {
    htmlAttributes,
    class: _className,
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
    // UiAction 袋字段：勿落到 NButton attrs，以免干扰点击
    name: _name,
    canDo: _canDo,
    visible: _visible,
    group: _group,
    view: _view,
    description: _description,
    role: _role,
    ...rest
  } = props as UiButtonProps & Record<string, unknown>
  const iconName = icon as string | undefined
  const hideLabel = shape === 'circle' && !label
  const handleClick = onClick ?? onAction
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
      disabled: disabled === true,
      loading,
      title: tooltip ?? htmlAttributes?.title,
      size: size === 'small' ? 'small' : size === 'large' ? 'large' : 'medium',
      class: buttonModifierClasses(props),
      id,
      onClick: handleClick
        ? (event: MouseEvent) => {
            event.preventDefault()
            event.stopPropagation()
            return handleClick(event as never)
          }
        : undefined,
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

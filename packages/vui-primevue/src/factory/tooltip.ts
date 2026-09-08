/*
 * chrome 提示气泡走 factory.tooltip。vui 名是 tooltip。
 * Prime 只有指令 v-tooltip；包一层 span。custom / 富内容槽降级。
 */
import { h, withDirectives } from 'vue'
import Tooltip from 'primevue/tooltip'
import type { UiTooltipProps, UiTooltipSlots } from '@mmda/vui'
import {
  htmlAttributesOf,
  noopTooltipController,
  tooltipContentOf,
  tooltipDisabledOf,
  tooltipModifierClasses,
  tooltipOpensOnOf,
  tooltipPositionOf,
} from '@mmda/vui'

export function createTooltip(props: UiTooltipProps, slots?: UiTooltipSlots) {
  const children = slots?.default?.() ?? []
  props.onReady?.(noopTooltipController)

  if (tooltipDisabledOf(props)) {
    return h(
      'span',
      {
        class: tooltipModifierClasses(props),
        ...htmlAttributesOf(props),
      },
      children,
    )
  }

  const content = tooltipContentOf(props, slots) ?? ''
  const position = tooltipPositionOf(props)
  const opensOn = tooltipOpensOnOf(props)
  const modifiers: Record<string, boolean> = {
    [position]: true,
  }
  if (opensOn === 'focus') modifiers.focus = true

  const vnode = h(
    'span',
    {
      class: tooltipModifierClasses(props),
      ...htmlAttributesOf(props),
    },
    children,
  )

  if (opensOn === 'custom' || !content) {
    return vnode
  }

  return withDirectives(vnode, [
    [
      Tooltip,
      {
        value: content,
        disabled: false,
        showDelay: props.openDelay,
        hideDelay: props.closeDelay,
        escape: true,
      },
      undefined,
      modifiers,
    ],
  ])
}

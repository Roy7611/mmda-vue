/*
 * chrome 提示气泡走 factory.tooltip。vui 名是 tooltip。
 * Naive NTooltip：trigger + default。
 */
import { h, type VNode } from 'vue'
import { NTooltip } from 'naive-ui'
import type {
  UiTooltipController,
  UiTooltipOpensOn,
  UiTooltipProps,
  UiTooltipSlots,
} from '@mmda/vui'
import {
  htmlAttributesOf,
  noopTooltipController,
  tooltipContentOf,
  tooltipDisabledOf,
  tooltipModifierClasses,
  tooltipOpensOnOf,
  tooltipPositionOf,
  tooltipShowPointerOf,
} from '@mmda/vui'

/** Naive trigger */
export function tooltipOpensOnToTrigger(
  opensOn: UiTooltipOpensOn,
): 'hover' | 'click' | 'focus' | 'manual' {
  if (opensOn === 'click') return 'click'
  if (opensOn === 'focus') return 'focus'
  if (opensOn === 'custom') return 'manual'
  return 'hover'
}

export function createTooltip(props: UiTooltipProps, slots?: UiTooltipSlots) {
  const {
    content: _content,
    position: _position,
    opensOn: _opensOn,
    showPointer: _showPointer,
    openDelay,
    closeDelay,
    disabled: _disabled,
    onReady,
    class: _className,
    htmlAttributes,
    ...rest
  } = props

  const children = slots?.default?.() ?? []
  if (tooltipDisabledOf(props)) {
    onReady?.(noopTooltipController)
    return h(
      'span',
      {
        class: tooltipModifierClasses(props),
        ...htmlAttributesOf(props),
      },
      children,
    )
  }

  let inst: {
    setShow?: (show: boolean) => void
    syncPosition?: () => void
  } | null = null

  const controller = (): UiTooltipController => ({
    open: () => inst?.setShow?.(true),
    close: () => inst?.setShow?.(false),
    refresh: () => inst?.syncPosition?.(),
  })

  onReady?.(
    tooltipOpensOnOf(props) === 'custom' ? controller() : noopTooltipController,
  )

  const text = tooltipContentOf(props, slots)

  return h(
    NTooltip as any,
    {
      ...rest,
      ...htmlAttributesOf(props),
      ref: (el: any) => {
        inst = el
      },
      placement: tooltipPositionOf(props) as any,
      trigger: tooltipOpensOnToTrigger(tooltipOpensOnOf(props)),
      showArrow: tooltipShowPointerOf(props),
      delay: openDelay ?? 0,
      duration: closeDelay ?? 100,
      disabled: false,
      class: tooltipModifierClasses(props),
    },
    {
      trigger: () => children as VNode[],
      default: () =>
        slots?.content?.() ?? (text != null ? [text] : []),
    },
  )
}

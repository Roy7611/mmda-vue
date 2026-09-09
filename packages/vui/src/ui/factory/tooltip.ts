/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/tooltip/vue-3-getting-started
 *
 * chrome 提示气泡走 factory.tooltip。vui 名是 tooltip。
 * 不要 ejs-tooltip / TooltipComponent / Prime v-tooltip / Naive n-tooltip 当 vui 名。
 * 按钮 props.tooltip 仍是原生 title；要厂商气泡、opensOn、控制器时用本控件包一层。
 * 没有 target 选择器、没有 fldFactory；目标是 slots.default。
 */
import type { VNode } from 'vue'
import type {
  UiPosition,
  UiTooltipController,
  UiTooltipOpensOn,
  UiTooltipProps,
  UiTooltipSlots,
} from '@mmda/core'

export type {
  UiPosition,
  UiTooltipController,
  UiTooltipOpensOn,
  UiTooltipProps,
  UiTooltipSlots,
} from '@mmda/core'

export function tooltipPositionOf(props: UiTooltipProps): UiPosition {
  const pos = props.position
  if (pos === 'bottom' || pos === 'left' || pos === 'right') return pos
  return 'top'
}

export function tooltipOpensOnOf(props: UiTooltipProps): UiTooltipOpensOn {
  const mode = props.opensOn
  if (
    mode === 'hover' ||
    mode === 'click' ||
    mode === 'focus' ||
    mode === 'custom'
  ) {
    return mode
  }
  return 'auto'
}

export function tooltipShowPointerOf(props: UiTooltipProps): boolean {
  return props.showPointer !== false
}

export function tooltipDisabledOf(props: UiTooltipProps): boolean {
  return props.disabled === true
}

export function tooltipContentOf(
  props: UiTooltipProps,
  slots?: UiTooltipSlots<VNode>,
): string | undefined {
  if (props.content != null && props.content !== '') return String(props.content)
  const raw = slots?.content?.()
  if (raw == null) return undefined
  const nodes = Array.isArray(raw) ? raw : [raw]
  return (
    nodes
      .map((node) => {
        if (node == null) return ''
        if (typeof node === 'string') return node
        if (typeof node === 'object' && 'children' in node) {
          const children = (node as VNode).children
          if (typeof children === 'string') return children
        }
        return ''
      })
      .join('')
      .trim() || undefined
  )
}

export const noopTooltipController: UiTooltipController = {
  open: () => undefined,
  close: () => undefined,
  refresh: () => undefined,
}

export { tooltipModifierClasses } from '@mmda/core'

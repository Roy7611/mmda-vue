/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/tooltip/vue-3-getting-started
 *
 * chrome 提示气泡走 factory.tooltip。vui 名是 tooltip。
 * 不要 ejs-tooltip / TooltipComponent / Prime v-tooltip / Naive n-tooltip 当 vui 名。
 * 按钮 props.tooltip 仍是原生 title；要厂商气泡、opensOn、控制器时用本控件包一层。
 * 没有 target 选择器、没有 fldFactory；目标是 slots.default。
 */
import type { VNode } from 'vue'
import type { UiPosition } from '../../app/material'
import type { PropData } from '../layout/layout'

export type UiTooltipOpensOn =
  | 'auto'
  | 'hover'
  | 'click'
  | 'focus'
  | 'custom'

export interface UiTooltipController {
  open: (element?: HTMLElement) => void
  close: () => void
  refresh: () => void
}

export interface UiTooltipProps extends PropData {
  /** 提示文案。也可用 slots.content */
  content?: string
  /** 缺省 top。四边中点，不做十二角 */
  position?: UiPosition
  /** 缺省 auto */
  opensOn?: UiTooltipOpensOn
  /** 箭头。对应 EJ2 showTipPointer。缺省 true */
  showPointer?: boolean
  openDelay?: number
  closeDelay?: number
  disabled?: boolean
  onReady?: (controller: UiTooltipController) => void
}

export interface UiTooltipSlots {
  /** 被包的目标节点 */
  default?: () => VNode[]
  /** 覆盖 props.content */
  content?: () => VNode[]
}

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
  slots?: UiTooltipSlots,
): string | undefined {
  if (props.content != null && props.content !== '') return String(props.content)
  const nodes = slots?.content?.()
  if (!nodes?.length) return undefined
  return nodes
    .map((node) => {
      if (node == null) return ''
      if (typeof node.children === 'string') return node.children
      return ''
    })
    .join('')
    .trim() || undefined
}

/** EJ2 四边中点 */
export function tooltipPositionToEj2(
  position: UiPosition,
): 'TopCenter' | 'BottomCenter' | 'LeftCenter' | 'RightCenter' {
  if (position === 'bottom') return 'BottomCenter'
  if (position === 'left') return 'LeftCenter'
  if (position === 'right') return 'RightCenter'
  return 'TopCenter'
}

export function tooltipOpensOnToEj2(
  opensOn: UiTooltipOpensOn,
): 'Auto' | 'Hover' | 'Click' | 'Focus' | 'Custom' {
  if (opensOn === 'hover') return 'Hover'
  if (opensOn === 'click') return 'Click'
  if (opensOn === 'focus') return 'Focus'
  if (opensOn === 'custom') return 'Custom'
  return 'Auto'
}

/** Naive placement */
export function tooltipPositionToNaive(position: UiPosition): string {
  return position
}

/** Naive / Prime 触发 */
export function tooltipOpensOnToTrigger(
  opensOn: UiTooltipOpensOn,
): 'hover' | 'click' | 'focus' | 'manual' {
  if (opensOn === 'click') return 'click'
  if (opensOn === 'focus') return 'focus'
  if (opensOn === 'custom') return 'manual'
  return 'hover'
}

export const noopTooltipController: UiTooltipController = {
  open: () => undefined,
  close: () => undefined,
  refresh: () => undefined,
}

export function tooltipModifierClasses(props: UiTooltipProps): unknown[] {
  return [
    'mmda-tooltip',
    `mmda-tooltip--${tooltipPositionOf(props)}`,
    tooltipDisabledOf(props) ? 'mmda-tooltip--disabled' : undefined,
    props.class,
  ]
}

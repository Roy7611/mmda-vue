import type { UiPosition, UiProps } from '../props'
import { uiCssClass } from '../css'

export type { UiPosition } from '../props'

export type UiTooltipOpensOn =
  | 'auto'
  | 'hover'
  | 'click'
  | 'focus'
  | 'custom'

export interface UiTooltipController {
  open: (element?: any) => void
  close: () => void
  refresh: () => void
}

export interface UiTooltipProps extends UiProps {
  content?: string
  position?: UiPosition
  opensOn?: UiTooltipOpensOn
  showPointer?: boolean
  openDelay?: number
  closeDelay?: number
  disabled?: boolean
  onReady?: (controller: UiTooltipController) => void
}

export interface UiTooltipSlots<TNode = any> {
  default?: () => TNode
  content?: () => TNode
}

export function tooltipModifierClasses(props: UiTooltipProps): unknown[] {
  const pos = props.position
  const position: UiPosition =
    pos === 'bottom' || pos === 'left' || pos === 'right' ? pos : 'top'
  return [
    uiCssClass('tooltip'),
    uiCssClass('tooltip', undefined, position),
    props.disabled === true
      ? uiCssClass('tooltip', undefined, 'disabled')
      : undefined,
    props.class,
  ]
}

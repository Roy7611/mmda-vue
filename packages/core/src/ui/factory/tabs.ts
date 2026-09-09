import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiTabsHeaderPlacement = 'Top' | 'Bottom' | 'Left' | 'Right'
export type UiTabsHeightAdjustMode = 'None' | 'Auto' | 'Content' | 'Fill'

export interface UiTabHeader {
  text?: string
  iconCss?: string
}

export interface UiTabItem<TNode = any> {
  header: string | UiTabHeader
  content?: TNode | (() => TNode)
  disabled?: boolean
}

export interface UiTabsProps<TNode = any> extends UiProps {
  items?: UiTabItem<TNode>[]
  value?: number
  headerPlacement?: UiTabsHeaderPlacement
  scrollable?: boolean
  heightAdjustMode?: UiTabsHeightAdjustMode
  onChange?: (value: number) => void
}

export function tabsModifierClasses(props: UiTabsProps): unknown[] {
  const p = props.headerPlacement
  const placement: UiTabsHeaderPlacement =
    p === 'Bottom' || p === 'Left' || p === 'Right' ? p : 'Top'
  const m = props.heightAdjustMode
  const height: UiTabsHeightAdjustMode =
    m === 'None' || m === 'Auto' || m === 'Content' || m === 'Fill'
      ? m
      : 'Fill'
  const scrollable = props.scrollable !== false
  return [
    uiCssClass('tabs'),
    uiCssClass('tabs', placement.toLowerCase()),
    scrollable
      ? uiCssClass('tabs', 'scrollable')
      : uiCssClass('tabs', 'popup'),
    uiCssClass('tabs', height.toLowerCase()),
    props.class,
  ]
}

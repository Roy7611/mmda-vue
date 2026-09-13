import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiTabsHeaderPlacement = 'Top' | 'Bottom' | 'Left' | 'Right'
export type UiTabsHeightAdjustMode = 'None' | 'Auto' | 'Content' | 'Fill'
/** EJ2 loadOn：Demand 懒加载且已打开页签留 DOM；Dynamic 切走即卸；Init 一次全挂 */
export type UiTabsLoadOn = 'Demand' | 'Dynamic' | 'Init'
/** 页签头样式：SF 映射 e-fill / e-background；缺省 fill */
export type UiTabsHeaderStyle = 'default' | 'fill' | 'background' | 'accent'

export interface UiTabHeader {
  text?: string
  iconCss?: string
}

export interface UiTabItem<TNode = any> {
  /** 稳定唯一名（组页签用 groupName）；作 SF content 槽名与 Vue key */
  name?: string
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
  loadOn?: UiTabsLoadOn
  headerStyle?: UiTabsHeaderStyle
  onChange?: (value: number) => void
}

export function tabsLoadOnOf(props: UiTabsProps): UiTabsLoadOn {
  const v = props.loadOn
  if (v === 'Dynamic' || v === 'Init' || v === 'Demand') return v
  return 'Demand'
}

export function tabsHeaderStyleOf(props: UiTabsProps): UiTabsHeaderStyle {
  const v = props.headerStyle
  if (
    v === 'default' ||
    v === 'fill' ||
    v === 'background' ||
    v === 'accent'
  ) {
    return v
  }
  return 'fill'
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
  const headerStyle = tabsHeaderStyleOf(props)
  const loadOn = tabsLoadOnOf(props)
  return [
    uiCssClass('tabs'),
    uiCssClass('tabs', undefined, placement.toLowerCase()),
    scrollable
      ? uiCssClass('tabs', undefined, 'scrollable')
      : uiCssClass('tabs', undefined, 'popup'),
    uiCssClass('tabs', undefined, height.toLowerCase()),
    headerStyle !== 'default'
      ? uiCssClass('tabs', undefined, headerStyle)
      : undefined,
    uiCssClass('tabs', undefined, loadOn.toLowerCase()),
    props.class,
  ]
}

/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/tab/getting-started-vue-3
 *
 * chrome 页签走 factory.tabs（复数）。选中下标用 value，不要 selectedItem / activeTab。
 * 位置用 headerPlacement；过多页签用 scrollable。不要 vui 主名 placement / overflowMode。
 * 不是字段控件：没有 fieldFactory.tabs。
 */
import type { VNode, VNodeChild } from 'vue'
import { callUiBagFn } from '@mmda/core'
import type {
  UiTabHeader,
  UiTabItem,
  UiTabsHeaderPlacement,
  UiTabsHeightAdjustMode,
  UiTabsProps,
} from '@mmda/core'

export type {
  UiTabHeader,
  UiTabItem,
  UiTabsHeaderPlacement,
  UiTabsHeightAdjustMode,
  UiTabsProps,
} from '@mmda/core'

export interface UiNormalizedTabItem {
  header: UiTabHeader
  content?: UiTabItem['content']
  disabled?: boolean
}

function isFalse(raw: unknown): boolean {
  return raw === false || raw === 'false'
}

function finiteIndex(raw: unknown): number | undefined {
  if (raw == null || raw === '') return undefined
  const n = Number(raw)
  if (!Number.isFinite(n)) return undefined
  return Math.floor(n)
}

export function tabsValueOf(props: UiTabsProps): number {
  const raw = props.value !== undefined ? props.value : props.modelValue
  return finiteIndex(raw) ?? 0
}

export function tabsItemsOf(props: UiTabsProps): UiNormalizedTabItem[] {
  const items = props.items
  if (!Array.isArray(items)) return []
  return items.map((item) => ({
    header:
      typeof item.header === 'string'
        ? { text: item.header }
        : { text: item.header?.text, iconCss: item.header?.iconCss },
    content: item.content,
    disabled: item.disabled === true,
  }))
}

export function tabsItemContentOf(item: UiNormalizedTabItem): VNodeChild {
  const content = item.content
  if (typeof content === 'function') return content()
  return content
}

export function tabsHeaderPlacementOf(
  props: UiTabsProps,
): UiTabsHeaderPlacement {
  const p = props.headerPlacement
  if (p === 'Bottom' || p === 'Left' || p === 'Right') return p
  return 'Top'
}

export function tabsScrollableOf(props: UiTabsProps): boolean {
  if (props.scrollable === undefined) return true
  return !isFalse(props.scrollable)
}

export function tabsHeightAdjustModeOf(
  props: UiTabsProps,
): UiTabsHeightAdjustMode {
  const m = props.heightAdjustMode
  if (m === 'None' || m === 'Auto' || m === 'Content' || m === 'Fill') return m
  return 'Fill'
}

export function tabsOverflowModeOf(
  props: UiTabsProps,
): 'Scrollable' | 'Popup' {
  return tabsScrollableOf(props) ? 'Scrollable' : 'Popup'
}

export function tabsNaivePlacementOf(
  props: UiTabsProps,
): 'top' | 'bottom' | 'left' | 'right' {
  return tabsHeaderPlacementOf(props).toLowerCase() as
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
}

export function tabsHostStyle(
  props: UiTabsProps,
): Record<string, string> | undefined {
  if (tabsHeightAdjustModeOf(props) !== 'Fill') return undefined
  return { height: '100%' }
}

export function emitTabsChange(props: UiTabsProps, raw: unknown): void {
  let unpacked = raw
  if (raw != null && typeof raw === 'object' && !Array.isArray(raw)) {
    const args = raw as { selectedIndex?: unknown; value?: unknown }
    if (args.selectedIndex !== undefined) unpacked = args.selectedIndex
    else if (args.value !== undefined) unpacked = args.value
  }
  const next = finiteIndex(unpacked)
  if (next == null) return
  props.onChange?.(next)
  callUiBagFn(props, 'onUpdate:modelValue', next)
  callUiBagFn(props, 'onUpdate', next)
}

export { tabsModifierClasses } from '@mmda/core'

export type TabsFactoryFn = (props: UiTabsProps) => VNode

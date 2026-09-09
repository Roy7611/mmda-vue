/*
 * chrome 右键菜单走 factory.contextMenu。与 factory.menu / dropDownButton 不同：锚点是 target 上的右键/长按。
 * 契约在 @mmda/core。
 */
import type { UiContextMenuProps, UiMenuItem } from '@mmda/core'
import { isActionEnabled, isActionVisible } from './action'

export type { UiContextMenuProps } from '@mmda/core'
export { contextMenuModifierClasses } from '@mmda/core'

function filterContextMenuItems(
  items: UiMenuItem[],
  target?: unknown,
): UiMenuItem[] {
  return items
    .filter((item) => item.divider === true || isActionVisible(item, target))
    .map((item) => {
      if (item.divider) return { divider: true }
      const children = item.items?.length
        ? filterContextMenuItems(item.items, target)
        : undefined
      return {
        ...item,
        disabled: !isActionEnabled(item, target),
        items: children,
      }
    })
}

export function contextMenuItemsOf(
  props: UiContextMenuProps,
  target?: unknown,
): UiMenuItem[] {
  return filterContextMenuItems(props.items ?? [], target)
}

export function invokeContextMenuItem(
  props: UiContextMenuProps,
  item: UiMenuItem,
): void {
  if (item.divider) return
  const handler = item.onAction
  void handler?.()
  props.onSelect?.(item)
}

export function findContextMenuItem(
  items: UiMenuItem[],
  predicate: (item: UiMenuItem) => boolean,
): UiMenuItem | undefined {
  for (const item of items) {
    if (item.divider) continue
    if (predicate(item)) return item
    if (item.items?.length) {
      const nested = findContextMenuItem(item.items, predicate)
      if (nested) return nested
    }
  }
  return undefined
}

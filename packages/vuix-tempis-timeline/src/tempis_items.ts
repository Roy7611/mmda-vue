/*
 * 契约行 ↔ 引擎行（`@tempis/timeline`）。
 *
 * 引擎的标识键叫 `id`、契约里叫 `key`（沿用列表档词汇），**只在这一处翻译**，
 * 进来的方向与出去的方向（`controller.getItems()`）都走这里，避免一半 `key` 一半 `id`。
 *
 * 其余字段同名直传，只传真正给了值的键（不往引擎里塞一堆 `undefined`）。
 * 没有 `start`（画布放不下无时间的行）的行返回 `undefined` 由调用方滤掉 ——
 * 契约侧 `tempisTimelineItemsOf` 已经先筛过一遍，这里保住类型上的确定性。
 */
import type { TempisTimelineItem } from '@tempis/timeline'
import {
  tempisTimelineItemsOf,
  type UiTempisTimelineItem,
  type UiTempisTimelineProps,
} from '@mmda/vui'

/** 契约行 → 引擎行；`index` 只用于没给 `key` 时兜底编号。 */
export function tempisItemForEngine(
  item: UiTempisTimelineItem,
  index: number,
): TempisTimelineItem | undefined {
  const start = item.start
  if (start == null || start === '') return undefined
  const row: TempisTimelineItem = { id: item.key ?? index, start }
  if (item.label != null) row.label = item.label
  if (item.end != null && item.end !== '') row.end = item.end
  if (item.grouping != null) row.grouping = item.grouping
  if (item.category != null) row.category = item.category
  if (item.progress != null) row.progress = item.progress
  if (item.style != null) row.style = item.style
  if (item.selected != null) row.selected = item.selected
  return row
}

/** 契约行数组 → 引擎行数组（滤掉没有 `start` 的行）。 */
export function tempisItemsOfContract(
  items: UiTempisTimelineItem[],
): TempisTimelineItem[] {
  return items
    .map(tempisItemForEngine)
    .filter((row): row is TempisTimelineItem => row != null)
}

/** 契约 props → 引擎行数组（字段绑定在 core 侧解析完，这里只做 `key → id`）。 */
export function tempisItemsForEngine<T>(
  props: UiTempisTimelineProps<T>,
): TempisTimelineItem[] {
  return tempisItemsOfContract(tempisTimelineItemsOf(props))
}

/** 引擎行 → 契约行（`id` 回译 `key`），`controller.getItems()` 的口径与 `items` 一致。 */
export function tempisItemOfEngine(item: TempisTimelineItem): UiTempisTimelineItem {
  const row: UiTempisTimelineItem = { key: item.id, start: item.start }
  if (item.label != null) row.label = item.label
  if (item.end != null) row.end = item.end
  if (item.grouping != null) row.grouping = item.grouping
  if (item.category != null) row.category = item.category
  if (item.progress != null) row.progress = item.progress
  if (item.style != null) row.style = item.style
  if (item.selected != null) row.selected = item.selected
  return row
}

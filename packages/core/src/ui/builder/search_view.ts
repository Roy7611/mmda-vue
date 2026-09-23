/**
 * 搜索页（`UiViewOne.Search`）契约与纯换算。
 *
 * 一行 = 字段 + 操作符 + 值，行状态是 {@link UiSearchRow}（叶子带上字段名）；
 * 叶子只有一种主人：{@link import('../../models/entity_search').FieldFilter}。
 *
 * 装配与提交（两个运行时共用）：
 * ```ts
 * // 路由页（移动端全屏）：搜索会话自己持草稿
 * const search = await openEntityContext(view = 'search')
 * seedSearchRows(search, listContext?.searchParam.filterModel)   // 值回显（可选）
 * ui.buildSearchView(search, { placement: 'page' })
 * onConfirm: applySearchDraft(search, listContext)?.search()     // 写回列表会话再查
 * // 桌面右侧抽屉：列表会话自己持草稿（草稿在 searchRows，未确认不动 filterModel）
 * seedSearchRows(listContext)
 * drawer(content = ui.buildSearchView(listContext, { placement: 'drawer' }))
 * ```
 * 行字段：`beforeSearch().fields`（有就用它，含顺序）→ 为空回落 `listed fields` 里 `sortable === true`
 * （{@link defaultSearchFields}），二者都在 `AbstractUiContext.bindLogics` 落到 `searchRows`。
 */
import {
  getColumnFilterOps,
  type MetaUiField,
} from '../../metaui/metaui_field'
import type {
  JoinFilterOpCode,
  MetaUiFilterOpCode,
} from '../../metaui/metaui_filter'
import type { MetaUi } from '../../metaui/metaui_group'
import { FieldFilter, type FilterModel } from '../../models/entity_search'
import type { UiContext } from '../context'
import type { UiProps } from '../props'
import { writeListFilterModel } from './list_query'

/** 搜索条件行：字段名 + 叶子。空行只有字段名（值未填）。 */
export interface UiSearchRow {
  fieldName: string
  /** 这一行的叶子；未填 undefined。 */
  filter?: FieldFilter
  /** 同一字段多行的连接算子（原 `join` 叶保留 OR 语义）；缺省多叶按 `multi`（AND）收。 */
  join?: JoinFilterOpCode
}

/** 单个搜索条件行（`builder.buildSearchField`）：字段 + 操作符 + 值。 */
export interface UiSearchFieldProps extends UiProps {
  /** 当前条件（行状态）；空行 undefined。 */
  filter?: FieldFilter
  /** 值 / 操作符变化回写；清空回 undefined。 */
  onFilterChange?: (filter: FieldFilter | undefined) => void
  /** 限定操作符；缺省 `getColumnFilterOps(field)`。 */
  operators?: MetaUiFilterOpCode[]
  disabled?: boolean
}

/** 搜索页承载：`page` 全屏路由页；`drawer` 桌面右侧抽屉。`auto` 由调用方定档（core 当 `page`）。 */
export type UiSearchViewPlacement = 'auto' | 'page' | 'drawer'

/** 搜索页内容（`builder.buildSearchView`）：字段行（Column）+ 动作行。 */
export interface UiSearchViewProps extends UiProps {
  /** 行字段来源；缺省 `context.metaUi`（联查列表传列表那份）。 */
  metaUi?: MetaUi
  /** 「添加字段」候选覆盖；缺省 listed fields 里不在列上的。 */
  candidates?: MetaUiField[]
  /** 承载档。决定模糊搜框缺省与内容 class。 */
  placement?: UiSearchViewPlacement
  /** 模糊搜框（写 `searchParam.searchWord`）：缺省 `auto` —— 页面承载显示、抽屉隐藏。 */
  showSearchWord?: boolean | 'auto'
  /** 确定（调用方通常 `applySearchDraft` + 关承载）。 */
  onConfirm?: () => void | Promise<unknown>
  /** 重置（缺省只清值、保留行）。 */
  onReset?: () => void
}

export interface UiSearchViewSlots<TNode = any> {
  /** 字段行之后的自定义内容（如 `customSearchFields`）。 */
  default?: () => TNode | TNode[]
  /** 底部动作行覆盖。 */
  actions?: () => TNode | TNode[]
}

/**
 * 搜索页默认行字段：`listed fields` 里 `sortable === true` 的。
 * Logic `beforeSearch().fields` 有声明时以它为准，不回落本函数。
 */
export function defaultSearchFields(metaUi: MetaUi): MetaUiField[] {
  return metaUi.getListedFields().filter((field) => field.sortable === true)
}

/** 「添加字段」候选：listed fields 里还没在列上的。 */
export function searchFieldCandidates(
  metaUi: MetaUi,
  rows: UiSearchRow[],
): MetaUiField[] {
  const used = new Set(rows.map((row) => row.fieldName))
  return metaUi
    .getListedFields()
    .filter((field) => !used.has(field.fieldName))
}

/**
 * 行 → `FilterModel`：按字段名收。单叶原样；多叶按行的 `join` 收 `join`，否则 `multi`（AND）；
 * 空叶丢弃。全空返回 undefined。
 */
export function searchModelOf(
  rows: UiSearchRow[] | undefined,
): FilterModel | undefined {
  const model: FilterModel = {}
  for (const row of rows ?? []) {
    const leaf = FieldFilter.compact(row.filter)
    if (!leaf) continue
    const existing = model[row.fieldName]
    if (!existing) {
      model[row.fieldName] = leaf
      continue
    }
    const group =
      existing.filterType === 'multi'
        ? [...(existing.filterModels ?? [])]
        : [existing]
    model[row.fieldName] = row.join
      ? FieldFilter.join(row.join, [...group, leaf])
      : FieldFilter.multi([...group, leaf])
  }
  return Object.keys(model).length ? model : undefined
}

function rowsOfFilter(fieldName: string, filter: FieldFilter): UiSearchRow[] {
  if (filter.filterType === 'multi') {
    return (filter.filterModels ?? []).flatMap((item) =>
      rowsOfFilter(fieldName, item),
    )
  }
  if (filter.filterType === 'join') {
    // 基接口的 filterType 不是字面量联合，这里按值收 `AND` / `OR`（没有第三种）
    const join: JoinFilterOpCode = filter.operator === 'OR' ? 'OR' : 'AND'
    return (filter.conditions ?? []).flatMap((item) =>
      rowsOfFilter(fieldName, item).map((row) => ({ ...row, join })),
    )
  }
  return [{ fieldName, filter }]
}

/** `FilterModel` → 行（回显）：`multi` / `join` 摊成多行，字段名带上。 */
export function searchRowsOf(model?: FilterModel): UiSearchRow[] {
  return Object.entries(model ?? {}).flatMap(([fieldName, filter]) =>
    rowsOfFilter(fieldName, filter),
  )
}

/**
 * 进搜索页：把列表会话的当前条件摊成行补进搜索会话（值回显）。
 * 声明 / 默认的空行保留在前，种子里多出来的字段追加在后。只补，不清。
 */
export function seedSearchRows(context: UiContext, seed?: FilterModel): void {
  const seeded = searchRowsOf(seed)
  if (!seeded.length) return
  const rows = context.searchRows
  const used = new Set<number>()
  for (const row of seeded) {
    const emptyOf = (fieldName: string) =>
      rows.findIndex(
        (item, index) =>
          !used.has(index) &&
          item.fieldName === fieldName &&
          item.filter == null,
      )
    let index = emptyOf(row.fieldName)
    if (index < 0) {
      index = rows.findIndex(
        (item, i) => !used.has(i) && item.fieldName === row.fieldName,
      )
    }
    if (index >= 0) {
      used.add(index)
      rows.splice(index, 1, { ...row })
      continue
    }
    rows.push({ ...row })
  }
}

/** 重置草稿：清掉各行取值，保留行本身（用户加进来的空行也在）。 */
export function resetSearchRows(context: UiContext): void {
  for (const row of context.searchRows) delete row.filter
}

/**
 * 确认草稿：行收成 `FilterModel` 写回目标会话的 `searchParam`（缺省写自己的会话），页码置 1，
 * 模糊搜词（`searchWord`）一并带过去。只写不查 —— 调用方随后 `target.search()`
 *（并按承载关路由 / 收抽屉）。
 * @returns 写回的那个会话；没有 `searchParam` 时 undefined。
 */
export function applySearchDraft(
  search: UiContext,
  target?: UiContext,
): UiContext | undefined {
  const list = target ?? search
  if (!list.searchParam) return undefined
  writeListFilterModel(
    list.searchParam,
    searchModelOf(search.searchRows) ?? {},
    list.searchParam.pager?.pageSize,
  )
  const word = search.searchParam?.searchWord
  if (word != null) list.searchParam.searchWord = word
  ;(
    list as unknown as { rememberLastQuery?: () => void }
  ).rememberLastQuery?.()
  return list
}

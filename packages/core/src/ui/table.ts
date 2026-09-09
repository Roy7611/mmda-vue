import type { MetaUiField } from '../metaui/metaui_field'
import type { EntityFilterModel } from '../models/entity_search'
import type { Sort } from '../models/pagination'
import type { UiListProps } from './list'

/**
 * 模块 **index** KeepAlive：进详情/编辑再回来时，就地改行而不整表重绑。
 *
 * 只有列表页需要。selector / 子表不要接。回到列表用 {@link UiIndexTableHost.revealIndex}，
 * 不要 capture/restore 像素滚动（虚拟滚动会和 skip 错位白屏）。
 *
 * 皮肤在表格挂上后调 Builder 注入的 `onIndexTableHostReady(host)`；销毁时传 `null`。
 * 该回调在皮肤 extras，不进程序员 {@link UiTableProps}。
 */
export interface UiIndexTableHost {
  /** 按主键把这一行写回当前窗口（EJ2 `setRowData` 等）。 */
  applyRow(entity: Record<string, unknown>): void
  /** Create 保存：插到第 0 行并滚到顶。 */
  insertAtZero(entity: Record<string, unknown>): void
  /** 按 id 从当前窗口去掉一行。 */
  applyRemove(id: string): void
  /** 滚到 `index` 并选中；虚拟滚动要先对齐窗口再选。 */
  revealIndex(index: number): void
}

/**
 * 行展开：这一行底下再画一套 many（如 BOM `items` → `operations`）。
 *
 * `detail(row)` 画孙子组，不是本行列。函数名是单数 `detail`，不要 `details`（那是详情页）。
 * 只嵌一层。Logic：`this.group('items').rowDetail('operations')`。
 */
export interface UiRowDetail<T = any, TNode = any> {
  /** 为 true 时皮肤全展开，不要自己维护 expandedRows。 */
  expandAll?: boolean
  /** 展开区域内容。返回皮肤节点（vui 里是 VNode）。 */
  detail: (row: T) => TNode
}

/**
 * 某一列的自定义单元格。挂在 {@link UiTableProps.fieldCellRenderers} 上，key 是 `field.fieldName`。
 *
 * 有函数就是自定义格：`props.fieldCellRenderers?.[field.fieldName]`。不要表级一锅 `renderCell` 再 switch 字段。
 *
 * @param field 这一列的元数据（`fieldName` / `displayLabel` / `linkable` …）
 * @param row 这一行实体
 * @returns 皮肤节点；`undefined` 表示这列仍走默认显示（`displayCellFor`）
 *
 * @example
 * ```ts
 * factory.table(rows, metaUi, {
 *   fieldCellRenderers: {
 *     arrivedQuantity: (_field, row) =>
 *       factory.numberInput({
 *         modelValue: row.arrivedQuantity,
 *         onUpdate: (v) => { row.arrivedQuantity = v },
 *       }),
 *   },
 * })
 * ```
 */
export type UiFieldCellRenderer<T = any, TNode = any> = (
  field: MetaUiField,
  row: T,
) => TNode | TNode[] | undefined

/**
 * 只读桌面表。`buildTable` / `factory.table` 用这个。
 *
 * - **index** 与 **默认 selector**（跟 index 同一套）走这里，不要 `scene`
 * - 子表 edit / details 走 `UiGridProps`；selector 只有特殊情况才 grid
 * - 列来自 MetaUi 已列出字段，不要手写列数组
 * - 列宽永远可拖，没有开关
 * - 合计：有 `aggregationSet` / 组 `aggregates` 就画底栏，不要 `showSummary`
 * - 列筛加载 / 列布局持久化是会话标准，由 Builder 注入皮肤 extras，不进本契约
 */
export interface UiTableProps<T = any, TNode = any> extends UiListProps<T> {
  /** 隔行底色。 */
  striped?: boolean
  /** 画单元格网格线。 */
  showGridlines?: boolean
  /**
   * 最右操作列（详情/编辑/删除 + `rowActions`）。
   * `false` 不画。缺省由 Builder 按场景决定（index 常开）。
   */
  showActionColumn?: boolean
  /**
   * 列头排序总开关。缺省 `true`。
   * 单列还要 AND `field.sortable`。关了不要发 `onSort`。
   */
  sortable?: boolean
  /**
   * 要不要分页条。缺省 table/index 为 `true`；子表 Builder 写 `false`。
   * {@link UiListProps.pagination} / `onPage` 是页数据，不是这个开关。
   * `false` 时即使有 `pagination` 对象也不包页脚。
   */
  pageable?: boolean
  /**
   * 要不要列筛。缺省 table 为 `true`；树表 / edit 写 `false`。
   * `false` 时忽略 {@link UiTableProps.filterDisplay}。
   */
  filterable?: boolean
  /**
   * 列筛形态（仅 `filterable !== false` 时）：表头菜单或行内。
   * 总开关是 `filterable`，不要用 `'none'` 兼关。
   */
  filterDisplay?: 'menu' | 'row'
  /**
   * 列分组总开关。缺省 table 为 `true`；子表 Builder 写 `false`。
   */
  groupable?: boolean
  /**
   * 当前表头过滤模型，与 `searchParam.filterModel` 同一份。
   * 皮肤改筛时调 `onFilterModelChange`，不要另存表格 state。
   */
  filterModel?: EntityFilterModel
  /**
   * 列筛变化。必须 **return** `search()` 的 Promise，好让 custom binding 等完成后再写 dataSource。
   */
  onFilterModelChange?: (
    model: EntityFilterModel,
  ) => void | Promise<unknown>
  /**
   * 按字段名挂自定义单元格。有 key 就是自定义格，不要再传字段名名单。
   */
  fieldCellRenderers?: Record<string, UiFieldCellRenderer<T, TNode>>
  /** 行展开异构孙子组。 */
  rowDetail?: UiRowDetail<T, TNode>
  /**
   * 列头排序变化。写入 `pager.sorts` 再 `search()`，禁止对本页再排一遍。
   * 必须 **return** 该 Promise。
   */
  onSort?: (sorts: Sort[]) => void | Promise<unknown>
}

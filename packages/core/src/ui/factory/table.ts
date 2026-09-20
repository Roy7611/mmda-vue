import type { MetaUiField } from '../../metaui/metaui_field'
import type { TableColumnSettings } from '../../metaui/metaui_service'
import type { FilterModel } from '../../models/entity_search'
import type { Sort } from '../../models/pagination'
import type { UiListProps } from './list'

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
 * builder.table(metaUi, {
 *   rows,
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
  /** 已列出的表格字段。Builder 从 MetaUi.getListedFields() 注入；factory 不接触 MetaUi。 */
  fields?: MetaUiField[]
  /** 表格实体名。Builder 从 MetaUi.objName 注入，供皮肤做行详情/缓存等。 */
  objName?: string
  /** 列宽/列序等布局变化。factory 只上报，回写交给 Builder / 厂商布局组件。 */
  onLayoutChange?: (columns: TableColumnSettings[]) => void
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
  filterModel?: FilterModel
  /**
   * 列筛变化。必须 **return** `search()` 的 Promise，好让 custom binding 等完成后再写 dataSource。
   */
  onFilterModelChange?: (
    model: FilterModel,
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

import type { Pagination } from '../../models/pagination'
import type { UiSelectionMode } from '../context'
import type { UiAction } from '../action'
import type { UiBoxed, UiProps } from '../props'
import type { UiSlot } from '../slots'
/**
 * factory 捷径内部标签。公开契约已拆成 UiListProps / UiTableProps / UiGridProps，
 * 不要再靠一份 Props + `display` 糊三种能力。程序员请用对应 `build*` / `factory.*`。
 */
export type UiListDisplay = 'list' | 'table' | 'grid' | 'treeGrid'

/**
 * 移动端简单列表（卡片 / 行条）。`buildList` / `factory.list` 用这个。
 *
 * 不要列过滤、不要原位编辑、不要单元格渲染 map、不要 `scene`。
 * 桌面 index / 默认 selector 用 `UiTableProps`。
 */
export interface UiListProps<T = any> extends UiProps {
  /** 当前行数据。factory 不看 MetaUi，由 Builder 从会话模型注入。 */
  rows?: T[]
  /** 行主键字段。缺省实体 `id`；Builder 从 MetaUi 注入。 */
  primaryKey?: string
  /**
   * 工具栏/行上是否出业务动作。缺省由 Builder 按视图决定。
   * 与 `UiTableProps.showActionColumn`（最右操作列）不是同一件事。
   */
  showActions?: boolean
  /** 行操作（详情/编辑/删除 + 行上 `actions`）。命令列与右键共用。 */
  rowActions?: (row: T) => UiAction[]
  /** 行条高度档。 */
  itemHeight?: 'small' | 'large'
  /** 列表区域高度。 */
  height?: string | number
  /** 列表区域最大高度。 */
  maxHeight?: string | number
  /** 勾选：单选 / 多选。与 `selectedItems` 共用，虚拟化按下主键累计。 */
  selectionMode?: UiSelectionMode
  /** 哪一列当链接点进详情。来自 MetaUi `linkable` 时可不传。 */
  linkField?: string
  /**
   * 列表查询中。盒子化可驱动 loading，不必整页重渲。
   */
  loading?: UiBoxed<boolean>
  /**
   * 当前页数据（页码/页大小/总数）。不是「要不要分页」开关。
   * 桌面表用 `UiTableProps.pageable` 控制分页条。
   */
  pagination?: Pagination
  /** 页大小下拉选项。 */
  pageSizeOptions?: number[]
  /** 翻页。改 `searchParam.pager` 再 `search()`。 */
  onPage?: (pager: {
    pageSize?: number
    pageNo?: number
  }) => void | Promise<unknown>
  /** 行主键。缺省实体 `id`。 */
  itemKey?: (item: T) => string
  itemClass?: (item: T) => string
  itemStyle?: (item: T) => object
  onItemClick?: (item: T) => void
  onItemDoubleClick?: (item: T) => void
  onItemSelect?: (item: T) => void
  /** 勾选变化（含当前操作行）。 */
  onSelect?: (selection: T[], row?: T) => void
  onSelectAll?: (selection: T[]) => void
  onSelectionChange?: (selection: T[]) => void
  onItemContextMenu?: (item: T) => void
  /** 工具栏模糊搜索。 */
  onSearch?: (searchWord: string) => void
  /** 刷新当前查询。 */
  onRefresh?: () => void
}

/** 底部分页条。`factory.paginator` / `buildPaginator`。 */
export interface UiPaginatorProps extends UiProps {
  /** 当前分页。原 `factory.paginator(pagination, props)` 的第一参并入 props。 */
  pagination: Pagination
  pageSizeOptions?: number[]
  pagerCount?: number
  layout?: string
  template?: string
  currentPageReportTemplate?: string
  role?: string
  onPage: (pager: {
    pageSize?: number
    pageNo?: number
  }) => void | Promise<unknown>
}

/**
 * 列表 / 表格数据区的**区域插槽**，与 {@link UiListProps}（属性）分开 —— 仓库惯例是
 * `UiXxxProps` + `UiXxxSlots` 两个接口，消费点再组合（vui 的 `VuiListViewPropsType = Props & Emits & Slots`）。
 * `item` / `groupHeader` / `groupFooter` 带参；其余是惰性无参插槽（`UiSlot`）。
 */
export interface UiListSlots<T = any, TNode = any> {
  /** 列表头（表头之上）。 */
  header?: UiSlot<TNode>
  /** 列表尾。 */
  footer?: UiSlot<TNode>
  /** 移动端卡片 / 列表形态的一行。 */
  item?: (item: T, index: number) => TNode
  /** 加载中占位（只换数据区，不整页重渲）。 */
  loadingSlot?: UiSlot<TNode>
  /** 空数据占位。 */
  empty?: UiSlot<TNode>
  /** 分组头（`groupBy` 生效时）。 */
  groupHeader?: (scope: { data: unknown }) => TNode
  /** 分组尾。 */
  groupFooter?: (scope: { data: unknown }) => TNode
  /** 侧栏（左树右表之类）。 */
  aside?: UiSlot<TNode>
  /** 列表整体替换。 */
  list?: UiSlot<TNode>
  /** 网格整体替换。 */
  grid?: UiSlot<TNode>
}

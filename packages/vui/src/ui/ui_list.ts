import type { VNode, VNodeArrayChildren, VNodeChild, Ref } from "vue";
import type {
  EntityFilterModel,
  GridCellRenderer,
  MetaUiField,
  Pager,
  Pagination,
  Sort,
  UiSelectionMode,
} from "@mmda/core";
import type { ChildSlot } from "./ui_view";
import type { UiSlots } from "./ui_layout";
import type { CustomFilter } from "./ui_filter";
import type { UiAction } from "./ui_action";

export type UiTableCellRenderer<T = any> = (
  field: any,
  row: T,
  props?: Record<string, any>,
) => VNode;

export type {
  GridCellRenderer,
  GridCellRenderContext,
  GridCellValue,
} from "@mmda/core";

export type { UiSlots } from "./ui_layout";

export interface UiListProps<T = any> {
  [index: string]: any;
  striped?: boolean;
  showGridlines?: boolean;
  showSummary?: boolean;
  showColumnWithAction?: boolean;
  /**
   * 行操作列是否渲染「更多」下拉（业务 actions / 额外标准项）。
   * 默认 false：仅编辑、删除、详情三个常用按钮。
   */
  showActions?: boolean;
  /** 序号列右侧行操作菜单（详情/编辑/删除 + actions）。 */
  rowMenu?: (row: T) => UiAction[];
  itemHeight?: "small" | "large";
  height?: string | number;
  maxHeight?: string | number;
  selectionMode?: UiSelectionMode;
  linkField?: string;
  /** 列表查询中；传 Ref 可响应式驱动表格 loading，不必整页重渲。 */
  loading?: boolean | Ref<boolean>;
  inplaceEdit?: boolean;
  resizableColumns?: boolean;
  /** 列排序；默认开启。 */
  enableSort?: boolean;
  /** 列分组（拖到分组区）；默认开启，子表建议关闭。 */
  enableGroup?: boolean;
  pagination?: Pagination;
  pageSizeOptions?: number[];
  onPage?: (
    pager: { pageSize?: number; pageNo?: number },
  ) => void | Promise<unknown>;
  filterDisplay?: "menu" | "row" | "none";
  filterModel?: EntityFilterModel;
  onFilterModelChange?: (
    model: EntityFilterModel,
  ) => void | Promise<unknown>;
  /** 首次打开引用字段过滤器时加载并缓存可选项。 */
  loadFilterOptions?: (field: MetaUiField) => Promise<unknown[]>;
  filterLabels?: Partial<
    Record<"all" | "yes" | "no" | "apply" | "clear", string>
  >;
  itemKey?: (item: T) => string;
  itemClass?: (item: T) => string;
  itemStyle?: (item: T) => object;
  renderCell?: (
    field: MetaUiField,
    row: T,
    props?: Record<string, any>,
  ) => VNode | VNode[];
  gridCellRenderer?: GridCellRenderer<T>;
  /** 可按 fieldName 或 MetaUiField.renderer 名称注册。 */
  gridCellRenderers?: Record<string, GridCellRenderer<T>>;
}

export interface UiListEmits<T = any> {
  onItemClick?: (item: T) => void;
  onItemDoubleClick?: (item: T) => void;
  onItemSelect?: (item: T) => void;
  onSelect?: (selection: T[], row?: T) => void;
  onSelectAll?: (selection: T[]) => void;
  onSelectionChange?: (selection: T[]) => void;
  onItemContextMenu?: (item: T) => void;
  /** 可返回 Promise：Syncfusion 自定义绑定时需等查询结束再回写 dataSource。 */
  onSort?: (sorts: Sort[]) => void | Promise<unknown>;
  onSearch?: (searchWord: string) => void;
}

export interface UiListSlots<T = any> {
  header?: ChildSlot;
  footer?: ChildSlot;
  item?: (item: T, index: number) => VNodeChild;
  loadingSlot?: ChildSlot;
  empty?: ChildSlot;
  groupHeader?: (scope: { data: any }) => VNodeChild;
  groupFooter?: (scope: { data: any }) => VNodeChild;
  aside?: ChildSlot;
  list?: ChildSlot;
  grid?: ChildSlot;
}

export type UiListPropsType<T> = UiListProps<T> &
  UiListEmits<T> &
  UiListSlots<T>;

export type UiCustomSlots<T> = T | UiSlots;

export interface UiListColumnSlots extends UiSlots {
  body?: ChildSlot;
  editor?: ChildSlot;
  filter?: ChildSlot;
}

export interface UiListColumnProps {
  [index: string]: any;
  header?: string;
  field?: string | ((item: any) => any);
  columnKey?: string;
  footer?: string;
  frozen?: boolean;
  alignFrozen?: string;
  slots?: UiListColumnSlots;
}

export interface UiPaginatorProps {
  pageSizeOptions?: number[];
  pagerCount?: number;
  layout?: string;
  template?: string;
  currentPageReportTemplate?: string;
  role?: string;
}

export interface UiPaginatorEmits {
  onPage: (pager: { pageSize?: number; pageNo?: number }) => void;
}

export type UiPaginatorPropsType = UiPaginatorProps & UiPaginatorEmits;
export type UiPagableListPropsType<T> = UiPaginatorPropsType &
  UiListPropsType<T>;

export interface UiListViewProps<T> extends UiListProps<T> {
  showToolbar?: boolean;
  showBreadcrumb?: boolean;
  showSearchbar?: boolean;
  showMainHead?: boolean;
  linkField?: string;
  linkable?: boolean;
  customCellRenderers?: Record<string, UiTableCellRenderer>;
}

export interface UiListViewSlots<T> extends UiListSlots<T> {
  toolbar?: () => VNode | VNodeArrayChildren;
  header?: () => VNode | VNodeArrayChildren;
  content?: () => VNode | VNodeArrayChildren;
  footer?: () => VNode | VNodeArrayChildren;
  subMainFooter?: () => VNode | VNodeArrayChildren;
  defaultFilter?: () => VNode;
  customFilters?: CustomFilter[];
}

export interface UiListViewEmits<T> extends UiListEmits<T> {}
export type UiListViewPropsType<T> = UiListViewProps<T> &
  UiListViewEmits<T> &
  UiListViewSlots<T>;

export type { Pager };

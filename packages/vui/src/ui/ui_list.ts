import type { VNode, VNodeArrayChildren, VNodeChild } from "vue";
import type {
  EntityFilterModel,
  MetaUiField,
  Pager,
  Sort,
  UiSelectionMode,
} from "@mmda/core";
import type { ChildSlot } from "./ui_view";
import type { UiSlots } from "./ui_layout";
import type { CustomFilter } from "./ui_filter";

export type UiTableCellRenderer<T = any> = (
  field: any,
  row: T,
  props?: Record<string, any>,
) => VNode;

export type { UiSlots } from "./ui_layout";

export interface UiListProps<T = any> {
  [index: string]: any;
  striped?: boolean;
  showGridlines?: boolean;
  showSummary?: boolean;
  showColumnWithAction?: boolean;
  itemHeight?: "small" | "large";
  height?: string | number;
  maxHeight?: string | number;
  selectionMode?: UiSelectionMode;
  linkField?: string;
  loading?: boolean;
  inplaceEdit?: boolean;
  filterDisplay?: "menu" | "row" | "none";
  filterModel?: EntityFilterModel;
  onFilterModelChange?: (model: EntityFilterModel) => void;
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
}

export interface UiListEmits<T = any> {
  onItemClick?: (item: T) => void;
  onItemDoubleClick?: (item: T) => void;
  onItemSelect?: (item: T) => void;
  onSelect?: (selection: T[], row?: T) => void;
  onSelectAll?: (selection: T[]) => void;
  onSelectionChange?: (selection: T[]) => void;
  onItemContextMenu?: (item: T) => void;
  onSort?: (sorts: Sort[]) => void;
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
  showActions?: boolean;
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

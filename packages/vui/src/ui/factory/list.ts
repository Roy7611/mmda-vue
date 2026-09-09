import { h, type VNode, type VNodeChild } from "vue";
import type {
  MetaUiField,
  Pagination,
  Pager,
  UiGridProps as CoreUiGridProps,
  UiListDisplay,
  UiListProps as CoreUiListProps,
  UiPaginatorProps,
  UiRowDetail as CoreUiRowDetail,
  UiIndexTableHost,
  UiFieldCellRenderer as CoreUiFieldCellRenderer,
  UiTableProps as CoreUiTableProps,
  UiTreeGridProps as CoreUiTreeGridProps,
} from "@mmda/core";
import type { ChildSlot } from "../../contexts/view";
import type { UiSlots } from "../layout/layout";
import { uiCssClass } from '@mmda/core'

export type { UiSlots } from "../layout/layout";

export type {
  UiGridScene,
  UiListDisplay,
  UiIndexTableHost,
  UiFieldCellRenderer,
} from "@mmda/core";

/** @deprecated 用 UiFieldCellRenderer；两参 (field, row)，不要第三袋。 */
export type UiTableCellRenderer<T = any> = CoreUiFieldCellRenderer<T, VNode>;

/** 移动端简单列表。不要列过滤 / 原位进格。 */
export type UiListProps<T = any> = CoreUiListProps<T>;

/** 只读桌面表。 */
export type UiTableProps<T = any> = CoreUiTableProps<T, VNode>;

/** 可编桌面表。 */
export type UiGridProps<T = any> = CoreUiGridProps<T, VNode>;

/** 树形可编表（core 可编 + vui 树装配字段由 tree_grid 扩）。 */
export type UiTreeGridBaseProps<T = any> = CoreUiTreeGridProps<T, VNode>;

/** @deprecated 用 UiTableProps / UiGridProps；保留别名兼容旧 import。 */
export type UiRowDetail<T = any> = CoreUiRowDetail<T, VNodeChild>;

export function wrapRowDetail(content: VNodeChild): VNode {
  return h(
    "div",
    { class: "mmda-row-detail", "data-row-detail": "" },
    content as any,
  );
}

export interface UiListEmits<T = any> {
  onItemClick?: (item: T) => void;
  onItemDoubleClick?: (item: T) => void;
  onItemSelect?: (item: T) => void;
  onSelect?: (selection: T[], row?: T) => void;
  onSelectAll?: (selection: T[]) => void;
  onSelectionChange?: (selection: T[]) => void;
  onItemContextMenu?: (item: T) => void;
  onSort?: CoreUiTableProps<T>["onSort"];
  onSearch?: (searchWord: string) => void;
  onRefresh?: () => void;
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

export type UiTablePropsType<T = any> = UiTableProps<T> &
  UiListEmits<T> &
  UiListSlots<T> & {
    display?: UiListDisplay;
  };

export type UiGridPropsType<T = any> = UiGridProps<T> &
  UiListEmits<T> &
  UiListSlots<T> & {
    display?: UiListDisplay;
  };

/** 整页/工厂管道用最宽 Props（Grid ⊇ Table ⊇ List）。程序员 `buildList` 请用 `UiListProps`。 */
/** index 列布局：拖列宽/换列序后写回 MetaUi。子表不要传。 */
export type UiTableSettings = {
  persist: () => void;
  rev: { value: number };
};

export type UiTableSkinExtras<T = any> = {
  /** Builder 合成的默认格调度。Logic 请用 fieldCellRenderers。 */
  renderCell?: CoreUiFieldCellRenderer<T, VNode>;
  /** Builder 推算：哪些列需要 Vue 模板。不要手写。 */
  templateCellFields?: string[];
  filterLabels?: Partial<
    Record<"all" | "yes" | "no" | "apply" | "clear", string>
  >;
  dateRangeLabels?: Partial<Record<string, string>>;
  /** 列筛下拉。Builder 接到 loadReferenceOptions。 */
  loadFilterOptions?: (field: MetaUiField) => Promise<unknown[]>;
  /** 日期列透视。Builder 接到 logic.getPivotDates。 */
  loadPivotDates?: (field: MetaUiField) => Promise<unknown>;
  /** 列筛 hasOne 联想。Builder 接到 context.searchRelative。 */
  searchRelative?: (
    field: MetaUiField,
    searchWord: string,
  ) => Promise<unknown[]>;
  /** index 列布局能力。有则允许拖列并持久化。 */
  tableSettings?: UiTableSettings;
  /** index KeepAlive 宿主。Builder 注入；销毁传 null。 */
  onIndexTableHostReady?: (host: UiIndexTableHost | null) => void;
  /**
   * Builder 默认单元格写回。程序员请用 fieldCellEditors[name].onSave。
   */
  defaultCellSave?: (
    field: MetaUiField,
    row: T,
    value: unknown,
    previousValue: unknown,
  ) => boolean | void;
};

export type UiListPropsType<T = any> = UiGridPropsType<T> & UiTableSkinExtras<T>;

export type UiCustomSlots<T> = T | UiSlots;

export interface UiListColumnSlots extends UiSlots {
  body?: ChildSlot;
  editor?: ChildSlot;
  filter?: ChildSlot;
}

export interface UiListColumnProps {
  header?: string;
  field?: string | ((item: any) => any);
  columnKey?: string;
  footer?: string;
  frozen?: boolean;
  alignFrozen?: string;
  slots?: UiListColumnSlots;
}

export interface UiPaginatorEmits {
  onPage: (pager: { pageSize?: number; pageNo?: number }) => void;
}

export type { UiPaginatorProps } from '@mmda/core'
export type UiPaginatorPropsType = UiPaginatorProps;
export type UiPagableListPropsType<T> = UiPaginatorPropsType &
  UiListPropsType<T>;

export type { Pager };

type ListFamily = {
  list: (...args: any[]) => unknown;
  table: (...args: any[]) => unknown;
  treeGrid: (...args: any[]) => unknown;
  grid?: (...args: any[]) => unknown;
};

/** 把 list / table / grid / treeGrid 接到同一套 display 分发；table 与 grid 可共用 renderer。 */
export function bindListDisplayRenderers(factory: ListFamily) {
  const list = factory.list.bind(factory);
  const table = factory.table.bind(factory);
  const treeGrid = factory.treeGrid.bind(factory);
  const dispatch = (
    model: unknown,
    metaUi: unknown,
    props: UiListPropsType<any> = {},
  ) => {
    const display = props.display ?? "list";
    if (display === "treeGrid") return treeGrid(model, metaUi, props);
    if (display === "list") return list(model, metaUi, props);
    return table(model, metaUi, props);
  };
  factory.list = (model, metaUi, props = {}) =>
    dispatch(model, metaUi, { ...props, display: props.display ?? "list" });
  factory.table = (model, metaUi, props = {}) =>
    dispatch(model, metaUi, { ...props, display: props.display ?? "table" });
  factory.grid = (model, metaUi, props = {}) =>
    dispatch(model, metaUi, { ...props, display: props.display ?? "grid" });
  factory.treeGrid = (model, metaUi, props = {}) =>
    dispatch(model, metaUi, {
      ...props,
      display: props.display ?? "treeGrid",
    });
}

/** 有 `pagination` 且 `pageable !== false` 时在内容下方接 `factory.paginator`。 */
export function wrapWithPaginator(
  factory: {
    paginator: (model: Pagination, props: UiPaginatorPropsType) => VNode;
  },
  node: VNode,
  pagination: Pagination | undefined,
  props: {
    onPage?: UiListProps["onPage"];
    pageSizeOptions?: number[];
    pageable?: boolean;
  },
  className = uiCssClass('pagable'),
): VNode {
  if (!pagination || props.pageable === false) return node;
  return h("div", { class: className }, [
    node,
    factory.paginator(pagination, {
      onPage: (pager) => {
        void props.onPage?.(pager);
      },
      pageSizeOptions: props.pageSizeOptions,
    }),
  ]);
}

export function wrapListFamilyPaginator(
  factory: {
    paginator: (model: Pagination, props: UiPaginatorPropsType) => VNode;
    list: (...args: any[]) => VNode;
    table?: (...args: any[]) => VNode;
    treeGrid?: (...args: any[]) => VNode;
  },
  names: Array<"list" | "table" | "treeGrid">,
  className = uiCssClass('pagable'),
) {
  for (const name of names) {
    const orig = factory[name];
    if (typeof orig !== "function") continue;
    factory[name] = (
      model: unknown,
      metaUi: unknown,
      props: UiListPropsType<any> = {},
    ) =>
      wrapWithPaginator(
        factory,
        orig(model, metaUi, props),
        props.pagination,
        props,
        className,
      );
  }
}

export function listModifierClasses(
  props: { class?: unknown; display?: UiListDisplay } = {},
): unknown[] {
  const display = props.display ?? "list";
  return [
    uiCssClass('list'),
    display !== "list" ? uiCssClass('list', display) : undefined,
    props.class,
  ];
}

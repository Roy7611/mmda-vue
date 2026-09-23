import { h, type VNode, type VNodeChild } from "vue";
import type {
  FilterModel,
  MetaUiField,
  Pagination,
  Pager,
  UiGridProps as CoreUiGridProps,
  UiListDisplay,
  UiListProps as CoreUiListProps,
  UiListSlots,
  UiPaginatorProps,
  UiRowDetail as CoreUiRowDetail,
  UiIndexTableHost,
  UiCellRenderer as CoreUiCellRenderer,
  UiTableProps as CoreUiTableProps,
  UiTreeGridProps as CoreUiTreeGridProps,
} from "@mmda/core";
import type { ChildSlot } from "../../contexts/view";
import type { VuiTileSlots } from "../layout";
import { uiCssClass } from '@mmda/core'

export type { VuiTileSlots } from "../layout";

export type {
  UiGridScene,
  UiListDisplay,
  UiIndexTableHost,
  UiCellRenderer,
} from "@mmda/core";

/** @deprecated 用 UiCellRenderer；两参 (field, row)，不要第三袋。 */
export type VuiTableCellRenderer<T = any> = CoreUiCellRenderer<T, VNode>;


/** 只读桌面表。 */
export type VuiTableProps<T = any> = CoreUiTableProps<T, VNode>;

/** 可编桌面表。 */
export type VuiGridProps<T = any> = CoreUiGridProps<T, VNode>;

/** 树形可编表（core 可编 + vui 树装配字段由 tree_grid 扩）。 */
export type VuiTreeGridBaseProps<T = any> = CoreUiTreeGridProps<T, VNode>;

/** @deprecated 用 VuiTableProps / VuiGridProps；保留别名兼容旧 import。 */
export type VuiRowDetail<T = any> = CoreUiRowDetail<T, VNodeChild>;

export function wrapRowDetail(content: VNodeChild): VNode {
  return h(
    "div",
    { class: "mmda-row-detail", "data-row-detail": "" },
    content as any,
  );
}

export interface VuiListEmits<T = any> {
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

export type VuiTablePropsType<T = any> = VuiTableProps<T> &
  VuiListEmits<T> &
  UiListSlots<T, VNode> & {
    display?: UiListDisplay;
  };

export type VuiGridPropsType<T = any> = VuiGridProps<T> &
  VuiListEmits<T> &
  UiListSlots<T, VNode> & {
    display?: UiListDisplay;
  };

/** 整页/工厂管道用最宽 Props（Grid ⊇ Table ⊇ List）。程序员 `buildList` 请用 `UiListProps`。 */
/** index 列布局：拖列宽/换列序后写回 MetaUi。子表不要传。 */
export type VuiTableSettings = {
  persist: () => void;
  rev: { value: number };
  open?: () => void;
};

export type VuiTableSkinExtras<T = any> = {
  /** Builder 合成的默认格调度。Logic 请用 fieldCellRenderers。 */
  renderCell?: CoreUiCellRenderer<T, VNode>;
  /** Builder 推算：哪些列需要 Vue 模板。不要手写。 */
  templateCellFields?: string[];
  filterLabels?: Partial<
    Record<
      "all" | "yes" | "no" | "apply" | "clear" | "values" | "date" | "datetime",
      string
    >
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
  tableSettings?: VuiTableSettings;
  /** index 工作区保活宿主。Builder 注入；销毁传 null。 */
  onIndexTableHostReady?: (host: UiIndexTableHost | null) => void;
  /** 已勾选主键行。虚拟化按下主键累计；Builder 从会话注入。 */
  selectedItems?: T[];
  /** 联查模式开关：index 表宿主按此切换列表来源。 */
  joinListMode?: boolean;
  /** 就地 rebind 后读现在的 searchParam.filterModel，不要建表快照。 */
  filterModelOf?: () => FilterModel | undefined;
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

export type VuiListPropsType<T = any> = VuiGridPropsType<T> & VuiTableSkinExtras<T>;

export type VuiCustomSlots<T> = T | VuiTileSlots;

export interface VuiListColumnSlots extends VuiTileSlots {
  body?: ChildSlot;
  editor?: ChildSlot;
  filter?: ChildSlot;
}

export interface VuiListColumnProps {
  header?: string;
  field?: string | ((item: any) => any);
  columnKey?: string;
  footer?: string;
  frozen?: boolean;
  alignFrozen?: string;
  slots?: VuiListColumnSlots;
}

export interface VuiPaginatorEmits {
  onPage: (pager: { pageSize?: number; pageNo?: number }) => void;
}

export type { UiPaginatorProps } from '@mmda/core'
export type VuiPagableListPropsType<T> = UiPaginatorProps &
  VuiListPropsType<T>;

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
  const propsOf = (...args: any[]) => {
    if (args.length === 1) return (args[0] ?? {}) as VuiListPropsType<any>;
    const [rows, metaUi, props = {}] = args;
    const meta = metaUi as {
      primaryKey?: string;
      objName?: string;
      getListedFields?: () => unknown[];
    };
    return {
      ...props,
      rows,
      primaryKey: props.primaryKey ?? meta?.primaryKey,
      objName: props.objName ?? meta?.objName,
      fields:
        props.fields ??
        (typeof meta?.getListedFields === "function"
          ? meta.getListedFields()
          : undefined),
    } as VuiListPropsType<any>;
  };
  const dispatch = (props: VuiListPropsType<any> = {}) => {
    const display = props.display ?? "list";
    if (display === "treeGrid") return treeGrid(props);
    if (display === "list") return list(props);
    return table(props);
  };
  factory.list = ((...args: any[]) =>
    dispatch(propsOf(...args) as VuiListPropsType<any>) as unknown) as typeof factory.list;
  factory.table = ((...args: any[]) => {
    const props = propsOf(...args) as VuiListPropsType<any>;
    return dispatch({ ...props, display: props.display ?? "table" });
  }) as typeof factory.table;
  factory.grid = ((...args: any[]) => {
    const props = propsOf(...args) as VuiListPropsType<any>;
    return dispatch({ ...props, display: props.display ?? "grid" });
  }) as typeof factory.grid;
  factory.treeGrid = ((...args: any[]) => {
    const props = propsOf(...args) as VuiListPropsType<any>;
    return dispatch({
      ...props,
      display: props.display ?? "treeGrid",
    });
  }) as typeof factory.treeGrid;
}

/** 有 `pagination` 且 `pageable !== false` 时在内容下方接 `factory.paginator`。 */
export function wrapWithPaginator(
  factory: {
    paginator: (props: UiPaginatorProps) => VNode;
  },
  node: VNode,
  pagination: Pagination | undefined,
  props: {
    onPage?: CoreUiListProps["onPage"];
    pageSizeOptions?: number[];
    pageable?: boolean;
  },
  className = uiCssClass('pagable'),
): VNode {
  if (!pagination || props.pageable === false) return node;
  return h("div", { class: className }, [
    node,
    factory.paginator({
      pagination,
      onPage: (pager) => {
        void props.onPage?.(pager);
      },
      pageSizeOptions: props.pageSizeOptions,
    }),
  ]);
}

export function wrapListFamilyPaginator(
  factory: {
    paginator: (props: UiPaginatorProps) => VNode;
    list: (...args: any[]) => VNode;
    table?: (...args: any[]) => VNode;
    treeGrid?: (...args: any[]) => VNode;
  },
  names: Array<"list" | "table" | "treeGrid">,
  className = uiCssClass('pagable'),
) {
  for (const name of names) {
    const orig = (factory as any)[name];
    if (typeof orig !== "function") continue;
    (factory as any)[name] = (...args: any[]) => {
      const props =
        args.length === 1
          ? ((args[0] ?? {}) as VuiListPropsType<any>)
          : {
              ...(args[2] ?? {}),
              rows: args[0],
              primaryKey: args[2]?.primaryKey ?? (args[1] as any)?.primaryKey,
              fields:
                args[2]?.fields ??
                (typeof (args[1] as any)?.getListedFields === "function"
                  ? (args[1] as any).getListedFields()
                  : undefined),
              objName: args[2]?.objName ?? (args[1] as any)?.objName,
            };
      return wrapWithPaginator(
        factory,
        orig(props),
        props.pagination,
        props,
        className,
      );
    };
  }
}

export function listModifierClasses(
  props: { class?: unknown; display?: UiListDisplay } = {},
): unknown[] {
  const display = props.display ?? "list";
  return [
    uiCssClass('list'),
    display !== "list" ? uiCssClass('list', undefined, display) : undefined,
    props.class,
  ];
}

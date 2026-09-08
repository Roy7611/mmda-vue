import { h, type VNode, type VNodeChild, type Ref } from "vue";
import type {
  EntityFilterModel,
  MetaUiField,
  Pager,
  Pagination,
  Sort,
  UiSelectionMode,
} from "@mmda/core";
import type { ChildSlot } from "../../contexts/view";
import type { UiSlots } from "../layout/layout";
import type { UiAction } from "./action";

export type UiTableCellRenderer<T = any> = (
  field: any,
  row: T,
  props?: Record<string, any>,
) => VNode;

export type { UiSlots } from "../layout/layout";

/** 表格场景；三套皮肤同一组字面量，不要各自再定义。 */
export type UiGridScene = "index" | "selector" | "edit" | "details";

/** 同一套 UiListProps 的呈现意图。 */
export type UiListDisplay = "list" | "table" | "grid" | "treeGrid";

export interface UiListProps<T = any> {
  [index: string]: any;
  /**
   * 呈现：list 移动端卡片；table 只读高性能；grid 可编；treeGrid 树形表。
   * 缺省由 factory.list / table / grid / treeGrid 捷径写入。
   */
  display?: UiListDisplay;
  /** 列表页 / 选记录 / 子表编辑 / 子表只读。缺省由 Builder 按 view 推断。 */
  scene?: UiGridScene;
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
  /** 使用组件库表格的单元格编辑能力（Syncfusion 为 Batch/Excel 模式）。 */
  inplaceEdit?: boolean;
  /**
   * 原位编辑启动方式（仅 Syncfusion 等原生 Grid 生效）：
   * - `excel`：单击选中；键入可打印字符时进入并覆盖（子表默认）
   * - `click`：单击进入编辑
   * - `dblclick`：双击进入编辑（EJ2 默认）
   */
  inplaceEditStart?: "click" | "dblclick" | "excel";
  /** 允许原位编辑的字段；未列出的字段继续作为弹窗编辑入口。 */
  editableFields?: string[];
  canEditCell?: (item: T, field: MetaUiField) => boolean;
  onCellSave?: (
    item: T,
    field: MetaUiField,
    value: unknown,
    previousValue: unknown,
  ) => boolean | void;
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
  /** 日期列 Excel 树：日历日 YYYY-MM-DD。 */
  loadPivotDates?: (field: MetaUiField) => Promise<unknown>;
  /** 相对日期筛选项标签（dateRange.TODAY 等）。 */
  dateRangeLabels?: Partial<Record<string, string>>;
  /** hasOne 列筛远程联想（关联仓储，默认 pageSize 20）。 */
  searchRelative?: (
    field: MetaUiField,
    searchWord: string,
  ) => Promise<unknown[]>;
  /** 列表列宽/显隐/冻结/顺序变更后回写元数据并缓存。 */
  onListLayoutChange?: () => void;
  /** 列布局版本；变化时重建表格。 */
  layoutRev?: number | { value: number };
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
  /**
   * 需要 EJ2 `column.template` 的字段名。索引表大量行时应只包含 linkable / 自定义渲染列；
   * 其余列走 Grid valueAccessor 纯文本，避免千行×N 列的模板开销。
   * 未传则皮肤可自行判断或退回全列模板。
   */
  templateCellFields?: string[];
  /**
   * 行展开：该行底下的异构孙子组（如 BomItem.operations），不是本行列。
   * 不要 childGrid / detailTemplate / expandedRows（厂商面）。
   */
  rowDetail?: UiRowDetail<T>;
}

/** 表格行明细。`detail` 单数，避免和 scene `details`（详情页）撞名。 */
export interface UiRowDetail<T = any> {
  /** 挂载后全部展开。编辑/详情子表默认 true。 */
  expandAll?: boolean;
  detail: (row: T) => VNodeChild;
}

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
  /**
   * 列排序。必须把 sorts 写进 `searchParam.pager.sorts` 后 `return search()`。
   * 皮肤（含 Prime / Naive）要 `return` 这个 Promise，等完成再改 dataSource。
   */
  onSort?: (sorts: Sort[]) => void | Promise<unknown>;
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
  const dispatch = (model: unknown, metaUi: unknown, props: UiListPropsType<any> = {}) => {
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
    dispatch(model, metaUi, { ...props, display: props.display ?? "treeGrid" });
}

/** 有 `pagination` 时在内容下方接 `factory.paginator`；子表不传则原样返回。 */
export function wrapWithPaginator(
  factory: {
    paginator: (
      model: Pagination,
      props: UiPaginatorPropsType,
    ) => VNode;
  },
  node: VNode,
  pagination: Pagination | undefined,
  props: {
    onPage?: UiListProps["onPage"];
    pageSizeOptions?: number[];
  },
  className = "mmda-pagable",
): VNode {
  if (!pagination) return node;
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
    paginator: (
      model: Pagination,
      props: UiPaginatorPropsType,
    ) => VNode;
    list: (...args: any[]) => VNode;
    table?: (...args: any[]) => VNode;
    treeGrid?: (...args: any[]) => VNode;
  },
  names: Array<"list" | "table" | "treeGrid">,
  className = "mmda-pagable",
) {
  for (const name of names) {
    const orig = factory[name];
    if (typeof orig !== "function") continue;
    factory[name] = (model: unknown, metaUi: unknown, props: UiListPropsType<any> = {}) =>
      wrapWithPaginator(
        factory,
        orig(model, metaUi, props),
        props.pagination,
        props,
        className,
      );
  }
}

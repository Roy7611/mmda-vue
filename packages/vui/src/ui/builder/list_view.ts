import {
  defineComponent,
  h,
  onUnmounted,
  ref,
  type PropType,
  type VNode,
  type VNodeArrayChildren,
} from "vue";
import {
  CHOICE_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  MetaModel,
  SqlDataType,
  auth,
  uiCssClass,
  type EntityAction,
  type MetaUi,
  type MetaUiField,
  type MetaUiGroup,
  type UiListProps,
  type UiListSlots,
  type UiListViewProps,
  type UiPaginatorProps,
  type UiViewSlots,
} from "@mmda/core";
import {
  readStoredPageSize,
  writeStoredPageSize,
  readStoredShowActionsColumn,
} from "../../app/theme";
import {
  applyTableColumnSettings,
  schedulePersistListPack,
} from "./list_layout";
import { cleanTableCellProps } from "../factory";
import type { UiFieldCellProps, UiProps } from "@mmda/core";
import type {
  VuiListPropsType,
  VuiListEmits,
  UiListDisplay,
  UiCellRenderer,
} from "../factory/list";
import type { CustomFilter } from "../factory/filter";
import { writeListFilterModel, writeListSorts } from "./list_query";
import { indexTableMetaUi } from "./join_list_mode";
import type {
  VuiTreeGridPropsType,
  VuiTreeGridViewPropsType,
} from "../factory/tree_grid";
import { treeDataProvider, treeIdField } from "./tree_data";
import type { VuiTreeListViewPropsType } from "../factory/tree_category_list";
import { treeIdOf, treeLabelOf, type UiTreeViewProps } from "../factory/tree";
import { UiActionDivider, type UiAction } from "../factory/action";
import type { VuiContext } from "../../contexts/vue_ui_context";
import { getModuleContext } from "../../contexts/vue_module_context";
import type { VuiBuilder } from "../builder";
import type { UiIndexTopbarLayout } from "@mmda/core";
import type { UiContext } from "./helpers";
import type { AbstractConstructor } from "./mixin";

function listRows(model: unknown): unknown[] {
  return Array.isArray(model) ? model : [];
}

/**
 * 列表**整页**视图 props：只吃 core 的 `UiListViewProps`（页级开关 + 页级插槽
 * toolbar / header / content / footer）。
 *
 * 数据区控件的属性（rows / primaryKey / rowActions / fieldCellRenderers …）属于
 * `UiListProps` / `UiTableProps`，拼屏时由 Builder 构造控件 props 传下去 ——
 * **不要在这里再声明一遍**（那会让「整页」与「控件」两层粘在一起）。
 */
export type VuiListViewProps<T = any> = UiListViewProps<VNode>

/**
 * 列表页只留自己有语义的三个；页级四件套（toolbar / header / content / footer）
 * 已上移 core `UiViewSlots`，由 `UiListViewProps` 带进来。
 */
export interface VuiListViewSlots<T = any> extends UiListSlots<T, VNode> {
  subMainFooter?: () => VNode | VNodeArrayChildren;
  defaultFilter?: () => VNode;
  customFilters?: CustomFilter[];
}

export interface VuiListViewEmits<T = any> extends VuiListEmits<T> {}
export type VuiListViewPropsType<T> = VuiListViewProps<T> &
  VuiListViewEmits<T> &
  VuiListViewSlots<T>;

export interface TableCellProps extends UiProps {
  row?: any
  isTree?: boolean
  isSearch?: boolean
  readOnlyRows?: boolean
  editable?: boolean
  cacheKey?: string
  tableMetaui?: MetaUi
}

export function WithList<TBase extends AbstractConstructor>(Base: TBase) {
  abstract class ListBuilder extends Base {
    tableWithCells(
      rows: any[],
      metaUi: MetaUi,
      rowContext: (row: any) => UiContext,
      tableProps: VuiListPropsType<any> = {},
    ): VNode {
      const cellRenderers = tableProps.fieldCellRenderers;
      const cellProps = cleanTableCellProps({
        tableMetaui: metaUi,
        ...(tableProps as UiProps),
      } as UiProps);
      if ((tableProps as any).readOnlyRows !== undefined) {
        Object.defineProperty(cellProps, "readOnlyRows", {
          value: (tableProps as any).readOnlyRows,
          enumerable: false,
        });
      }
      if ((tableProps as any).editable !== undefined) {
        Object.defineProperty(cellProps, "editable", {
          value: (tableProps as any).editable,
          enumerable: false,
        });
      }

      // 用同一份 list context 探测哪些列真正需要 Vue 单元格（自定义 / 链接 / 非纯文本）。
      // 索引页 rowContext 恒为 () => context，不可在这里对每行 with(row)。
      const probeContext = rowContext(rows[0] ?? {});
      const listedRaw =
        typeof (metaUi as any).getListedFields === "function"
          ? (metaUi as any).getListedFields()
          : (metaUi as any).listedFields;
      const listed: MetaUiField[] = Array.isArray(listedRaw) ? listedRaw : [];
      const templateCellFields = listed
        .filter((field: MetaUiField) => {
          if (cellRenderers?.[field.fieldName]) return true;
          if (field.linkable) return true;
          const logic = probeContext.getFieldLogic?.(field) as any;
          if (logic?.customCellRenderer || logic?.customRenderer) return true;
          const display = this.fieldDisplayName(field);
          return display !== "textSpan";
        })
        .map((field: MetaUiField) => field.fieldName);

      return this.factory.list({
        ...tableProps,
        rows,
        primaryKey: tableProps.primaryKey ?? metaUi.primaryKey,
        objName: tableProps.objName ?? metaUi.objName,
        fields: tableProps.fields ?? listed,
        display: tableProps.display ?? "table",
        templateCellFields,
        renderCell: (field: MetaUiField, row: any) => {
          const custom = cellRenderers?.[field.fieldName];
          if (custom) {
            const node = custom(field, row);
            if (node !== undefined) return node;
          }
          if (!templateCellFields.includes(field.fieldName)) {
            return undefined as any;
          }
          return this.displayCellFor(field, row, rowContext(row), cellProps);
        },
      });
    }

    buildTreeGrid<T = any>(
      rows: T[],
      metaUi: MetaUi,
      rowContext: (row: T) => UiContext,
      props: VuiTreeGridPropsType<T> = {},
    ): VNode {
      const cellRenderers = props.fieldCellRenderers;
      const cellProps = cleanTableCellProps({
        tableMetaui: metaUi,
        isTree: true,
        ...(props as UiProps),
      } as UiProps);
      if ((props as any).readOnlyRows !== undefined) {
        Object.defineProperty(cellProps, "readOnlyRows", {
          value: (props as any).readOnlyRows,
          enumerable: false,
        });
      }
      if ((props as any).editable !== undefined) {
        Object.defineProperty(cellProps, "editable", {
          value: (props as any).editable,
          enumerable: false,
        });
      }
      return this.factory.list({
        ...props,
        rows,
        primaryKey: props.primaryKey ?? metaUi.primaryKey,
        objName: props.objName ?? metaUi.objName,
        fields:
          props.fields ??
          (typeof (metaUi as any).getListedFields === "function"
            ? (metaUi as any).getListedFields()
            : (metaUi as any).listedFields),
        display: "treeGrid",
        isTree: true,
        renderCell: (field: MetaUiField, row: any) => {
          const custom = cellRenderers?.[field.fieldName];
          if (custom) {
            const node = custom(field, row);
            if (node !== undefined) return node;
          }
          return this.displayCellFor(field, row, rowContext(row), cellProps);
        },
      });
    }

    buildTreeGridView<T = any>(
      context: UiContext,
      props: VuiTreeGridViewPropsType<T> = {},
    ): VNode {
      const runtime = context as any;
      const rows = listRows(context.model) as T[];
      const treeShape = props.treeShape ?? "TREE";
      const shapeKey = props.shapeKey ?? "";
      const loadMode = props.loadMode ?? "lazy";
      const idField =
        props.idField ??
        treeIdField(treeShape, shapeKey, context.metaUi?.primaryKey);
      const onExpand =
        props.onExpand ??
        (loadMode === "lazy"
          ? async (node: T) => {
              const kids = await this.loadTreeGridChildren(context, node, {
                treeShape,
                shapeKey,
                idField,
              });
              treeDataProvider.attachChildren(node, kids);
            }
          : undefined);
      const treeGrid = this.buildTreeGrid(rows, context.metaUi, () => context, {
        ...props,
        treeShape,
        shapeKey,
        idField,
        parentIdField:
          props.parentIdField ?? (treeShape === "TREE" ? shapeKey : undefined),
        loadMode,
        onExpand,
        filterable: props.filterable ?? false,
        loading: props.loading ?? runtime.loading,
        selectedItems: runtime.selectedItems ?? [],
        onSelect: (selection) => {
          context.selectedItems = selection as any;
          props.onSelect?.(selection);
        },
      });
      const { toolbar, searchbar } = this.listViewParts(context, {
        ...props,
        content: () => treeGrid,
      });
      return this.layout.layoutIndexPage({
        toolbar:
          toolbar ??
          (!toolbar && searchbar ? searchbar : undefined) ??
          undefined,
        default: treeGrid,
      });
    }

    async loadTreeGridChildren<T>(
      context: UiContext,
      parent: T,
      spec: { treeShape: string; shapeKey: string; idField: string },
    ): Promise<T[]> {
      const runtime = context as any;
      const parentId = String(
        (parent as any)?.[spec.idField] ?? (parent as any)?.id ?? "",
      );
      const queryParams =
        spec.treeShape === "HIERARCHY"
          ? { [spec.shapeKey]: parentId }
          : { [spec.shapeKey]: parentId };
      const data = await runtime.logic?.getAll?.({
        pager: { pageNo: 1, pageSize: 1000 },
        queryParams,
      });
      return (data?.list ?? []) as T[];
    }

    /** 对齐旧版 `_tableCell`；cellProps 应在列/表级预先 cleanTableCellProps，勿在此处逐格清理 */
    tableCell(
      field: MetaUiField,
      ctx: UiContext,
      inPlaceEdit = false,
      props: TableCellProps = {},
    ): VNode {
      // cellProps 就是 core `UiFieldCellProps`（第三参）：表格渲染时 `ctx` 是整表会话，
      // 当前行靠挂在这里的不可枚举 `row` 传下去（可枚举会被 `{...props}` 带进控件/DOM）。
      const cellProps = { ...props } as UiFieldCellProps;
      if (props.row !== undefined) {
        Object.defineProperty(cellProps, "row", {
          value: props.row,
          enumerable: false,
        });
      }

      const isLock = ctx.isFieldReadonly(field) || ctx.isFieldHidden(field);
      const fieldLogic = ctx.getFieldLogic(field);
      const model = (props.row ?? ctx.model) as { editable?: boolean };
      const useEditor = inPlaceEdit && model?.editable !== false && !isLock;

      if (useEditor) {
        const editor =
          fieldLogic?.customCellEditor ??
          fieldLogic?.customEditor ??
          this.fieldFactory[field.editor ?? "textInput"] ??
          this.fieldFactory.fallbackInput;
        return editor(field, ctx, cellProps);
      }

      // 只读格的紧凑排法（编辑控件不吃这个 class）
      if (!field.renderer || this.fieldFactory["textSpan"]) {
        cellProps.class =
          `${cellProps.class ? cellProps.class : ""} two-line-ellipsis`.trim();
      }
      const renderer =
        fieldLogic?.customCellRenderer ??
        this.fieldFactory[this.fieldDisplayName(field)] ??
        this.fieldFactory.fallbackDisplay;
      return renderer(field, ctx, cellProps);
    }

    /**
     * 兼容旧 customRenderer 的轻量只读行视图。
     * 它不进入 context 树，也不创建响应式代理和校验状态。
     */
    readonlyRowContext(
      context: UiContext,
      row: Record<string, any>,
    ): UiContext {
      const rowContext = Object.create(context) as UiContext;
      Object.defineProperty(rowContext, "model", {
        value: row,
        enumerable: true,
      });
      rowContext.getFieldValue = (field, model = row as any) =>
        context.getFieldValue(field, model);
      rowContext.displayField = (field, model = row as any) =>
        context.displayField(field, model);
      rowContext.routeToRelative = (field) =>
        context.routeToRelative?.(field, row) ?? "";
      return rowContext;
    }

    /** 对齐旧版 `_tableCellWithError` */
    tableCellWithError(
      field: MetaUiField,
      ctx: UiContext,
      inPlaceEdit = false,
      props: TableCellProps = {},
    ): VNode | VNode[] {
      const cellError = ctx.getInvalidMessage(field);
      const cell = this.tableCell(field, ctx, inPlaceEdit, props);
      if (!cellError) return cell;
      return [
        cell,
        this.factory.icon({
          iconClass: "pi pi-exclamation-circle",
          class: "error",
          title: cellError,
        }),
      ];
    }

    /** 对齐旧版 `_tableColumn` body 分支 */
    resolveTableColumnBody(
      field: MetaUiField,
      row: any,
      context: UiContext,
      props: TableCellProps = {},
    ): VNode | VNode[] {
      const fieldLogic = context.getFieldLogic(field);
      // Syncfusion：nativeInplaceEdit 默认 true，未 inPlaceEdit(false) 即可编。
      const nativeGrid = this.factory.nativeInplaceEdit === true;
      const cellEditable = nativeGrid
        ? fieldLogic?.inplaceEditable !== false
        : fieldLogic?.inplaceEditable === true;
      const isRoot = (context as { name?: string }).name == ".";
      const isTree = props?.isTree ?? false;
      const isSearch = props?.isSearch;
      const useLink = isRoot && field.linkable;

      const readOnlyRoot =
        !context.editing && (isRoot || props.readOnlyRows === true);

      const customRenderer =
        fieldLogic?.customCellRenderer ?? fieldLogic?.customRenderer;
      if (customRenderer) {
        // 这条是**旧 customRenderer 兼容路径**：业务函数按「行 context」写
        // （`ctx.getFieldValue(fld)` 不带 row），所以这里必须给行上下文 ——
        // 不要按表格默认路径那样省掉它。
        const rowContext = readOnlyRoot
          ? this.readonlyRowContext(context, row)
          : context.model === row
            ? context
            : context.with(row, props?.cacheKey ?? undefined);
        const rendererProps = { ...props } as UiFieldCellProps;
        Object.defineProperty(rendererProps, "row", {
          value: row,
          enumerable: false,
        });
        return customRenderer(field, rowContext, rendererProps);
      }

      // 布尔：常显控件；其它类型：无原生就地编辑时才用 Vue 编辑器。
      const boolCell =
        SqlDataType.isBool(field.dataType) &&
        Boolean(context.editing) &&
        !isSearch &&
        cellEditable &&
        !context.isFieldReadonly(field);
      const useEditor =
        boolCell ||
        (Boolean(context.editing) &&
          !isSearch &&
          !props?.editable &&
          cellEditable &&
          !context.isFieldReadonly(field));

      if (useLink && !isSearch) {
        const { tableMetaui } = props;
        const isCrossModule =
          !(context as { module?: unknown }).module ||
          context.metaUi?.objName !== tableMetaui?.objName;

        return this.factory.link({
          text: MetaModel.displayField(row, field),
          class: "link two-line-ellipsis text-left mmda-table-link",
          onClick: (event: Event) => {
            event.preventDefault();
            if (isCrossModule && tableMetaui?.objName) {
              const entityId =
                row.id ??
                (tableMetaui.primaryKey
                  ? row[tableMetaui.primaryKey]
                  : undefined);
              const router = (context as any).globalProps?.$router;
              const route = router?.resolve({
                name: tableMetaui.objName,
                params: { id: entityId },
              });
              if (route?.href) window.open(route.href, "_blank");
            } else if (typeof (context as any).routeToDetails === "function") {
              (context as any).routeToDetails(row);
            }
          },
        });
      }

      if (readOnlyRoot) {
        return this.tableCell(field, context, false, { ...props, row });
      }

      // 表格默认路径**不建行上下文**：单元格只要「字段 + 行」，行走第三参 `props.row`；
      // 行级上下文是编辑子表时的事（`beginEditRow`），不该出现在每格热路径上
      // （1000 行 × N 列就是上千次子 context 分配）。
      if (isRoot) {
        return this.tableCell(field, context, useEditor, { ...props, row });
      }

      return this.tableCellWithError(field, context, useEditor, { ...props, row });
    }

    displayCellFor(
      field: MetaUiField,
      row: any,
      context: UiContext,
      props: TableCellProps = {},
    ): VNode | VNode[] {
      return this.resolveTableColumnBody(field, row, context, props);
    }

    listViewParts<T>(context: UiContext, props: VuiListViewPropsType<T> = {}) {
      const runtime = context as any;
      const searchbar =
        props.showSearchbar === false
          ? null
          : this.buildModuleSearchbar(context, {
              onSearch: (text: string) => {
                runtime.searchParam.searchWord = text;
                runtime.rememberLastQuery?.();
                props.onSearch?.(text);
                if (!props.onSearch) void runtime.search?.();
              },
              onRefresh: () => {
                if (props.onRefresh) props.onRefresh();
                else void runtime.search?.();
              },
            });
      const toolbar =
        props.showToolbar === false
          ? null
          : (props.toolbar?.() ??
            this.buildIndexTopbar(
              context,
              {
                showBreadcrumb: props.showBreadcrumb ?? true,
                showActions: props.showActions ?? true,
                showSearchBar: props.showSearchbar ?? true,
                layout: props.topbarLayout ?? "full",
                onSearchPage: () =>
                  void this.buildSearchView(context, {
                    onSearch: (text: string) => {
                      runtime.searchParam.searchWord = text;
                      runtime.rememberLastQuery?.();
                      props.onSearch?.(text);
                      if (!props.onSearch) void runtime.search?.();
                    },
                    onRefresh: () => {
                      if (props.onRefresh) props.onRefresh();
                      else void runtime.search?.();
                    },
                  }),
              },
              {
                center: () => (searchbar ? [searchbar] : []),
              },
            ));
      const onPage = (pager: { pageNo?: number; pageSize?: number }) => {
        const cur = runtime.searchParam.pager;
        if (pager.pageNo === cur.pageNo && pager.pageSize === cur.pageSize) {
          return;
        }
        if (
          pager.pageSize != null &&
          pager.pageSize > 0 &&
          pager.pageSize !== cur.pageSize
        ) {
          writeStoredPageSize(pager.pageSize);
        }
        Object.assign(cur, pager);
        return runtime.search?.();
      };
      const display =
        props.display ?? (props.editable === true ? "grid" : "table");
      const rowProps = {
        ...props,
        display,
        onPage,
      };
      const list =
        props.content?.() ??
        (display === "list"
          ? this.buildList(context, rowProps)
          : display === "treeGrid"
            ? this.buildTreeGrid(
                listRows(runtime.model) as any[],
                indexTableMetaUi(context as any),
                () => context,
                rowProps,
              )
            : display === "grid"
              ? this.buildGrid(context, rowProps)
              : this.buildTable(context, rowProps));
      return { runtime, toolbar, searchbar, list, paginator: null };
    }

    buildListView<T = any>(
      context: UiContext,
      props: VuiListViewPropsType<T> = {},
    ): VNode {
      const { runtime, toolbar, searchbar, list, paginator } =
        this.listViewParts(context, props);
      return this.layout.layoutIndexPage({
        toolbar:
          toolbar ??
          (!toolbar && searchbar ? searchbar : undefined) ??
          undefined,
        filterBar: this.buildFilterBar(runtime),
        default: list,
        footer: paginator ?? undefined,
      });
    }

    buildTreeListView<T = any>(
      context: UiContext,
      props: VuiTreeListViewPropsType<T> = {},
    ): VNode {
      const { treeOption, listOption } = resolveTreeListOptions(props);
      const treeSpec =
        typeof treeOption === "function" ? treeOption() : treeOption;
      if (!treeSpec) return this.buildListView(context, listOption);
      return h(TreeListView, {
        builder: this,
        context,
        spec: props,
      });
    }

    buildCustomView<T = any>(
      context: UiContext,
      props: VuiListViewPropsType<T> = {},
    ): VNode {
      return this.layout.layoutPage({
        toolbar: props.header?.() ?? undefined,
        primary: props.content?.() ?? this.buildList(context, props),
        footer: props.footer?.() ?? undefined,
      });
    }

    buildList<T = any>(
      context: UiContext,
      props: VuiListPropsType<T> = {},
    ): VNode {
      const metaUi = indexTableMetaUi(context as any);
      return this.factory.list({
        ...props,
        rows: listRows(context.model),
        primaryKey: props.primaryKey ?? metaUi.primaryKey,
        display: props.display ?? "list",
      });
    }

    buildTable<T = any>(
      context: UiContext,
      props: VuiListPropsType<T> = {},
    ): VNode {
      return this.buildRows(context, {
        ...props,
        display: props.display ?? "table",
      });
    }

    buildGrid<T = any>(
      context: UiContext,
      props: VuiListPropsType<T> = {},
    ): VNode {
      return this.buildRows(context, {
        ...props,
        display: props.display ?? "grid",
      });
    }

    buildRows<T = any>(
      context: UiContext,
      props: VuiListPropsType<T> = {},
    ): VNode {
      return h(IndexTableView, {
        builder: this,
        context,
        spec: props,
      });
    }

    buildIndexTable<T = any>(
      context: UiContext,
      props: VuiListPropsType<T> = {},
    ): VNode {
      const runtime = context as any;
      return this.tableWithCells(
        listRows(context.model),
        indexTableMetaUi(context as any),
        () => context,
        {
          filterDisplay: props.filterDisplay ?? "menu",
          ...props,
          pagination: props.pagination ?? runtime.searchParam?.pager,
          joinListMode: Boolean((context as any).joinListMode),
          filterLabels: {
            all: context.translate("state.all"),
            yes: context.translate("boolean.yes"),
            no: context.translate("boolean.no"),
            apply: context.translate("action.apply"),
            clear: context.translate("action.clear"),
            values: context.translate("filter.values"),
            date: context.translate("filter.date"),
            datetime: context.translate("filter.datetime"),
            ...props.filterLabels,
          },
          filterModel: runtime.searchParam?.filterModel,
          filterModelOf: () => runtime.searchParam?.filterModel,
          loadFilterOptions: (field) => runtime.loadReferenceOptions(field),
          loadPivotDates: (field) =>
            runtime.logic?.getPivotDates?.(field.fieldName),
          dateRangeLabels: {
            TODAY: context.translate("dateRange.TODAY"),
            YESTERDAY: context.translate("dateRange.YESTERDAY"),
            TOMORROW: context.translate("dateRange.TOMORROW"),
            THIS_WEEK: context.translate("dateRange.THIS_WEEK"),
            LAST_WEEK: context.translate("dateRange.LAST_WEEK"),
            NEXT_WEEK: context.translate("dateRange.NEXT_WEEK"),
            LAST_7_DAYS: context.translate("dateRange.LAST_7_DAYS"),
            THIS_MONTH: context.translate("dateRange.THIS_MONTH"),
            LAST_MONTH: context.translate("dateRange.LAST_MONTH"),
            NEXT_MONTH: context.translate("dateRange.NEXT_MONTH"),
            LAST_30_DAYS: context.translate("dateRange.LAST_30_DAYS"),
            LAST_90_DAYS: context.translate("dateRange.LAST_90_DAYS"),
            THIS_QUARTER: context.translate("dateRange.THIS_QUARTER"),
            LAST_QUARTER: context.translate("dateRange.LAST_QUARTER"),
            THIS_YEAR: context.translate("dateRange.THIS_YEAR"),
            LAST_YEAR: context.translate("dateRange.LAST_YEAR"),
            month: context.translate("dateRange.month"),
            ...props.dateRangeLabels,
          },
          searchRelative: async (field, searchWord) => {
            const options = runtime.getFieldSearchOptions(field);
            options.searchParam.pager.pageNo = 1;
            options.searchParam.pager.pageSize = CHOICE_PAGE_SIZE;
            await runtime.searchRelative(field, searchWord);
            return options.selectOptions;
          },
          onFilterModelChange: (filterModel) => {
            writeListFilterModel(runtime.searchParam, filterModel);
            delete runtime.searchParam.queryID;
            delete runtime.searchParam.queryName;
            runtime.rememberLastQuery?.();
            if (props.onFilterModelChange) {
              return props.onFilterModelChange(filterModel);
            }
            return runtime.search?.();
          },
          onSort: (sorts) => {
            writeListSorts(runtime.searchParam, sorts);
            runtime.rememberLastQuery?.();
            if (props.onSort) return props.onSort(sorts);
            return runtime.search?.();
          },
          tableSettings: {
            persist: () => schedulePersistListPack(runtime),
            rev: runtime.listLayoutRev,
            open: () => void this.openTableSettings(context),
          },
          onLayoutChange: (columns) => {
            if (runtime.metaUi) {
              applyTableColumnSettings(runtime.metaUi, columns);
            }
          },
          onIndexTableHostReady: (host) => {
            runtime.indexTableHost = host ?? undefined;
          },
          onSelect: (selection) => {
            context.selectedItems = selection;
            props.onSelect?.(selection);
          },
          selectedItems: runtime.selectedItems ?? [],
          showActions: props.showActions === true,
          showActionColumn:
            props.showActionColumn ?? readStoredShowActionsColumn(),
          rowActions:
            props.rowActions ??
            this.createListRowActions(context, props.showActions === true),
        },
      );
    }

    /** 列表行操作工厂：图标只解析一次，禁止 with(row)。 */
    createListRowActions(
      context: UiContext,
      includeExtras = false,
    ): (row: any) => UiAction[] {
      const icons = {
        edit: this.factory.resolveIcon("edit"),
        delete: this.factory.resolveIcon("delete"),
        details: this.factory.resolveIcon("details"),
      };
      return (row) => this.listRowActions(context, row, icons, includeExtras);
    }

    /** 子表行删：可点看 itemDeletableFunc 与 row.deletable；确认后走 beforeItemRemove。 */
    subGroupRowActions(
      context: UiContext,
      group: MetaUiGroup,
      row: any,
    ): UiAction[] {
      const runtime = context as VuiContext;
      return [
        {
          name: "delete",
          label: context.t("action.delete"),
          icon: this.factory.resolveIcon("delete"),
          canDo: () => runtime.isSubGroupItemDeletable(group, row) !== false,
          onAction: async () => {
            if (runtime.isSubGroupItemDeletable(group, row) === false) return;
            const result = await this.confirm(context, {
              message:
                runtime.translate?.("confirmation.delete", {
                  it: runtime.getModelTitle?.(row) ?? row?.id,
                }) ?? "Delete this item?",
            });
            if (!result) return;
            await runtime.removeSubGroupItem(group, row);
          },
        },
      ];
    }

    /** 列表行操作：编辑、删除、详情；扩展 actions 置于分隔线后。
     * 禁止 with(row)：索引页千行时不能为每行建 rowContext。
     */
    listRowActions(
      context: UiContext,
      row: any,
      icons?: { edit: string; delete: string; details: string },
      includeExtras = false,
    ): UiAction[] {
      const runtime = context as any;
      const entityAuth = runtime.getModuleAuth?.(row);
      const rowId =
        row?.id ??
        (context.metaUi?.primaryKey
          ? row?.[context.metaUi.primaryKey]
          : undefined);
      const resolved = icons ?? {
        edit: this.factory.resolveIcon("edit"),
        delete: this.factory.resolveIcon("delete"),
        details: this.factory.resolveIcon("details"),
      };
      const items: UiAction[] = [];

      if (entityAuth ? entityAuth.allowEdit : row?.editable !== false) {
        items.push({
          name: "edit",
          label: context.t("action.edit"),
          icon: resolved.edit,
          onAction: () => runtime.edit?.(row),
        });
      }
      if (entityAuth ? entityAuth.allowDelete : row?.deletable !== false) {
        items.push({
          name: "delete",
          label: context.t("action.delete"),
          icon: resolved.delete,
          onAction: async () => {
            const result = await this.confirm(context, {
              message:
                runtime.translate?.("confirmation.delete", {
                  it: runtime.getModelTitle?.(row) ?? rowId,
                }) ?? "Delete this item?",
            });
            if (!result) return;
            if (runtime.logic?.beforeDelete) {
              const ok = await runtime.logic.beforeDelete(runtime, row);
              if (ok === false) return false;
            }
            const deleted = await runtime.logic?.delete?.(rowId);
            await runtime.logic?.afterDelete?.(
              runtime,
              row,
              undefined,
              deleted,
            );
            return runtime.reload?.();
          },
        });
      }
      if (!entityAuth || entityAuth.allowRead) {
        items.push({
          name: "details",
          label: context.t("action.details"),
          icon: resolved.details,
          onAction: () => runtime.details?.(row),
        });
      }

      const extra =
        includeExtras && Array.isArray(row?.actions) ? row.actions : [];
      if (extra.length) {
        items.push(UiActionDivider());
        items.push(
          ...extra.map((action: EntityAction) => ({
            name: action.name,
            label: action.label
              ? context.t(action.label)
              : context.t(`action.${action.name}`),
            icon: this.factory.resolveIcon(action.icon ?? action.name),
            onAction: () => runtime.logic?.doAction?.(row, action),
          })),
        );
      }
      return items;
    }

    buildColumns<T = any>(
      metaUi: MetaUi,
      context: UiContext,
      props: VuiListPropsType<T> = {},
    ): VNode[] {
      return metaUi
        .getListedFields()
        .map((field) =>
          h(
            "span",
            { key: field.fieldName },
            props.fieldCellRenderers?.[field.fieldName]
              ? props.fieldCellRenderers[field.fieldName](
                  field,
                  context.model as T,
                )
              : field.displayLabel,
          ),
        );
    }

    buildPaginator(
      context: UiContext,
      props: Partial<UiPaginatorProps> = {},
    ): VNode {
      const runtime = context as any;
      const pager = runtime.searchParam?.pager ?? {};
      const pagination = {
        pageNo: pager.pageNo ?? 1,
        pageSize: pager.pageSize ?? readStoredPageSize(),
        recordCount: pager.recordCount ?? listRows(runtime.model).length,
        ...pager,
      };
      const paginatorProps: UiPaginatorProps = {
        ...props,
        pagination,
        onPage: () => undefined,
      };
      return this.factory.paginator(paginatorProps);
    }
  }
  return ListBuilder;
}

function resolveTreeListOptions<T>(props: VuiTreeListViewPropsType<T>): {
  treeOption: UiTreeViewProps<T> | (() => UiTreeViewProps<T>) | undefined
  listOption: VuiListViewPropsType<T>
} {
  const treeOption =
    props.treeOption ?? (props as { tree?: typeof props.treeOption }).tree;
  const extras = props as VuiTreeListViewPropsType<T> & {
    showToolbar?: boolean;
    showSearchbar?: boolean;
    showBreadcrumb?: boolean;
    showActions?: boolean;
    selectionMode?: unknown;
    loading?: unknown;
    onItemDoubleClick?: unknown;
  };
  const listOption = {
    ...(props.listOption ?? {}),
    showToolbar: props.listOption?.showToolbar ?? extras.showToolbar,
    showSearchbar: props.listOption?.showSearchbar ?? extras.showSearchbar,
    showBreadcrumb: props.listOption?.showBreadcrumb ?? extras.showBreadcrumb,
    showActions: props.listOption?.showActions ?? extras.showActions,
    selectionMode: props.listOption?.selectionMode ?? extras.selectionMode,
    loading: props.listOption?.loading ?? extras.loading,
    onItemDoubleClick:
      props.listOption?.onItemDoubleClick ?? extras.onItemDoubleClick,
  } as VuiListViewPropsType<T>;
  return { treeOption, listOption };
}

function treeListQuery(context: UiContext) {
  const runtime = context as UiContext & {
    getQueryParam?: () => Record<string, unknown>;
    searchParam: { queryParams?: Record<string, unknown> };
  };
  return (
    runtime.getQueryParam?.() ??
    ((runtime.searchParam.queryParams ??= {}) as Record<string, unknown>)
  );
}

function selectedCategoryNode<T>(
  spec: UiTreeViewProps<T> | undefined,
  context: UiContext,
): T | undefined {
  if (spec?.selectedNode) return spec.selectedNode;
  return (context as { logic?: { currentCategory?: T } }).logic
    ?.currentCategory;
}

function hasRightSearch(context: UiContext) {
  const param = context.searchParam;
  if (String(param?.searchWord ?? "").trim()) return true;
  if (param?.filterModel && Object.keys(param.filterModel).length > 0) {
    return true;
  }
  const filters = (context as any).filters as
    | { selectedConditions?: { value?: unknown[] } }[]
    | undefined;
  if (filters?.some((filter) => (filter.selectedConditions?.value?.length ?? 0) > 0)) {
    return true;
  }
  const searchFields = (context as any).searchFields as
    | { searchVal?: { value?: unknown } }[]
    | undefined;
  if (searchFields?.some((field) => {
    const value = field.searchVal?.value;
    return value != null && value !== "";
  })) {
    return true;
  }
  const customSearchFields = (context as any).customSearchFields as
    | { hasVal?: boolean }[]
    | undefined;
  return Boolean(customSearchFields?.some((field) => field.hasVal));
}

/** 有 host 就保住 Grid；没有则每次重画（其它皮肤）。 */
const IndexTableLive = defineComponent({
  name: "IndexTableLive",
  props: {
    builder: { type: Object, required: true },
    context: { type: Object as PropType<UiContext>, required: true },
    spec: { type: Object, default: () => ({}) },
  },
  setup(props) {
    let table: VNode | undefined;
    return () => {
      const context = props.context as UiContext & {
        indexTableHost?: { rebind?: () => void };
      };
      if (table && context.indexTableHost) return table;
      table = (props.builder as VuiBuilder).buildIndexTable(
        context,
        props.spec ?? {},
      );
      return table;
    };
  },
});

/** 有 host 只听列布局；无 host 仍听 list / 分页。 */
const IndexTableView = defineComponent({
  name: "IndexTableView",
  props: {
    builder: { type: Object, required: true },
    context: { type: Object as PropType<UiContext>, required: true },
    spec: { type: Object, default: () => ({}) },
  },
  setup(props) {
    return () => {
      const context = props.context as UiContext & {
        listLayoutRev?: { value: number };
        indexTableHost?: { rebind?: () => void };
      };
      const layoutRev = context.listLayoutRev?.value ?? 0;
      void layoutRev;
      if (!context.indexTableHost) {
        const rows = listRows(context.model);
        void rows.length;
        const pager = context.searchParam?.pager as
          | { recordCount?: number; pageNo?: number; pageSize?: number }
          | undefined;
        if (pager) {
          void pager.recordCount;
          void pager.pageNo;
          void pager.pageSize;
        }
      }
      return h(IndexTableLive, {
        key: layoutRev,
        builder: props.builder,
        context,
        spec: props.spec ?? {},
      });
    };
  },
});

const TreeListTreePane = defineComponent({
  name: "TreeListTreePane",
  props: {
    builder: { type: Object, required: true },
    context: { type: Object as PropType<UiContext>, required: true },
    spec: { type: Object as PropType<VuiTreeListViewPropsType>, required: true },
    reloadTick: { type: Object, required: true },
    onPicked: { type: Function, required: true },
  },
  setup(props) {
    return () => {
      const self = props.builder as VuiBuilder;
      const viewProps = props.spec;
      const { treeOption } = resolveTreeListOptions(viewProps);
      const spec = typeof treeOption === "function" ? treeOption() : treeOption;
      return h(
        "aside",
        { class: "mmda-tree-list-aside" },
        self.buildTreeView(props.context, {
          ...spec!,
          reloadTick: props.reloadTick as { value: number },
          showSearchBar:
            spec!.showSearchBar ?? viewProps.showTreeSearchBar ?? true,
          showTreeFooter: spec!.showTreeFooter ?? true,
          onNodeSelect: (node: unknown) => {
            spec!.onNodeSelect?.(node);
            props.onPicked(node);
          },
        }),
      );
    };
  },
});

const TreeListView = defineComponent({
  name: "TreeListView",
  props: {
    builder: { type: Object, required: true },
    context: { type: Object as PropType<UiContext>, required: true },
    spec: { type: Object as PropType<VuiTreeListViewPropsType>, required: true },
  },
  setup(props: any) {
    const reloadTick = ref(0);
    const pickedLabel = ref("");

    const runtimeOf = () =>
      props.context as UiContext & {
        search?: (param?: unknown, options?: unknown) => Promise<unknown>;
        searchParam: { pager?: { pageNo?: number } };
      };

    const latestSpec = () => {
      const { treeOption } = resolveTreeListOptions(props.spec);
      return typeof treeOption === "function" ? treeOption() : treeOption;
    };

    const applyForeignKey = (scoped: boolean, node?: unknown) => {
      const foreignKey = props.spec.foreignKey;
      if (!foreignKey) return;
      const query = treeListQuery(props.context);
      if (!scoped) {
        delete query[foreignKey];
        return;
      }
      const spec = latestSpec();
      const picked = node ?? selectedCategoryNode(spec, props.context);
      const id = picked != null ? treeIdOf(picked, spec?.fields) : "";
      if (id) query[foreignKey] = id;
      else delete query[foreignKey];
    };

    const runtime = runtimeOf();
    const origSearch = runtime.search?.bind(runtime);
    if (origSearch) {
      runtime.search = (param?: unknown, options?: unknown) => {
        if (hasRightSearch(props.context)) applyForeignKey(false);
        return origSearch(param, options);
      };
    }
    onUnmounted(() => {
      runtime.search = origSearch;
    });

    const onPicked = (node: unknown) => {
      const spec = latestSpec();
      const picked = Array.isArray(node) ? node[0] : node;
      if (picked != null) {
        pickedLabel.value = treeLabelOf(picked, spec?.fields);
      }
      if (!props.spec.foreignKey || picked == null) return;
      props.context.clearFilters();
      applyForeignKey(true, picked);
      const runtimeCtx = runtimeOf();
      if (runtimeCtx.searchParam.pager) {
        runtimeCtx.searchParam.pager.pageNo = 1;
      }
      void runtimeCtx.search?.();
    };

    return () => {
      const self = props.builder as VuiBuilder;
      const context = props.context;
      const rows = listRows(context.model);
      void rows.length;
      const pager = context.searchParam?.pager as
        { recordCount?: number } | undefined;
      if (pager) void pager.recordCount;
      const viewProps = props.spec;
      const { listOption } = resolveTreeListOptions(viewProps);
      const { runtime, searchbar, list, paginator } = (
        self as unknown as {
          listViewParts: VuiBuilder["listViewParts"];
        }
      ).listViewParts(context, {
        ...listOption,
        showToolbar: false,
      } as any);
      const treeWidth =
        typeof viewProps.treeWidth === "number"
          ? `${viewProps.treeWidth}px`
          : (viewProps.treeWidth ?? "16rem");
      const toolbar =
        listOption.showToolbar === false
          ? null
          : self.buildIndexTopbar(
              context,
              {
                showBreadcrumb: listOption.showBreadcrumb ?? true,
                showActions: listOption.showActions ?? true,
                showSearchBar: listOption.showSearchbar ?? true,
                layout: listOption.topbarLayout ?? "full",
                breadcrumbLeaf:
                  pickedLabel.value || selectedTreeLabel(latestSpec()),
                onSearchPage: () =>
                  void self.buildSearchView(context, {
                    onSearch: (text: string) => {
                      (context as any).searchParam.searchWord = text;
                      (context as any).rememberLastQuery?.();
                      void (context as any).search?.();
                    },
                    onRefresh: () => void (context as any).search?.(),
                  }),
              },
              {
                center: () => (searchbar ? [searchbar] : []),
              },
            );
      const body = self.factory.splitter(
        {
          orientation: "Horizontal",
          class: "mmda-tree-list-splitter",
          separatorSize: 8,
        },
        {
          default: () => [
            {
              content: h(TreeListTreePane, {
                builder: self,
                context,
                spec: viewProps,
                reloadTick,
                onPicked,
              }),
              size: treeWidth,
              min: "12rem",
              collapsible: true,
              cssClass: "mmda-tree-list-tree-pane",
            },
            {
              content: h(
                "div",
                {
                  class: "mmda-tree-list-table-pane",
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    minWidth: 0,
                    minHeight: 0,
                    overflow: "hidden",
                  },
                },
                [
                  self.buildFilterBar(context),
                  h(
                    "main",
                    {
                      class: uiCssClass("page", "body"),
                      style: {
                        flex: "1 1 auto",
                        minWidth: 0,
                        minHeight: 0,
                        overflow: "hidden",
                      },
                    },
                    list,
                  ),
                ],
              ),
              min: "16rem",
            },
          ],
        },
      );
      return h(
        "section",
        {
          class: "mmda-list-view mmda-tree-list-view",
          role: runtime.view,
          style: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
          },
        },
        [
          toolbar ? h("header", toolbar) : null,
          !toolbar && searchbar ? h("header", searchbar) : null,
          body,
          paginator ? h("footer", paginator) : null,
        ].filter(Boolean) as VNode[],
      );
    };
  },
} as any);

function selectedTreeLabel<T>(spec?: UiTreeViewProps<T>): string {
  if (!spec) return "";
  if (spec.selectedNode) return treeLabelOf(spec.selectedNode, spec.fields);
  return "";
}

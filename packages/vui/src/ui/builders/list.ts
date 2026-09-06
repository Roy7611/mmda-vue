// @ts-nocheck
import {
  defineComponent,
  h,
  onUnmounted,
  ref,
  type PropType,
  type VNode,
} from "vue";
import {
  MetaModel,
  SqlDataType,
  auth,
  type EntityAction,
  type MetaUi,
  type MetaUiField,
  type MetaUiGroup,
} from "@mmda/core";
import { readStoredPageSize, writeStoredPageSize } from "../ui_theme";
import { schedulePersistListPack } from "../list_layout";
import { cleanTableCellProps } from "../ui_factory";
import type { PropData } from "../ui_layout";
import type {
  UiListPropsType,
  UiListViewPropsType,
  UiPaginatorPropsType,
} from "../ui_list";
import { writeListFilterModel, writeListSorts } from "../ui_list_query";
import type {
  UiTreeGridPropsType,
  UiTreeGridViewPropsType,
} from "../ui_tree_grid";
import { treeDataProvider, treeIdField } from "../ui_tree_data";
import type { UiTreeListViewPropsType } from "../ui_treelist";
import {
  treeIdOf,
  treeLabelOf,
  type UiTreeViewPropsType,
} from "../ui_tree";
import { UiActionDivider, type UiAction } from "../ui_action";
import { UiViewContext } from "../ui_context";
import type { VueUiBuilderHost } from "../ui_builder";
import type { UiContext } from "./helpers";

type Host = VueUiBuilderHost;

export function attachListBuilder(ctor: { prototype: Host }) {
  Object.assign(ctor.prototype, {
    tableWithCells(
      rows: any[],
      metaui: MetaUi,
      rowContext: (row: any) => UiContext,
      tableProps: UiListPropsType<any> = {},
    ): VNode {
      const customRenderCell = tableProps.renderCell;
      const cellProps = cleanTableCellProps({
        tableMetaui: metaui,
        ...(tableProps as PropData),
      });
      if ((tableProps as PropData).readOnlyRows !== undefined) {
        Object.defineProperty(cellProps, "readOnlyRows", {
          value: (tableProps as PropData).readOnlyRows,
          enumerable: false,
        });
      }
      if ((tableProps as PropData).inplaceEdit !== undefined) {
        Object.defineProperty(cellProps, "inplaceEdit", {
          value: (tableProps as PropData).inplaceEdit,
          enumerable: false,
        });
      }
    
      // 用同一份 list context 探测哪些列真正需要 Vue 单元格（自定义 / 链接 / 非纯文本）。
      // 索引页 rowContext 恒为 () => context，不可在这里对每行 with(row)。
      const probeContext = rowContext(rows[0] ?? {});
      const listedRaw =
        typeof (metaui as any).getListedFields === "function"
          ? (metaui as any).getListedFields()
          : (metaui as any).listedFields;
      const listed: MetaUiField[] = Array.isArray(listedRaw) ? listedRaw : [];
      const templateCellFields =
        tableProps.templateCellFields ??
        listed
          .filter((field: MetaUiField) => {
            if (tableProps.customCellRenderers?.[field.fieldName]) return true;
            if (field.linkable) return true;
            const logic = probeContext.getFieldLogic?.(field) as any;
            if (logic?.customCellRenderer || logic?.customRenderer) return true;
            const display = this.fieldDisplayName(field);
            return display !== "textSpan";
          })
          .map((field: MetaUiField) => field.fieldName);
    
      return this.factory.table(rows, metaui, {
        ...tableProps,
        templateCellFields,
        renderCell: (field, row) => {
          if (customRenderCell) return customRenderCell(field, row);
          if (
            Array.isArray(templateCellFields) &&
            !templateCellFields.includes(field.fieldName)
          ) {
            return undefined as any;
          }
          return this.displayCellFor(field, row, rowContext(row), cellProps);
        },
      });
    },
    
    buildTreeGrid<T = any>(
      rows: T[],
      metaui: MetaUi,
      rowContext: (row: T) => UiContext,
      props: UiTreeGridPropsType<T> = {},
    ): VNode {
      const customRenderCell = props.renderCell;
      const cellProps = cleanTableCellProps({
        tableMetaui: metaui,
        isTree: true,
        ...(props as PropData),
      });
      if ((props as PropData).readOnlyRows !== undefined) {
        Object.defineProperty(cellProps, "readOnlyRows", {
          value: (props as PropData).readOnlyRows,
          enumerable: false,
        });
      }
      if ((props as PropData).inplaceEdit !== undefined) {
        Object.defineProperty(cellProps, "inplaceEdit", {
          value: (props as PropData).inplaceEdit,
          enumerable: false,
        });
      }
      return this.factory.treeGrid(rows, metaui, {
        ...props,
        isTree: true,
        renderCell: (field, row) =>
          customRenderCell?.(field, row) ??
          this.displayCellFor(field, row, rowContext(row), cellProps),
      });
    },
    
    buildTreeGridView<T = any>(
      context: UiContext,
      props: UiTreeGridViewPropsType<T> = {},
    ): VNode {
      const runtime = context as any;
      const model = context.model as any;
      const rows = (Array.isArray(model?.list) ? model.list : model) ?? [];
      const treeShape = props.treeShape ?? "TREE";
      const shapeKey = props.shapeKey ?? "";
      const loadMode = props.loadMode ?? "lazy";
      const idField =
        props.idField ??
        treeIdField(treeShape, shapeKey, context.metaui?.primaryKey);
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
      const treeGrid = this.buildTreeGrid(rows, context.metaui, () => context, {
        ...props,
        treeShape,
        shapeKey,
        idField,
        parentIdField:
          props.parentIdField ?? (treeShape === "TREE" ? shapeKey : undefined),
        loadMode,
        onExpand,
        filterDisplay:
          props.filterDisplay ?? this.factory.defaultFilterDisplay ?? "none",
        loading: props.loading ?? runtime.loading,
        selectedItems: runtime.selectedItems ?? [],
        onSelect: (selection) => {
          context.selectedItems = selection;
          props.onSelect?.(selection);
        },
      });
      const { toolbar, searchbar } = this.listViewParts(context, {
        ...props,
        content: () => treeGrid,
      });
      return this.buildContainer(
        [
          toolbar ? this.buildHeader(toolbar) : null,
          !toolbar && searchbar ? this.buildHeader(searchbar) : null,
          this.buildMain(treeGrid, {
            class: "mmda-list-scroll",
            style: { flex: "1 1 auto", minHeight: 0, overflow: "auto" },
          }),
        ].filter(Boolean) as VNode[],
        {
          class: "mmda-tree-grid-view",
          role: runtime.view,
          style: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
          },
        },
      );
    },
    
    async loadTreeGridChildren<T>(
      context: UiContext,
      parent: T,
      spec: { treeShape: string; shapeKey: string; idField: string },
    ): Promise<T[]> {
      const runtime = context as any;
      const parentId = String((parent as any)?.[spec.idField] ?? (parent as any)?.id ?? "");
      const queryParams =
        spec.treeShape === "HIERARCHY"
          ? { [spec.shapeKey]: parentId }
          : { [spec.shapeKey]: parentId };
      const data = await runtime.logic?.getAll?.({
        pager: { pageNo: 1, pageSize: 1000 },
        queryParams,
      });
      return (data?.list ?? []) as T[];
    },
    
    /** 对齐旧版 `_tableColumnWidth` */
    tableColumnWidth(field: MetaUiField): number {
      if (field.listSize && field.listSize > 0) {
        return Math.min(field.listSize, 400);
      }
      if (SqlDataType.isBool(field.dataType)) {
        return Math.max(field.displayLabel.length * 15, 70);
      }
      if (field.reference) {
        return field.reference.isEnum ? 120 : 150;
      }
      return 200;
    },
    
    /** 对齐旧版 `_tableCell`；cellProps 应在列/表级预先 cleanTableCellProps，勿在此处逐格清理 */
    tableCell(
      field: MetaUiField,
      ctx: UiContext,
      inPlaceEdit = false,
      props: PropData = {},
    ): VNode {
      const cellProps = { ...props } as PropData;
      if (props.row !== undefined) {
        Object.defineProperty(cellProps, "row", {
          value: props.row,
          enumerable: false,
        });
      }
      if (!field.renderer || this.fldFactory["textSpan"]) {
        cellProps.class =
          `${cellProps.class ? cellProps.class : ""} two-line-ellipsis`.trim();
      }
    
      const isLock = ctx.isFieldReadonly(field) || ctx.isFieldHidden(field);
      const fieldLogic = ctx.getFieldLogic(field) as any;
      const model = (props.row ?? ctx.model) as { editable?: boolean };
    
      if (inPlaceEdit && model?.editable !== false && !isLock) {
        const editor =
          fieldLogic?.customCellEditor ??
          fieldLogic?.customEditor ??
          this.fldFactory[field.editor ?? "textInput"] ??
          this.fldFactory.fallbackInput;
        return editor(field, ctx, {
          showWordLimit: false,
          width: `${this.tableColumnWidth(field)}px`,
          // 表格布尔格不要带字段标签（「读取」「创建」）
          ...(SqlDataType.isBool(field.dataType) ? { label: "" } : {}),
        });
      }
    
      const renderer =
        fieldLogic?.customCellRenderer ??
        this.fldFactory[this.fieldDisplayName(field)] ??
        this.fldFactory.fallbackDisplay;
      return renderer(field, ctx, cellProps);
    },
    
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
      rowContext.getFieldValue = (field, model = row) =>
        context.getFieldValue(field, model);
      rowContext.displayField = (field, model = row) =>
        context.displayField(field, model);
      rowContext.routeToRelative = (field) =>
        context.routeToRelative?.(field, row) ?? "";
      return rowContext;
    },
    
    /** 对齐旧版 `_tableCellWithError` */
    tableCellWithError(
      field: MetaUiField,
      ctx: UiContext,
      inPlaceEdit = false,
      props: PropData = {},
    ): VNode | VNode[] {
      const cellError = (
        ctx as { getFieldError?: (field: MetaUiField | string) => string }
      ).getFieldError?.(field);
      const cell = this.tableCell(field, ctx, inPlaceEdit, props);
      if (!cellError) return cell;
      return [
        cell,
        this.factory.icon("pi pi-exclamation-circle", {
          class: "error",
          title: cellError,
        }),
      ];
    },
    
    /** 对齐旧版 `_tableColumn` body 分支 */
    resolveTableColumnBody(
      field: MetaUiField,
      row: any,
      context: UiContext,
      props: PropData = {},
    ): VNode | VNode[] {
      const fieldLogic = context.getFieldLogic(field) as any;
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
        const rowContext = readOnlyRoot
          ? this.readonlyRowContext(context, row)
          : context.model === row
            ? context
            : context.with(row, props?.cacheKey ?? undefined);
        const rendererProps = { ...props };
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
          !props?.inplaceEdit &&
          cellEditable &&
          !context.isFieldReadonly(field));
    
      if (useLink && !isSearch) {
        const { tableMetaui } = props;
        const isCrossModule =
          !(context as { module?: unknown }).module ||
          context.metaui?.objName !== tableMetaui?.objName;
    
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
              const router = context.globalProps?.$router;
              const route = router?.resolve({
                name: tableMetaui.objName,
                params: { id: entityId },
              });
              if (route?.href) window.open(route.href, "_blank");
            } else if (typeof (context as any).details === "function") {
              (context as any).details(row);
            }
          },
        });
      }
    
      if (readOnlyRoot) {
        return this.tableCell(field, context, false, { ...props, row });
      }
    
      if (isRoot) {
        return this.tableCell(
          field,
          context.with(row, props?.cacheKey ?? undefined),
          useEditor,
          props,
        );
      }
    
      // 行上下文已由上层 rowContext(row) 提供；仅在 model 不是当前行时再 with。
      const rowCtx =
        context.model === row
          ? context
          : context.with(row, props?.cacheKey ?? undefined);
    
      return this.tableCellWithError(field, rowCtx, useEditor, props);
    },

    displayCellFor(
      field: MetaUiField,
      row: any,
      context: UiContext,
      props: PropData = {},
    ): VNode | VNode[] {
      return this.resolveTableColumnBody(field, row, context, props);
    },
    
    listViewParts<T>(
      context: UiContext,
      props: UiListViewPropsType<T> = {},
    ) {
      const runtime = context as any;
      const searchbar =
        props.showSearchbar === false
          ? null
          : this.buildModuleSearchbar(context, {
              onSearch: (text) => {
                runtime.searchParam.searchWord = text;
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
            this.buildModuleToolbar(
              context,
              {
                showBreadcrumb: props.showBreadcrumb ?? true,
                showActions: props.showActions ?? true,
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
      const integratedPaging = this.factory.integratedTablePaging === true;
      const list =
        props.content?.() ??
        this.buildTable(context, {
          ...props,
          ...(integratedPaging
            ? {
                pagination: runtime.model?.pagination,
                onPage,
              }
            : {}),
        });
      const paginator = integratedPaging
        ? null
        : this.buildPaginator(context, { onPage });
      return { runtime, toolbar, searchbar, list, paginator };
    },
    
    buildListView<T = any>(
      context: UiContext,
      props: UiListViewPropsType<T> = {},
    ): VNode {
      const { runtime, toolbar, searchbar, list, paginator } =
        this.listViewParts(context, props);
      return this.buildContainer(
        [
          toolbar ? this.buildHeader(toolbar) : null,
          !toolbar && searchbar ? this.buildHeader(searchbar) : null,
          this.buildMain(list, {
            class: "mmda-list-scroll",
            style: { flex: "1 1 auto", minHeight: 0, overflow: "auto" },
          }),
          paginator ? this.buildFooter(paginator) : null,
        ].filter(Boolean) as VNode[],
        {
          class: "mmda-list-view",
          role: runtime.view,
          style: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            overflow: "hidden",
          },
        },
      );
    },
    
    buildTreeListView<T = any>(
      context: UiContext,
      props: UiTreeListViewPropsType<T> = {},
    ): VNode {
      const { treeOption, listOption } = resolveTreeListOptions(props);
      const treeSpec = typeof treeOption === "function" ? treeOption() : treeOption;
      if (!treeSpec) return this.buildListView(context, listOption);
      return h(MmdaTreeListView, {
        builder: this,
        context,
        spec: props,
      });
    },
    
    buildCustomView<T = any>(
      context: UiContext,
      props: UiListViewPropsType<T> = {},
    ): VNode {
      return this.buildContainer(
        [
          props.header ? this.buildHeader(props.header()) : null,
          this.buildMain(props.content?.() ?? this.buildList(context, props)),
          props.footer ? this.buildFooter(props.footer()) : null,
        ].filter(Boolean) as VNode[],
        { class: "mmda-custom-view" },
      );
    },
    
    buildList<T = any>(
      context: UiContext,
      props: UiListPropsType<T> = {},
    ): VNode {
      const model = context.model as any;
      return this.factory.list(model.list ?? model ?? [], context.metaui, props);
    },
    
    buildTable<T = any>(
      context: UiContext,
      props: UiListPropsType<T> = {},
    ): VNode {
      const model = context.model as any;
      const runtime = context as any;
      return this.tableWithCells(
        model.list ?? model ?? [],
        context.metaui,
        () => context,
        {
          filterDisplay:
            props.filterDisplay ?? this.factory.defaultFilterDisplay ?? "none",
          ...props,
          filterLabels: {
            all: context.translate("state.all"),
            yes: context.translate("boolean.yes"),
            no: context.translate("boolean.no"),
            apply: context.translate("action.apply"),
            clear: context.translate("action.clear"),
            ...props.filterLabels,
          },
          filterModel: runtime.searchParam?.filterModel,
          loadFilterOptions:
            props.loadFilterOptions ??
            ((field) => runtime.loadReferenceOptions(field)),
          loadPivotDates:
            props.loadPivotDates ??
            ((field) => runtime.logic?.getPivotDates?.(field.fieldName)),
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
          searchRelative:
            props.searchRelative ??
            (async (field, searchWord) => {
              const options = runtime.getFieldOptions(field);
              options.searchParam.pager.pageNo = 1;
              options.searchParam.pager.pageSize = 20;
              await runtime.searchRelative(field, searchWord);
              return options.selectOptions;
            }),
          onFilterModelChange: (filterModel) => {
            writeListFilterModel(runtime.searchParam, filterModel);
            if (props.onFilterModelChange) {
              return props.onFilterModelChange(filterModel);
            }
            return runtime.search?.();
          },
          onSort: (sorts) => {
            writeListSorts(runtime.searchParam, sorts);
            schedulePersistListPack(runtime);
            if (props.onSort) return props.onSort(sorts);
            return runtime.search?.();
          },
          onListLayoutChange: () => {
            schedulePersistListPack(runtime);
          },
          layoutRev: runtime.listLayoutRev,
          onSelect: (selection) => {
            context.selectedItems = selection;
            props.onSelect?.(selection);
          },
          selectedItems: runtime.selectedItems ?? [],
          showActions: props.showActions === true,
          loading: props.loading ?? runtime.loading,
          rowMenu:
            props.showColumnWithAction === false
              ? undefined
              : (props.rowMenu ??
                this.createListRowMenu(context, props.showActions === true)),
        },
      );
    },
    
    /** 列表行菜单工厂：图标只解析一次，禁止 with(row)。 */
    createListRowMenu(
      context: UiContext,
      includeExtras = false,
    ): (row: any) => UiAction[] {
      const icons = {
        edit: this.factory.resolveIcon("edit"),
        delete: this.factory.resolveIcon("delete"),
        details: this.factory.resolveIcon("details"),
      };
      return (row) => this.listRowMenu(context, row, icons, includeExtras);
    },
    
    /** 子表行删：可点看 itemDeletableFunc 与 row.deletable；确认后走 beforeItemRemove。 */
    subGroupRowMenu(
      context: UiContext,
      group: MetaUiGroup,
      row: any,
    ): UiAction[] {
      const runtime = context as UiViewContext;
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
              buttons: ["yes", "no"],
            });
            if (result !== "yes") return;
            await runtime.removeSubGroupItem(group, row);
          },
        },
      ];
    },
    
    /** 列表行操作：编辑、删除、详情；扩展 actions 置于分隔线后。
     * 禁止 with(row)：索引页千行时不能为每行建 rowContext。
     */
    listRowMenu(
      context: UiContext,
      row: any,
      icons?: { edit: string; delete: string; details: string },
      includeExtras = false,
    ): UiAction[] {
      const runtime = context as any;
      const entityAuth = runtime.getModuleAuth?.(row);
      const rowId =
        row?.id ??
        (context.metaui?.primaryKey
          ? row?.[context.metaui.primaryKey]
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
          onAction: () => runtime.edit?.(rowId),
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
              buttons: ["yes", "no"],
            });
            if (result !== "yes") return;
            if (runtime.logic?.beforeDelete) {
              const ok = await runtime.logic.beforeDelete(runtime, row);
              if (ok === false) return false;
            }
            const deleted = await runtime.logic?.delete?.(rowId);
            await runtime.logic?.afterDelete?.(runtime, row, undefined, deleted);
            return runtime.reload?.();
          },
        });
      }
      items.push({
        name: "details",
        label: context.t("action.details"),
        icon: resolved.details,
        onAction: () => runtime.details?.(row),
      });
    
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
    },
    
    buildColumns<T = any>(
      metaui: MetaUi,
      context: UiContext,
      props: UiListPropsType<T> = {},
    ): VNode[] {
      return metaui
        .getListedFields()
        .map((field) =>
          h(
            "span",
            { key: field.fieldName },
            props.customCellRenderers?.[field.fieldName]
              ? props.customCellRenderers[field.fieldName](
                  field,
                  context.model as T,
                )
              : field.displayLabel,
          ),
        );
    },
    
    buildPaginator(
      context: UiContext,
      props: UiPaginatorPropsType = { onPage: () => undefined },
    ): VNode {
      const runtime = context as any;
      const pagination = runtime.model?.pagination ??
        runtime.pagination ?? {
          pageNo: runtime.searchParam?.pager?.pageNo ?? 1,
          pageSize: runtime.searchParam?.pager?.pageSize ?? readStoredPageSize(),
          recordCount: runtime.model?.list?.length ?? 0,
        };
      return this.factory.paginator(pagination, props);
    },
  });
}

function resolveTreeListOptions<T>(props: UiTreeListViewPropsType<T>) {
  const treeOption =
    props.treeOption ?? (props as { tree?: typeof props.treeOption }).tree;
  const extras = props as UiTreeListViewPropsType<T> & {
    showToolbar?: boolean;
    showSearchbar?: boolean;
    showBreadcrumb?: boolean;
    showActions?: boolean;
  };
  return {
    treeOption,
    listOption: {
      ...(props.listOption ?? {}),
      showToolbar: props.listOption?.showToolbar ?? extras.showToolbar,
      showSearchbar: props.listOption?.showSearchbar ?? extras.showSearchbar,
      showBreadcrumb: props.listOption?.showBreadcrumb ?? extras.showBreadcrumb,
      showActions: props.listOption?.showActions ?? extras.showActions,
    },
  };
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
  spec: UiTreeViewPropsType<T> | undefined,
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
  if (
    context.filters?.some(
      (filter) => (filter.selectedConditions?.value?.length ?? 0) > 0,
    )
  ) {
    return true;
  }
  if (
    context.searchFields?.some((field) => {
      const value = field.searchVal?.value;
      return value != null && value !== "";
    })
  ) {
    return true;
  }
  return Boolean(context.customSearchFields?.some((field) => field.hasVal));
}

const MmdaTreeListTreePane = defineComponent({
  name: "MmdaTreeListTreePane",
  props: {
    builder: { type: Object, required: true },
    context: { type: Object as PropType<UiContext>, required: true },
    spec: { type: Object as PropType<UiTreeListViewPropsType>, required: true },
    reloadTick: { type: Object, required: true },
    onPicked: { type: Function, required: true },
  },
  setup(props) {
    return () => {
      const self = props.builder as VueUiBuilder;
      const viewProps = props.spec;
      const { treeOption } = resolveTreeListOptions(viewProps);
      const spec =
        typeof treeOption === "function" ? treeOption() : treeOption;
      return self.buildAside(
        self.buildTreeView(
          {
            ...spec!,
            reloadTick: props.reloadTick as { value: number },
            showSearchBar:
              spec!.showSearchBar ?? viewProps.showTreeSearchBar ?? true,
            showTreeFooter: spec!.showTreeFooter ?? true,
            onNodeSelect: (node: unknown) => {
              spec!.onNodeSelect?.(node);
              props.onPicked(node);
            },
          },
          props.context,
        ),
        { class: "mmda-tree-list-aside" },
      );
    };
  },
});

const MmdaTreeListView = defineComponent({
  name: "MmdaTreeListView",
  props: {
    builder: { type: Object, required: true },
    context: { type: Object as PropType<UiContext>, required: true },
    spec: { type: Object as PropType<UiTreeListViewPropsType>, required: true },
  },
  setup(props) {
    const reloadTick = ref(0);
    const pickedLabel = ref("");

    const runtimeOf = () =>
      props.context as UiContext & {
        search?: (param?: unknown) => Promise<unknown>;
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
      runtime.search = (param, options) => {
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
      const self = props.builder as VueUiBuilder;
      const context = props.context;
      const paged = context.model as {
        list?: unknown[];
        pagination?: { recordCount?: number };
      };
      if (Array.isArray(paged.list)) void paged.list.length;
      if (paged.pagination) void paged.pagination.recordCount;
      const viewProps = props.spec;
      const { listOption } = resolveTreeListOptions(viewProps);
      const { runtime, searchbar, list, paginator } = (
        self as unknown as {
          listViewParts: VueUiBuilder["listViewParts"];
        }
      ).listViewParts(context, {
        ...listOption,
        showToolbar: false,
      });
      const treeWidth =
        typeof viewProps.treeWidth === "number"
          ? `${viewProps.treeWidth}px`
          : (viewProps.treeWidth ?? "16rem");
      const toolbar =
        listOption.showToolbar === false
          ? null
          : self.buildModuleToolbar(
              context,
              {
                showBreadcrumb: listOption.showBreadcrumb ?? true,
                showActions: listOption.showActions ?? true,
                breadcrumbLeaf:
                  pickedLabel.value || selectedTreeLabel(latestSpec()),
              },
              {
                center: () => (searchbar ? [searchbar] : []),
              },
            );
      const body = self.factory.splitter(
        [
          {
            content: h(MmdaTreeListTreePane, {
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
            content: self.buildMain(list, {
              class: "mmda-list-scroll",
              style: { height: "100%", minWidth: 0, overflow: "hidden" },
            }),
            min: "16rem",
          },
        ],
        {
          orientation: "Horizontal",
          class: "mmda-tree-list-splitter",
          separatorSize: 8,
        },
      );
      return self.buildContainer(
        [
          toolbar ? self.buildHeader(toolbar) : null,
          !toolbar && searchbar ? self.buildHeader(searchbar) : null,
          body,
          paginator ? self.buildFooter(paginator) : null,
        ].filter(Boolean) as VNode[],
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
      );
    };
  },
} as any);

function selectedTreeLabel<T>(
  spec?: UiTreeViewPropsType<T>,
): string {
  if (!spec) return "";
  if (spec.selectedNode) return treeLabelOf(spec.selectedNode, spec.fields);
  return "";
}

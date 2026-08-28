import { h, type VNode, type VNodeArrayChildren, type VNodeChild } from "vue";
import type {
  ActionCallback,
  EntityAction,
  EntityUrlParam,
  MetaUi,
  MetaUiField,
  MetaUiGroup,
  Module,
} from "@mmda/core";
import {
  MetaModel,
  SqlDataType,
  entityActionFactory,
  EntityActionType,
  DEFAULT_PAGE_SIZE,
} from "@mmda/core";
import {
  AppLayout,
  layoutField,
  layoutFieldGroup,
  layoutPage,
  type FieldGroupDirection,
  type PropData,
  type UiDirection,
  type UiLayout,
  type UiSlots,
} from "./ui_layout";
import type {
  UiFactory,
  UiFieldFactory,
  UiFieldRenderer,
  UiGroupRenderer,
} from "./ui_factory";
import { cleanTableCellProps } from "./ui_factory";
import type {
  UiListPropsType,
  UiListViewPropsType,
  UiPaginatorPropsType,
} from "./ui_list";
import type {
  AppScaffoldProps,
  AppSideBarProps,
  AppTopBarProps,
  ImportAndExportActionProps,
  ModuleBreadcrumbProps,
  ModuleSearchbarProps,
  ModuleToolbarProps,
} from "./ui_app";
import type {
  SigninFormProps,
  SigninFormSlots,
  SignupFormProps,
} from "./ui_auth";
import type {
  UiDialogPropsType,
  UiMessageBoxProps,
  UiMessageBoxResult,
  UiNotificationProps,
} from "./ui_dialog";
import type { QrcodeProps, UiViewPropsType } from "./ui_view";
import type {
  SearchForRelativeContentProps,
  SearchForRelativeProps,
  UiSearchField,
} from "./ui_filter";
import { UiContextAction, type IconResolver } from "./ui_action";
import type { UiViewContext } from "./ui_context";

/** VUI 内部统一运行时；公开契约由各场景 context 接口约束。 */
type UiContext = UiViewContext<any>;

const hiddenDeletedSubRowStyle = (data: any) =>
  MetaModel.deleted(data) ? { display: "none" } : undefined;

export interface ImportOrExportParam extends EntityUrlParam {
  handlerFn?: (context: UiContext, response: any) => void;
  importFn?: (context: UiContext, model: any) => void;
  exportFn?: (context: UiContext, model: any) => void;
}

export const isNullish = (value: unknown): value is null | undefined =>
  value == null;

export const hasProp = (name: string, props?: PropData) =>
  props != null && !isNullish(props[name]);

export const hasPropEx = <T>(name: string, value: T, props?: PropData) =>
  props != null && props[name] === value;

export function getProp<T>(
  name: string,
  props?: PropData,
  remove = false,
): T | undefined {
  if (!hasProp(name, props)) return undefined;
  const value = props![name] as T;
  if (remove) delete props![name];
  return value;
}

export function addProp<T>(name: string, value: T, props: PropData = {}) {
  props[name] = value;
  return props;
}

export function addDefaultProp<T>(
  name: string,
  value: T,
  props: PropData = {},
) {
  if (!hasProp(name, props)) props[name] = value;
  return props;
}

export function addDefaultProps(addingProps: PropData, props: PropData = {}) {
  for (const [name, value] of Object.entries(addingProps)) {
    if (!hasProp(name, props)) props[name] = value;
  }
  return props;
}

export function ignoreNullishProps(props: PropData) {
  for (const name of Object.keys(props)) {
    if (isNullish(props[name])) delete props[name];
  }
  return props;
}

export function copyProps(
  dest: PropData,
  src: PropData,
  names: string[],
  ignoreNullish = true,
) {
  for (const name of names) {
    if (!ignoreNullish || !isNullish(src[name])) dest[name] = src[name];
  }
}

export function selectProps(
  src: PropData,
  names: string[],
  ignoreNullish = true,
) {
  const dest: PropData = {};
  copyProps(dest, src, names, ignoreNullish);
  return dest;
}

export interface UiBuilder {
  factory: UiFactory;
  fldFactory: UiFieldFactory;
  labelFor: (field: MetaUiField) => VNode;
  editFor: (field: MetaUiField, context: UiContext) => VNode;
  displayFor: (field: MetaUiField, context: UiContext) => VNode;
  displayCellFor: (
    field: MetaUiField,
    row: any,
    context: UiContext,
    props?: PropData,
  ) => VNode | VNode[];
  buildField: UiFieldRenderer;
  buildResponsiveField: UiFieldRenderer;
  buildGroup: UiGroupRenderer;
  buildGroupForm?: (context: UiContext, props?: UiViewPropsType) => VNode;
  buildFlowToGroup: (
    flowTrails: any[],
    context: UiContext,
    props?: PropData,
  ) => VNode;
  buildAttachmentGroup?: (context: UiContext, props?: PropData) => VNode;
  buildView: (context: UiContext, props?: UiViewPropsType) => VNode;
  buildListView: <T = any>(
    context: UiContext,
    props?: UiListViewPropsType<T>,
  ) => VNode;
  buildCustomView: <T = any>(
    context: UiContext,
    props?: UiListViewPropsType<T>,
  ) => VNode;
  buildList: <T = any>(context: UiContext, props?: UiListPropsType<T>) => VNode;
  buildTable: <T = any>(
    context: UiContext,
    props?: UiListPropsType<T>,
  ) => VNode;
  buildColumns<T = any>(
    metaui: MetaUi,
    context: UiContext,
    props?: UiListPropsType<T>,
  ): VNode[];
  buildPaginator: (context: UiContext, props?: UiPaginatorPropsType) => VNode;
  buildContainer: (
    subContainer: VNode | VNodeArrayChildren,
    props?: PropData,
  ) => VNode;
  buildHeader: (content: VNode | VNodeArrayChildren, props?: PropData) => VNode;
  buildAside: (content: VNode | VNodeArrayChildren, props?: PropData) => VNode;
  buildMain: (content: VNode | VNodeArrayChildren, props?: PropData) => VNode;
  buildFooter: (content: VNode | VNodeArrayChildren, props?: PropData) => VNode;
  buildAppScaffold: (props?: AppScaffoldProps) => VNode;
  buildAppTopBar: (props?: AppTopBarProps) => VNode;
  buildAppSideBar: (props?: AppSideBarProps) => VNode;
  buildAppMenu: (modules: Module[], props?: PropData) => VNode;
  buildLoading: (context: UiContext, props?: PropData) => VNode;
  buildError: (context: UiContext, props?: PropData) => VNode;
  buildModuleBreadcrumb: (
    context: UiContext,
    props: ModuleBreadcrumbProps,
  ) => VNode;
  buildModuleToolbar: (
    context: UiContext,
    props: ModuleToolbarProps,
    slots?: UiSlots,
  ) => VNode;
  buildSearchField: (
    field: UiSearchField,
    context: UiContext,
    props: PropData,
  ) => VNode;
  buildSearchForm: (context: UiContext, props?: PropData) => VNode;
  buildModuleSearchbar: (
    context: UiContext,
    props: ModuleSearchbarProps,
  ) => VNode;
  buildSearchForRelative: (
    context: UiContext,
    field: MetaUiField,
    props: SearchForRelativeProps,
  ) => VNode;
  buildSigninForm: (props: SigninFormProps, slots?: SigninFormSlots) => VNode;
  buildSignupForm: (props: SignupFormProps) => VNode;
  toast: (context: UiContext, props: PropData) => Promise<any>;
  notify: (props: UiNotificationProps, context?: UiContext) => void;
  confirm: (
    context: UiContext,
    props: UiMessageBoxProps,
  ) => Promise<UiMessageBoxResult> | any;
  confirmMessage: (context: UiContext, props: PropData) => Promise<boolean>;
  confirmPopup: (context: UiContext, props: PropData) => Promise<any>;
  confirmDialog: (
    content: VNode,
    context: UiContext,
    props: UiDialogPropsType,
  ) => Promise<any>;
}

const unimplemented = (name: string) => {
  throw new Error(
    `UiBuilder.${name} requires @mmda/vui-primevue (or another skin).`,
  );
};

export abstract class AbstractUiBuilder implements UiBuilder {
  readonly actionFactory: UiActionFactory;

  constructor(
    public readonly factory: UiFactory,
    public readonly fldFactory: UiFieldFactory,
    public readonly layout: UiLayout,
  ) {
    this.actionFactory = new UiActionFactory(this, factory.resolveIcon);
  }

  labelFor(field: MetaUiField, props?: PropData) {
    return h(
      "label",
      { for: field.fieldName, key: field.fieldName, ...props },
      field.displayLabel,
    );
  }

  editFor(field: MetaUiField, context: UiContext, props: PropData = {}) {
    const logic = context.getFieldLogic(field) as any;
    const renderer =
      logic?.customEditor ??
      (field.editor ? this.fldFactory[field.editor] : undefined) ??
      this.fldFactory.fallbackInput;
    return renderer(field, context, props);
  }

  displayFor(field: MetaUiField, context: UiContext, props: PropData = {}) {
    const logic = context.getFieldLogic(field) as any;
    const renderer =
      logic?.customRenderer ??
      (field.renderer ? this.fldFactory[field.renderer] : undefined) ??
      this.fldFactory.fallbackDisplay;
    return renderer(field, context, props);
  }

  displayCellFor(
    field: MetaUiField,
    row: any,
    context: UiContext,
    props: PropData = {},
  ): VNode | VNode[] {
    return this.resolveTableColumnBody(field, row, context, props);
  }

  /**
   * 主表/子表共用：cellProps 在建表时 clean 一次，列 body 闭包逐行复用 renderCell。
   */
  protected tableWithCells(
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
    return this.factory.table(rows, metaui, {
      ...tableProps,
      renderCell: (field, row) =>
        customRenderCell?.(field, row) ??
        this.displayCellFor(field, row, rowContext(row), cellProps),
    });
  }

  /** 对齐旧版 `_tableColumnWidth` */
  protected tableColumnWidth(field: MetaUiField): number {
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
  }

  /** 对齐旧版 `_tableCell`；cellProps 应在列/表级预先 cleanTableCellProps，勿在此处逐格清理 */
  protected tableCell(
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

    if (inPlaceEdit && model?.editable && !isLock && !field.primaryKey) {
      const editor =
        fieldLogic?.customEditor ??
        this.fldFactory[field.editor ?? "textInput"] ??
        this.fldFactory.fallbackInput;
      return editor(field, ctx, {
        showWordLimit: false,
        width: `${this.tableColumnWidth(field)}px`,
      });
    }

    const renderer =
      fieldLogic?.customCellRenderer ??
      this.fldFactory[field.renderer ?? "textSpan"] ??
      this.fldFactory.fallbackDisplay;
    return renderer(field, ctx, cellProps);
  }

  /**
   * 兼容旧 customRenderer 的轻量只读行视图。
   * 它不进入 context 树，也不创建响应式代理和校验状态。
   */
  protected readonlyRowContext(
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
  }

  /** 对齐旧版 `_tableCellWithError` */
  protected tableCellWithError(
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
  }

  /** 对齐旧版 `_tableColumn` body 分支 */
  protected resolveTableColumnBody(
    field: MetaUiField,
    row: any,
    context: UiContext,
    props: PropData = {},
  ): VNode | VNode[] {
    const fieldLogic = context.getFieldLogic(field) as any;
    const useEditor =
      Boolean(context.editing) &&
      !props?.isSearch &&
      fieldLogic?.cellEditable &&
      !context.isFieldReadonly(field);
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

    let cacheKey: string | null = null;
    if (props?.cacheKey) {
      cacheKey = props.cacheKey;
    } else if (isTree && props?.groupUi) {
      cacheKey = props.groupUi.primaryKey;
    }

    const rowCtx =
      context.model === row
        ? context
        : isTree
          ? context.treeWith(row, cacheKey ?? undefined)
          : context.with(row, cacheKey ?? undefined);

    return this.tableCellWithError(field, rowCtx, useEditor, props);
  }

  buildField: UiFieldRenderer = (field, context, props = {}) => {
    if (context.isFieldHidden(field)) return h("span", { hidden: true });
    const { editing: editingProp, direction, ...controlProps } = props;
    const editing = editingProp ?? context.editing;
    const control = editing
      ? this.editFor(field, context, controlProps)
      : this.displayFor(field, context, controlProps);
    const runtime = context as any;
    const invalid = editing && runtime.isInvalid?.(field);
    const message =
      invalid && this.layout.fieldMessage
        ? h(
            "small",
            { class: "mmda-field-error" },
            runtime.getInvalidMessage?.(field),
          )
        : undefined;
    return layoutField({
      label: this.labelFor(field),
      control,
      message,
      direction:
        (direction as UiDirection | undefined) ?? this.layout.fieldLayout,
      props: { key: field.fieldName },
    });
  };

  buildResponsiveField: UiFieldRenderer = (field, context, props = {}) =>
    this.buildField(field, context, props);

  buildGroup: UiGroupRenderer = (group, context, children, props = {}) => {
    if (context.isGroupHidden(group)) return h("span", { hidden: true });
    const {
      direction = group.isSecondary() ? "column" : "row",
      cols = group.isSecondary() ? 1 : 2,
      ...groupProps
    } = props;
    if (group.many && group.groupUi) {
      const rows =
        ((context.model as Record<string, any>)[group.groupName] as any[]) ??
        [];
      const groupCtx = (context as UiViewContext).subGroupContext(group);
      const readOnlyRows = !context.editing;
      const table = this.tableWithCells(
        rows,
        group.groupUi,
        (row) => (readOnlyRows ? groupCtx : groupCtx.with(row)),
        {
          enableSort: false,
          showGridlines: true,
          readOnlyRows,
          rowStyle: hiddenDeletedSubRowStyle,
          onItemDoubleClick: (item) =>
            (context as any).subGroupItem?.(group, item),
          group,
          groupUi: group.groupUi,
        },
      );
      return h(
        "fieldset",
        { class: "mmda-group mmda-group-many", ...groupProps },
        [
          h("legend", group.groupLabel),
          layoutFieldGroup({
            fields: [table],
            direction: "table",
            cols: 1,
          }),
        ],
      );
    }
    const fields =
      children ??
      group.fields
        .filter((field) => !context.isFieldHidden(field))
        .map((field) => this.buildField(field, context, groupProps));
    return h("fieldset", { class: "mmda-group", ...groupProps }, [
      h("legend", group.groupLabel),
      layoutFieldGroup({
        fields,
        direction: direction as FieldGroupDirection,
        cols: cols as 1 | 2 | 3,
      }),
    ]);
  };

  buildFlowToGroup(
    flowTrails: any[],
    _context: UiContext,
    props?: PropData,
  ): VNode {
    return h(
      "section",
      props,
      flowTrails.map((item) => h("div", String(item))),
    );
  }

  buildAttachmentGroup(context: UiContext, props?: PropData): VNode {
    const attachments =
      ((context.model as Record<string, any>).attachments as
        { fileName?: string }[] | undefined) ?? [];
    return h("fieldset", { class: "mmda-group mmda-attachments", ...props }, [
      h("legend", context.translate("attachments") || "Attachments"),
      attachments.length
        ? h(
            "ul",
            attachments.map((item) => h("li", item.fileName ?? "")),
          )
        : h("p", context.translate("empty.attachments") || "No attachments"),
    ]);
  }

  buildView(context: UiContext, props: UiViewPropsType = {}): VNode {
    const groups = context.metaui.groups.filter(
      (group) => !context.isGroupHidden(group),
    );
    const primaryCols = props.primaryCols ?? 2;
    const primary = groups
      .filter((group) => group.isPrimary())
      .map((group) =>
        this.buildGroup(group, context, undefined, {
          direction: "row",
          cols: primaryCols,
        }),
      );
    const summary =
      props.showSecondaryGroup === false
        ? []
        : groups
            .filter((group) => group.isSecondary())
            .map((group) =>
              this.buildGroup(group, context, undefined, {
                direction: "column",
                cols: 1,
              }),
            );
    const tails = groups
      .filter((group) => group.isTails())
      .map((group) =>
        this.buildGroup(group, context, undefined, {
          direction: "row",
          cols: primaryCols,
        }),
      );
    const attachments = (context.model as Record<string, any>).attachments;
    if (
      props.showAttachments !== false &&
      Array.isArray(attachments) &&
      this.buildAttachmentGroup
    ) {
      summary.push(this.buildAttachmentGroup(context));
    }
    const runtime = context as any;
    const toolbar =
      props.showToolbar === false
        ? null
        : (props.toolbar?.() ??
          this.buildModuleToolbar(context, {
            showBreadcrumb: props.showBreadcrumb ?? true,
            showActions: props.showActions ?? true,
          }));
    const pagePrimary = props.content
      ? [h("div", props.content() as any)]
      : [
          ...(props.header ? [h("div", props.header() as any)] : []),
          ...primary,
        ];
    const page = layoutPage({
      toolbar: toolbar as VNodeChild,
      stickyToolbar: props.stickyToolbar ?? true,
      primary: pagePrimary,
      summary: props.content ? [] : summary,
      tails: props.content ? [] : tails,
      footer: props.footer?.(),
      props: { class: "mmda-view", role: runtime.view },
    });
    return context.editing
      ? h(
          "form",
          {
            class: "mmda-form",
            style: { height: "100%", minHeight: 0, overflow: "hidden" },
          },
          page,
        )
      : page;
  }

  buildListView<T = any>(
    context: UiContext,
    props: UiListViewPropsType<T> = {},
  ): VNode {
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
          });
    const refreshButton = this.factory.actionButton(
      this.actionFactory.refresh(context),
      (message) => context.t(message),
      false,
      { size: "small" },
    );
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
              center: () =>
                [searchbar, refreshButton].filter(Boolean) as VNode[],
            },
          ));
    const list = props.content?.() ?? this.buildTable(context, props);
    const paginator = this.buildPaginator(context, {
      onPage: (pager) => {
        Object.assign(runtime.searchParam.pager, pager);
        void runtime.search?.();
      },
    });
    return this.buildContainer(
      [
        toolbar ? this.buildHeader(toolbar) : null,
        !toolbar && searchbar ? this.buildHeader(searchbar) : null,
        this.buildMain(list, {
          class: "mmda-list-scroll",
          style: { flex: "1 1 auto", minHeight: 0, overflow: "auto" },
        }),
        this.buildFooter(paginator),
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
  }

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
  }

  buildList<T = any>(
    context: UiContext,
    props: UiListPropsType<T> = {},
  ): VNode {
    const model = context.model as any;
    return this.factory.list(model.list ?? model ?? [], context.metaui, props);
  }

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
        filterDisplay: "none",
        ...props,
        filterLabels: {
          all: context.translate("state.all"),
          yes: context.translate("boolean.yes"),
          no: context.translate("boolean.no"),
          apply: context.translate("action.apply"),
          clear: context.translate("action.clear"),
          ...props.filterLabels,
        },
        filterModel: runtime.searchParam?.searchParams,
        onFilterModelChange: (filterModel) => {
          runtime.searchParam.searchParams =
            Object.keys(filterModel).length > 0 ? filterModel : undefined;
          runtime.searchParam.pager.pageNo = 1;
          props.onFilterModelChange?.(filterModel);
          if (!props.onFilterModelChange) void runtime.search?.();
        },
        onSelect: (selection) => {
          context.selectedItems = selection;
          props.onSelect?.(selection);
        },
        selectedItems: runtime.selectedItems ?? [],
      },
    );
  }

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
  }

  buildPaginator(
    context: UiContext,
    props: UiPaginatorPropsType = { onPage: () => undefined },
  ): VNode {
    const runtime = context as any;
    const pagination = runtime.model?.pagination ??
      runtime.pagination ?? {
        pageNo: runtime.searchParam?.pager?.pageNo ?? 1,
        pageSize: runtime.searchParam?.pager?.pageSize ?? DEFAULT_PAGE_SIZE,
        recordCount: runtime.model?.list?.length ?? 0,
      };
    return this.factory.paginator(pagination, props);
  }
  abstract buildContainer(
    subContainer: VNode | VNodeArrayChildren,
    props?: PropData,
  ): VNode;
  abstract buildHeader(
    content: VNode | VNodeArrayChildren,
    props?: PropData,
  ): VNode;
  abstract buildAside(
    content: VNode | VNodeArrayChildren,
    props?: PropData,
  ): VNode;
  abstract buildMain(
    content: VNode | VNodeArrayChildren,
    props?: PropData,
  ): VNode;
  abstract buildFooter(
    content: VNode | VNodeArrayChildren,
    props?: PropData,
  ): VNode;
  buildAppScaffold(props: AppScaffoldProps = {}): VNode {
    const invoke = (value: unknown): VNodeChild =>
      typeof value === "function"
        ? (value as () => VNodeChild)()
        : (value as VNodeChild);
    const variant =
      props.layout ?? (props.model === "Mobile" ? "topBarFull" : "sidebarLeft");
    return new AppLayout(variant).render({
      topBar: invoke(props.topBar),
      nav: invoke(props.sideBar),
      page: invoke(props.body),
      bottomBar: invoke(props.bottomBar),
    });
  }
  abstract buildAppTopBar(props?: AppTopBarProps): VNode;
  abstract buildAppSideBar(props?: AppSideBarProps): VNode;
  abstract buildAppMenu(modules: Module[], props?: PropData): VNode;
  abstract buildLoading(context: UiContext, props?: PropData): VNode;
  abstract buildError(context: UiContext, props?: PropData): VNode;
  abstract buildModuleBreadcrumb(
    context: UiContext,
    props: ModuleBreadcrumbProps,
  ): VNode;
  abstract buildModuleToolbar(
    context: UiContext,
    props: ModuleToolbarProps,
    slots?: UiSlots,
  ): VNode;
  abstract buildSearchField(
    field: UiSearchField,
    context: UiContext,
    props: PropData,
  ): VNode;
  abstract buildSearchForm(context: UiContext, props?: PropData): VNode;
  abstract buildModuleSearchbar(
    context: UiContext,
    props: ModuleSearchbarProps,
  ): VNode;
  abstract buildSearchForRelative(
    context: UiContext,
    field: MetaUiField,
    props: SearchForRelativeProps,
  ): VNode;
  abstract buildSigninForm(
    props: SigninFormProps,
    slots?: SigninFormSlots,
  ): VNode;
  abstract buildSignupForm(props: SignupFormProps): VNode;
  abstract toast(context: UiContext, props: PropData): Promise<any>;
  abstract notify(props: UiNotificationProps, context?: UiContext): void;
  abstract confirm(
    context: UiContext,
    props: UiMessageBoxProps,
  ): Promise<UiMessageBoxResult> | any;
  abstract confirmMessage(
    context: UiContext,
    props: PropData,
  ): Promise<boolean>;
  abstract confirmPopup(context: UiContext, props: PropData): Promise<any>;
  abstract confirmDialog(
    content: VNode,
    context: UiContext,
    props: UiDialogPropsType,
  ): Promise<any>;
}

const emptyNode = () => h("div");

/** 无皮肤时的占位 Builder，弹层一律取消。 */
export function createStubUiBuilder(): UiBuilder {
  const factory = {
    layout: {} as UiLayout,
    resolveIcon: (icon: string) => icon,
  } as UiFactory;
  const builder: UiBuilder = {
    factory,
    fldFactory: {} as UiFieldFactory,
    labelFor: (field) => h("label", field.displayLabel),
    editFor: emptyNode,
    displayFor: emptyNode,
    displayCellFor: emptyNode,
    buildField: emptyNode,
    buildResponsiveField: emptyNode,
    buildGroup: emptyNode,
    buildFlowToGroup: emptyNode,
    buildView: emptyNode,
    buildListView: emptyNode,
    buildCustomView: emptyNode,
    buildList: emptyNode,
    buildTable: emptyNode,
    buildColumns: () => [],
    buildPaginator: emptyNode,
    buildContainer: emptyNode,
    buildHeader: emptyNode,
    buildAside: emptyNode,
    buildMain: emptyNode,
    buildFooter: emptyNode,
    buildAppScaffold: emptyNode,
    buildAppTopBar: emptyNode,
    buildAppSideBar: emptyNode,
    buildAppMenu: emptyNode,
    buildLoading: emptyNode,
    buildError: emptyNode,
    buildModuleBreadcrumb: emptyNode,
    buildModuleToolbar: emptyNode,
    buildSearchField: emptyNode,
    buildSearchForm: emptyNode,
    buildModuleSearchbar: emptyNode,
    buildSearchForRelative: emptyNode,
    buildSigninForm: emptyNode,
    buildSignupForm: emptyNode,
    toast: async () => undefined,
    notify: () => undefined,
    confirm: async () => "cancel",
    confirmMessage: async () => false,
    confirmPopup: async () => false,
    confirmDialog: async () => false,
  };
  return builder;
}

export class UiActionFactory {
  constructor(
    public readonly builder: UiBuilder,
    public readonly resolveIcon: IconResolver,
  ) {}

  fromEntity(context: UiContext, action: any) {
    return UiContextAction(context as any, action, this.resolveIcon);
  }

  private createAction(
    context: UiContext,
    name: keyof typeof entityActionFactory,
    callback: ActionCallback,
  ) {
    return this.fromEntity(context, entityActionFactory[name](callback));
  }

  back(context: UiContext) {
    return this.createAction(context, "back", () => {
      const router = (context as any).globalProps?.$router;
      router?.back?.();
    });
  }

  create(context: UiContext) {
    return this.createAction(context, "create", () =>
      (context as any).create?.(),
    );
  }

  confirm(context: UiContext) {
    return this.createAction(context, "confirm", () =>
      (context as any).confirmAction?.(),
    );
  }

  cancel(context: UiContext) {
    return this.createAction(context, "cancel", () =>
      (context as any).cancel?.(context),
    );
  }

  edit(context: UiContext) {
    return this.createAction(context, "edit", () => (context as any).edit?.());
  }

  save(context: UiContext) {
    return this.createAction(context, "save", () => (context as any).save?.());
  }

  delete(context: UiContext) {
    return this.createAction(context, "delete", async () => {
      const runtime = context as any;
      const result = await this.builder.confirm(context, {
        message:
          runtime.translate?.("confirmation.delete", {
            it: runtime.getModelTitle?.(),
          }) ?? "Delete this item?",
        buttons: ["yes", "no"],
      });
      if (result === "yes") return runtime.delete?.();
    });
  }

  deleteAll(context: UiContext) {
    return this.createAction(context, "deleteAll", async () => {
      const runtime = context as any;
      const selected = runtime.selectedItems ?? [];
      if (selected.length === 0) {
        return this.builder.toast(context, {
          severity: "error",
          detail:
            runtime.translate?.("invalid.requiredSelectAny") ??
            "Select at least one item.",
        });
      }
      const result = await this.builder.confirm(context, {
        message:
          runtime.translate?.("confirmation.deleteAll", {
            it: runtime.metaui?.displayLabel,
          }) ?? "Delete selected items?",
        buttons: ["yes", "no"],
      });
      if (result !== "yes") return;
      const ids = selected
        .map((item: any) => item?.id)
        .filter((id: unknown) => id != null);
      return runtime.deleteAll?.(ids);
    });
  }

  refresh(context: UiContext) {
    return this.createAction(context, "refresh", () =>
      (context as any).refresh?.(true),
    );
  }

  print(context: UiContext) {
    return this.createAction(context, "print", () =>
      (context as any).print?.(),
    );
  }

  import(context: UiContext, options?: ImportOrExportParam) {
    return this.createAction(context, "import", async () => {
      const runtime = context as any;
      runtime.currentTemplate = null;
      const result = await (runtime.many
        ? runtime.importFiles?.(options)
        : runtime.importFile?.(options));
      options?.handlerFn?.(context, result);
      return result;
    });
  }

  export(context: UiContext, options?: ImportOrExportParam) {
    return this.createAction(context, "export", () => {
      const runtime = context as any;
      runtime.currentTemplate = null;
      return runtime.many
        ? runtime.exportFiles?.(options)
        : runtime.exportFile?.(options);
    });
  }

  add(context: UiContext, onAdd: ActionCallback) {
    return this.createAction(context, "add", onAdd);
  }

  remove(context: UiContext, onRemove: ActionCallback) {
    return this.createAction(context, "remove", onRemove);
  }

  action(context: UiContext, action: EntityAction) {
    action.onAction = () => (context as any).doAction?.(action);
    action.role ??= action.param?.hint?.toLocaleLowerCase?.() ?? "warning";
    return this.fromEntity(context, action);
  }
}

export { unimplemented };
export type { SearchForRelativeContentProps, MetaUiGroup, VNodeChild };

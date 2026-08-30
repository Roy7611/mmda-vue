import { h, type Component, type VNode, type VNodeArrayChildren, type VNodeChild } from "vue";
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
  GridCellRenderContext,
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
import { resolveColorPalette, type MmdaColorPalette } from "./ui_theme";
import type {
  SigninFormProps,
  SigninFormSlots,
  SignupFormProps,
} from "./ui_auth";
import type {
  UiDialogPropsType,
  UiMessageBoxProps,
  UiMessageBoxResult,
  UiToastProps,
} from "./ui_dialog";
import type { QrcodeProps, UiViewPropsType } from "./ui_view";
import type {
  SearchForRelativeContentProps,
  SearchForRelativeProps,
  UiSearchField,
} from "./ui_filter";
import { UiContextAction, type IconResolver, type UiAction } from "./ui_action";
import type { UiButtonProps } from "./ui_button";
import type { UiViewContext } from "./ui_context";
import { createHtmlOverlay, type UiOverlay } from "./ui_overlay";
import { DocxFilePreview } from "./components/DocxFilePreview";
import { MmdaGroupCard } from "./components/GroupCard";
import { XlsxFilePreview } from "./components/XlsxFilePreview";

/** VUI 内部统一运行时；公开契约由各场景 context 接口约束。 */
type UiContext = UiViewContext<any>;

const hiddenDeletedSubRowStyle = (data: any) =>
  MetaModel.deleted(data) ? { display: "none" } : undefined;

const groupRegion = (group: MetaUiGroup) => {
  if (group.isSecondary()) return "summary";
  if (group.isTails()) return "tails";
  return "primary";
};

/** 同区内：主表组（!many）在前并按 groupName；子表组按 groupIdx。 */
const compareViewGroups = (a: MetaUiGroup, b: MetaUiGroup) => {
  if (a.many !== b.many) return a.many ? 1 : -1;
  if (a.many) {
    return (a.groupIdx ?? 0) - (b.groupIdx ?? 0);
  }
  return a.groupName.localeCompare(b.groupName);
};

const sortViewGroups = (groups: MetaUiGroup[]) =>
  [...groups].sort(compareViewGroups);

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
  buildGroupCard?: (
    group: MetaUiGroup,
    body: VNode | VNode[],
    props?: PropData,
  ) => VNode;
  buildGroupFieldSet?: (
    group: MetaUiGroup,
    body: VNode | VNode[],
    props?: PropData,
  ) => VNode;
  buildGroupForm?: (context: UiContext, props?: UiViewPropsType) => VNode;
  buildBpmnDiagram: (
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
  setColorScheme: (dark: boolean) => void;
  setColorPalette: (palette: MmdaColorPalette) => void;
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
  /**
   * 统一下拉菜单按钮：默认 text（无描边），自带下拉箭头，不额外塞三点图标。
   * 业务/皮肤共用，避免各处手写 menuButton 风格不一致。
   */
  dropdownMenuButton: (
    props: UiButtonProps,
    actions: UiAction[],
    slots?: UiSlots,
  ) => VNode;
  /** 工具栏「更多」：无图标，仅文案 + 下拉箭头 */
  moreMenuButton: (
    context: UiContext,
    items: Array<{
      name?: string;
      label?: string;
      icon?: string;
      command?: () => void;
      onAction?: (...args: any[]) => any;
      items?: any[];
    }>,
  ) => VNode[];
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
  overlay: UiOverlay;
  overlayHost?: Component;
  toast: (context: UiContext, props: UiToastProps | PropData) => Promise<any>;
  confirm: (
    context: UiContext,
    props: UiMessageBoxProps,
  ) => Promise<UiMessageBoxResult> | any;
  confirmMessage: (context: UiContext, props: PropData) => Promise<boolean>;
  dialog: (
    content: VNode,
    context: UiContext,
    props: UiDialogPropsType,
  ) => Promise<boolean>;
  confirmDialog: (
    content: VNode,
    context: UiContext,
    props: UiDialogPropsType,
  ) => Promise<any>;
  buildDocxFilePreview: (
    source: string | ArrayBuffer,
    props?: PropData,
  ) => VNode;
  buildXlsxFilePreview: (
    source: string | ArrayBuffer,
    props?: PropData,
  ) => VNode;
  buildFilePreview: (source: string | ArrayBuffer, props?: PropData) => VNode;
}

const unimplemented = (name: string) => {
  throw new Error(
    `UiBuilder.${name} requires a skin package (@mmda/vui-primevue or @mmda/vui-syncfusion).`,
  );
};

export abstract class AbstractUiBuilder implements UiBuilder {
  readonly actionFactory: UiActionFactory;

  constructor(
    public readonly factory: UiFactory,
    public readonly fldFactory: UiFieldFactory,
    public readonly layout: UiLayout,
    public overlay: UiOverlay = createHtmlOverlay(),
  ) {
    this.actionFactory = new UiActionFactory(this, factory.resolveIcon);
  }

  get overlayHost(): Component | undefined {
    return undefined;
  }

  setColorScheme(dark: boolean) {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("mmda-dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }

  setColorPalette(palette: MmdaColorPalette) {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.mmdaPalette = resolveColorPalette(palette);
  }

  dropdownMenuButton(
    props: UiButtonProps,
    actions: UiAction[],
    slots?: UiSlots,
  ) {
    return this.factory.menuButton(
      {
        // tonal：亮色 secondary-container；暗色皮肤内改为 surface 抬升
        buttonType: "tonal",
        colorRole: "secondary",
        ...props,
      },
      actions,
      slots,
    );
  }

  moreMenuButton(
    context: UiContext,
    items: Array<{
      name?: string;
      label?: string;
      icon?: string;
      command?: () => void;
      onAction?: (...args: any[]) => any;
      items?: any[];
    }>,
  ) {
    if (!items.length) return [];
    return [
      this.dropdownMenuButton(
        {
          label: context.t("action.more"),
          tooltip: context.t("action.more"),
          "aria-label": context.t("action.more"),
          class: "mmda-more-menu-button",
        },
        items.map((item, index) => ({
          name: item.name ?? `more-${index}`,
          label: item.label,
          icon: item.icon,
          onAction: item.command ?? item.onAction,
          items: item.items,
        })),
      ),
    ];
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
    const customGridCellRenderer = tableProps.gridCellRenderer;
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
      gridCellRenderer: (renderContext: GridCellRenderContext<any>) => {
        const fieldLogic = rowContext(renderContext.row).getFieldLogic(
          renderContext.field,
        ) as any;
        return (
          customGridCellRenderer?.(renderContext) ??
          fieldLogic?.customGridCellRenderer?.(renderContext)
        );
      },
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

  groupWrapClass(group: MetaUiGroup, props: PropData = {}) {
    const region = String(props.region ?? groupRegion(group));
    const many = props.many === true || group.many;
    return [
      "mmda-group",
      `mmda-group--${region}`,
      many ? "mmda-group--many mmda-group-many" : "mmda-group--master",
      props.class,
    ]
      .filter(Boolean)
      .join(" ");
  }

  /** FieldSet 外壳：骑边 legend（经典） */
  buildGroupFieldSet(
    group: MetaUiGroup,
    body: VNode | VNode[],
    props: PropData = {},
  ) {
    const {
      container: _container,
      region: _region,
      many: _many,
      direction: _direction,
      cols: _cols,
      class: _className,
      ...rest
    } = props;
    return h("fieldset", { class: this.groupWrapClass(group, props), ...rest }, [
      h("legend", { class: "mmda-group__title" }, group.groupLabel),
      body,
    ]);
  }

  /** Card 外壳：可折叠 header + body（默认） */
  buildGroupCard(
    group: MetaUiGroup,
    body: VNode | VNode[],
    props: PropData = {},
  ) {
    const {
      container: _container,
      region: _region,
      many: _many,
      direction: _direction,
      cols: _cols,
      class: _className,
      ...rest
    } = props;
    return h(
      MmdaGroupCard,
      {
        title: group.groupLabel,
        expanded: group.expanded !== false,
        class: this.groupWrapClass(group, props),
        ...rest,
      },
      () => body,
    );
  }

  wrapGroup(group: MetaUiGroup, body: VNode | VNode[], props: PropData = {}) {
    const shell = props.container ?? "card";
    if (shell === "fieldset") {
      return this.buildGroupFieldSet(group, body, props);
    }
    return this.buildGroupCard(group, body, props);
  }

  buildGroup: UiGroupRenderer = (group, context, children, props = {}) => {
    if (context.isGroupHidden(group)) return h("span", { hidden: true });
    const {
      direction = group.isSecondary() ? "column" : "row",
      cols = group.isSecondary() ? 1 : 2,
      container = "card",
      class: className,
      ...fieldProps
    } = props;
    const wrapProps = {
      container,
      class: className,
      region: groupRegion(group),
      many: group.many,
    };
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
          enableGroup: false,
          showGridlines: true,
          readOnlyRows,
          rowStyle: hiddenDeletedSubRowStyle,
          onItemDoubleClick: (item) =>
            (context as any).subGroupItem?.(group, item),
          group,
          groupUi: group.groupUi,
        },
      );
      return this.wrapGroup(
        group,
        layoutFieldGroup({
          fields: [table],
          direction: "table",
          cols: 1,
        }),
        wrapProps,
      );
    }
    const fields =
      children ??
      group.fields
        .filter((field) => !context.isFieldHidden(field))
        .map((field) => this.buildField(field, context, fieldProps));
    return this.wrapGroup(
      group,
      layoutFieldGroup({
        fields,
        direction: direction as FieldGroupDirection,
        cols: cols as 1 | 2 | 3,
      }),
      wrapProps,
    );
  };

  buildBpmnDiagram(
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
    const title = context.translate("attachments") || "Attachments";
    const body = attachments.length
      ? h(
          "ul",
          attachments.map((item) => h("li", item.fileName ?? "")),
        )
      : h("p", context.translate("empty.attachments") || "No attachments");
    return this.wrapGroup(
      {
        groupLabel: title,
        many: false,
        isSecondary: () => true,
        isTails: () => false,
      } as MetaUiGroup,
      body,
      { region: "summary", class: "mmda-attachments", ...props },
    );
  }

  buildView(context: UiContext, props: UiViewPropsType = {}): VNode {
    const groups = context.metaui.groups.filter(
      (group) => !context.isGroupHidden(group),
    );
    const primaryCols = props.primaryCols ?? 2;
    // 主区：主表组（按 groupName）→ 子表组（按 groupIdx）
    const primary = sortViewGroups(groups.filter((group) => group.isPrimary())).map(
      (group) =>
        this.buildGroup(group, context, undefined, {
          direction: "row",
          cols: primaryCols,
        }),
    );
    const summary: VNode[] = [];
    const attachments = (context.model as Record<string, any>).attachments;
    // 右边栏：附件等先渲染，概要分组始终放最后
    if (
      props.showAttachments !== false &&
      Array.isArray(attachments) &&
      this.buildAttachmentGroup
    ) {
      summary.push(this.buildAttachmentGroup(context));
    }
    if (props.showSecondaryGroup !== false) {
      summary.push(
        ...sortViewGroups(groups.filter((group) => group.isSecondary())).map(
          (group) =>
            this.buildGroup(group, context, undefined, {
              direction: "column",
              cols: 1,
            }),
        ),
      );
    }
    const tails = sortViewGroups(
      groups.filter((group) => group.isTails()),
    ).map((group) =>
      this.buildGroup(group, context, undefined, {
        direction: "row",
        cols: primaryCols,
      }),
    );
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
    const onPage = (pager: { pageNo?: number; pageSize?: number }) => {
      const cur = runtime.searchParam.pager;
      if (pager.pageNo === cur.pageNo && pager.pageSize === cur.pageSize) {
        return;
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
        filterDisplay:
          props.filterDisplay ??
          this.factory.defaultFilterDisplay ??
          "none",
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
        loadFilterOptions:
          props.loadFilterOptions ??
          ((field) => runtime.loadReferenceOptions(field)),
        onFilterModelChange: (filterModel) => {
          runtime.searchParam.searchParams =
            Object.keys(filterModel).length > 0 ? filterModel : undefined;
          runtime.searchParam.pager.pageNo = 1;
          if (props.onFilterModelChange) {
            return props.onFilterModelChange(filterModel);
          }
          return runtime.search?.();
        },
        onSort: (sorts) => {
          runtime.searchParam.pager.sorts = sorts;
          runtime.searchParam.pager.pageNo = 1;
          if (props.onSort) return props.onSort(sorts);
          return runtime.search?.();
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

  toast(_context: UiContext, props: UiToastProps | PropData) {
    this.overlay.toast(props as UiToastProps);
    return Promise.resolve();
  }

  confirm(_context: UiContext, props: UiMessageBoxProps) {
    return this.overlay.confirm(props);
  }

  async confirmMessage(context: UiContext, props: PropData) {
    return (await this.confirm(context, props as UiMessageBoxProps)) === "yes";
  }

  dialog(content: VNode, _context: UiContext, props: UiDialogPropsType) {
    return this.overlay.dialog(content, props);
  }

  confirmDialog(
    content: VNode,
    context: UiContext,
    props: UiDialogPropsType,
  ) {
    return this.dialog(content, context, props);
  }

  buildDocxFilePreview(source: string | ArrayBuffer, props: PropData = {}) {
    return h(DocxFilePreview, { source, ...props });
  }

  buildXlsxFilePreview(source: string | ArrayBuffer, props: PropData = {}) {
    return h(XlsxFilePreview, { source, ...props });
  }

  buildFilePreview(source: string | ArrayBuffer, props: PropData = {}) {
    const explicit = String(props.extension ?? "");
    const raw =
      typeof source === "string"
        ? source.split(/[?#]/)[0]
        : explicit;
    const extension = (
      explicit ||
      raw.split(".").pop() ||
      ""
    )
      .toLowerCase()
      .replace(/^\./, "");
    if (extension === "docx") return this.buildDocxFilePreview(source, props);
    if (extension === "xlsx" || extension === "xls")
      return this.buildXlsxFilePreview(source, props);
    const style = {
      width: "100%",
      height:
        typeof props.height === "number"
          ? `${props.height}px`
          : (props.height ?? "70vh"),
    };
    if (
      typeof source === "string" &&
      ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(extension)
    ) {
      return h("img", {
        src: source,
        alt: props.title ?? "",
        style: { ...style, objectFit: "contain" },
      });
    }
    if (typeof source === "string" && extension === "pdf") {
      return h("iframe", {
        src: source,
        title: props.title ?? "PDF preview",
        style,
      });
    }
    return h(
      "p",
      { class: "mmda-file-preview-missing" },
      `Preview is not available for .${extension || "unknown"} files.`,
    );
  }
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
    buildBpmnDiagram: emptyNode,
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
    setColorScheme: () => undefined,
    setColorPalette: () => undefined,
    buildLoading: emptyNode,
    buildError: emptyNode,
    buildModuleBreadcrumb: emptyNode,
    buildModuleToolbar: emptyNode,
    dropdownMenuButton: emptyNode,
    moreMenuButton: () => [],
    buildSearchField: emptyNode,
    buildSearchForm: emptyNode,
    buildModuleSearchbar: emptyNode,
    buildSearchForRelative: emptyNode,
    buildSigninForm: emptyNode,
    buildSignupForm: emptyNode,
    overlay: createHtmlOverlay(),
    overlayHost: undefined,
    toast: async () => undefined,
    confirm: async () => "no",
    confirmMessage: async () => false,
    dialog: async () => false,
    confirmDialog: async () => false,
    buildDocxFilePreview: emptyNode,
    buildXlsxFilePreview: emptyNode,
    buildFilePreview: emptyNode,
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

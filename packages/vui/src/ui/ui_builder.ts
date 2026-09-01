import {
  h,
  type Component,
  type VNode,
  type VNodeArrayChildren,
  type VNodeChild,
} from "vue";
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
import { readStoredPageSize, writeStoredPageSize } from "./ui_theme";
import { openListSettingDialog } from "./components/ListSettingView";
import { schedulePersistListPack } from "./list_layout";
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
import type { UiGanttChartProps } from "./ui_gantt";
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
import {
  UiActionDivider,
  UiContextAction,
  type IconResolver,
  type UiAction,
} from "./ui_action";
import type { UiButtonProps } from "./ui_button";
import type { UiViewContext } from "./ui_context";
import { createHtmlOverlay, type UiOverlay } from "./ui_overlay";
import { DocxFilePreview } from "./components/DocxFilePreview";
import { MmdaGroupCard } from "./components/GroupCard";
import { XlsxFilePreview } from "./components/XlsxFilePreview";
import { translateMessage } from "../i18n/i18n";

/** VUI 内部统一运行时；公开契约由各场景 context 接口约束。 */
type UiContext = UiViewContext<any>;

const hiddenDeletedSubRowStyle = (data: any) =>
  MetaModel.deleted(data) ? { display: "none" } : undefined;

/** Card zone: primary (main column incl. tails) | secondary (summary/aside). */
const groupZone = (group: MetaUiGroup) =>
  group.isSecondary() ? "secondary" : "primary";

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

const uploadedFileName = (value: unknown) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const file = value as Record<string, unknown>;
    return String(file.fileName ?? file.fileUrl ?? file.url ?? file.path ?? "");
  }
  return String(value ?? "");
};

const uploadedFileNames = async (response: any): Promise<string[]> => {
  if (response === false || response == null) return [];
  if (Array.isArray(response)) return response.map(uploadedFileName);
  if (Array.isArray(response.data)) return response.data.map(uploadedFileName);
  if (typeof response === "string") return [response];
  if (typeof response.text !== "function") return [];
  if ("ok" in response && !response.ok) {
    throw new Error(
      translateMessage("upload.httpFail", { status: response.status }),
    );
  }
  const text = await response.text();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map(uploadedFileName);
    if (Array.isArray(parsed?.data)) return parsed.data.map(uploadedFileName);
    if (typeof parsed === "string") return [parsed];
  } catch {
    return [text];
  }
  return [];
};

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
  buildGanttChart: (context: UiContext, props: UiGanttChartProps) => VNode;
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
      divider?: boolean;
    }>,
  ) => VNode[];
  openListSettings: (context: UiContext) => Promise<boolean>;
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
      divider?: boolean;
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
        items.map((item, index) =>
          item.divider
            ? { divider: true }
            : {
                name: item.name ?? `more-${index}`,
                label: item.label,
                icon: item.icon,
                onAction: item.command ?? item.onAction,
                items: item.items,
              },
        ),
      ),
    ];
  }

  openListSettings(context: UiContext) {
    return openListSettingDialog(this, context);
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
    if ((tableProps as PropData).inplaceEdit !== undefined) {
      Object.defineProperty(cellProps, "inplaceEdit", {
        value: (tableProps as PropData).inplaceEdit,
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

    if (inPlaceEdit && model?.editable && !isLock) {
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
      !props?.inplaceEdit &&
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
    const {
      editing: editingProp,
      direction,
      isReadonly,
      ...controlProps
    } = props;
    const editing = editingProp ?? context.editing;
    // 对齐老代码：编辑页中只读字段走 renderer（文本），不用 editor
    const useEditor = editing && !context.isFieldReadonly(field) && !isReadonly;
    const control = useEditor
      ? this.editFor(field, context, controlProps)
      : this.displayFor(field, context, controlProps);
    const runtime = context as any;
    const invalid = useEditor && runtime.isInvalid?.(field);
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
    const raw = String(props.region ?? groupZone(group));
    // accept legacy region names from callers
    const zone =
      raw === "secondary" || raw === "summary" ? "secondary" : "primary";
    const many = props.many === true || group.many;
    return ["mmda-group", many ? "sub" : "master", zone, props.class]
      .filter(Boolean)
      .join(" ");
  }

  /** 组内容容器：字段/表格布局归这里管，Card 只做外壳 */
  wrapGroupContent(body: VNode | VNode[], props: PropData = {}) {
    return h(
      "div",
      { class: ["mmda-group-body", props.class].filter(Boolean) },
      body,
    );
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
    return h(
      "fieldset",
      { class: this.groupWrapClass(group, props), ...rest },
      [
        h("legend", { class: "mmda-group-title" }, group.groupLabel),
        this.wrapGroupContent(body),
      ],
    );
  }

  /** Card 外壳：可折叠 header；内容由 wrapGroupContent 自管布局 */
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
      headerActions,
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
      {
        default: () => this.wrapGroupContent(body),
        actions: headerActions ? () => headerActions : undefined,
      },
    );
  }

  /** 子表 header 工具栏（对齐老代码 Panel icons）— 平面图标，文案进 tooltip */
  buildGroupHeaderActions(group: MetaUiGroup, context: UiContext) {
    const runtime = context as UiViewContext;
    const actions = runtime.getGroupActions?.(group) ?? [];
    if (!actions.length) return undefined;
    const t = (message: any) => context.t(message);
    return h(
      "div",
      { class: "mmda-group-action-group" },
      actions.map((action) => {
        const label = action.label
          ? t(action.label)
          : action.name
            ? t(`action.${action.name}`)
            : action.name;
        return this.factory.actionButton(action, t, true, {
          id: `${action.name}-${group.groupName}-button`,
          label: "",
          tooltip: action.tooltip ?? label,
          buttonType: "text",
          shape: "round",
          class: "mmda-group-action",
          "aria-label": label,
        });
      }),
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
      showGroupActions = true,
      ...fieldProps
    } = props;
    const wrapProps: PropData = {
      container,
      class: className,
      region: groupZone(group),
      many: group.many,
    };
    if (group.many && group.groupUi) {
      const rows =
        ((context.model as Record<string, any>)[group.groupName] as any[]) ??
        [];
      const groupCtx = (context as UiViewContext).subGroupContext(group);
      const readOnlyRows = !context.editing;
      if (group.displayShape === "PHOTO" && this.factory.photoGallery) {
        const shapeKey = group.shapeKey || "mediaFile";
        const uploadMediaFiles = async (
          files: File[],
          control: {
            signal: AbortSignal;
            onProgress: (progress: number) => void;
          },
        ) => {
          const runtime = context as any;
          const fetchApi = runtime.app?.api?.fetchApi;
          const apiClient = runtime.logic?.apiClient;
          const modelId = runtime.model?.id;
          let response: any;
          if (runtime.uploading?.value != null) runtime.uploading.value = true;
          try {
            if (fetchApi?.uploadFiles && apiClient && modelId != null) {
              const url = apiClient.buildEntityURL({
                service: "files",
                repository: runtime.logic.repository,
                path: String(modelId),
                action: "multi",
              });
              response = await fetchApi.uploadFiles(
                url,
                files.map((file) => ({
                  fieldName: "files",
                  data: file,
                  fileName: file.name,
                })),
                {
                  signal: control.signal,
                  onUploadProgress: (event: {
                    loaded: number;
                    total?: number;
                    progress?: number;
                  }) => {
                    const ratio =
                      event.progress ??
                      (event.total ? event.loaded / event.total : 0);
                    control.onProgress(ratio * 100);
                  },
                },
              );
            } else if (typeof runtime.uploadFiles === "function") {
              response = await runtime.uploadFiles(files, {
                repository: runtime.logic?.repository,
                path: modelId,
                action: "multi",
              });
            } else {
              throw new Error(translateMessage("upload.unsupported"));
            }

            const urls = await uploadedFileNames(response);
            if (urls.length !== files.length || urls.some((url) => !url)) {
              throw new Error(translateMessage("upload.fileCountMismatch"));
            }
            const added = [];
            for (let index = 0; index < urls.length; index += 1) {
              const item = await runtime.createSubGroupItems({
                group,
                source: {
                  [shapeKey]: urls[index],
                  mediaType: 0,
                  description: files[index]?.name ?? "",
                },
                target: runtime.model,
              });
              runtime.addSubGroupItem(group, item);
              added.push(item);
            }
            return added;
          } finally {
            if (runtime.uploading?.value != null)
              runtime.uploading.value = false;
          }
        };
        const gallery = this.factory.photoGallery(
          rows
            .map((row) => ({
              src: String(row?.[shapeKey] ?? ""),
              thumbnail: String(row?.thumbnail ?? row?.[shapeKey] ?? ""),
              alt: String(row?.description ?? ""),
              title: String(row?.description ?? ""),
              description: String(row?.description ?? ""),
              data: row,
            }))
            .filter((item) => item.src),
          {
            onItemDblclick: (item: { data?: unknown }) =>
              (context as any).subGroupItem?.(group, item.data),
          },
        );
        const uploader =
          context.editing && this.factory.filesUploader
            ? this.factory.filesUploader({
                upload: uploadMediaFiles,
                multiple: true,
                autoUpload: true,
                disabled: (context.model as any)?.id == null,
                allowedExtensions: ".bmp,.gif,.jpeg,.jpg,.png,.webp",
                dropText:
                  (context.model as any)?.id == null
                    ? (context.translate("upload.saveBeforeImage") as string)
                    : (context.translate("upload.dropImages") as string),
                chooseText: context.translate("action.chooseImage") as string,
                onSuccess: () =>
                  (context as any).app?.toast(context as any, {
                    severity: "success",
                    detail: context.translate("upload.imageSuccess"),
                    life: 3000,
                  }),
                onError: (error: unknown) =>
                  (context as any).app?.toast(context as any, {
                    severity: "error",
                    detail:
                      error instanceof Error
                        ? error.message
                        : (context.translate("upload.imageFail") as string),
                    life: 3000,
                  }),
              })
            : undefined;
        if (showGroupActions !== false) {
          wrapProps.headerActions = this.buildGroupHeaderActions(
            group,
            context,
          );
        }
        return this.wrapGroup(
          group,
          layoutFieldGroup({
            fields: [uploader, gallery].filter(Boolean) as VNode[],
            direction: "table",
            cols: 1,
          }),
          wrapProps,
        );
      }
      const groupLogic = context.getGroupLogic(group) as any;
      const nativeGridEditing = this.factory.nativeInplaceEdit === true;
      const nativeInplaceEdit =
        nativeGridEditing && groupLogic?.inplaceEdit !== false;
      const listedFields = group.groupUi.getListedFields();
      const tableFields = listedFields.length
        ? listedFields
        : group.groupUi.groups
            .filter((childGroup) => !childGroup.many)
            .flatMap((childGroup) => childGroup.fields);
      const editableFields = tableFields
        .filter((field) => {
          const fieldLogic = groupCtx.getFieldLogic(field) as any;
          return (
            !readOnlyRows &&
            (nativeGridEditing
              ? nativeInplaceEdit && fieldLogic?.cellEditable !== false
              : fieldLogic?.cellEditable === true) &&
            !groupCtx.isFieldReadonly(field) &&
            !groupCtx.isFieldHidden(field)
          );
        })
        .map((field) => field.fieldName);
      const table = this.tableWithCells(
        rows,
        group.groupUi,
        (row) => (readOnlyRows ? groupCtx : groupCtx.with(row)),
        {
          enableSort: false,
          enableGroup: false,
          showGridlines: true,
          readOnlyRows,
          // 原生 Grid 路径始终屏蔽 VUI 的“整列常驻编辑器”；
          // group 关闭时 editableFields 为空，仅保留双击弹窗编辑。
          inplaceEdit: nativeGridEditing,
          inplaceEditStart: groupLogic?.inplaceEditStart ?? "excel",
          editableFields,
          canEditCell: (item, field) => {
            const rowCtx = groupCtx.with(item);
            return (
              nativeInplaceEdit &&
              (item as { editable?: boolean }).editable !== false &&
              !rowCtx.isFieldReadonly(field) &&
              !rowCtx.isFieldHidden(field)
            );
          },
          onCellSave: (item, field, value) => {
            // item = features[i]（由 Grid 按行号解析）；直接写集合，添加只需 push。
            let normalized = value;
            if (
              field.reference &&
              (value == null || typeof value !== "object")
            ) {
              normalized =
                field.reference.refOptions.find(
                  (option) => field.reference!.valueOf(option) === value,
                ) ?? value;
            }
            MetaModel.setFieldValue(item, field, normalized);
            const rowCtx = groupCtx.with(item);
            rowCtx.setFieldValue(field, normalized);
            return !rowCtx.getFieldError?.(field);
          },
          rowStyle: hiddenDeletedSubRowStyle,
          onItemDoubleClick: (item) =>
            (context as any).subGroupItem?.(group, item),
          group,
          groupUi: group.groupUi,
        },
      );
      if (showGroupActions !== false) {
        wrapProps.headerActions = this.buildGroupHeaderActions(group, context);
      }
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

  buildGanttChart(_context: UiContext, props: UiGanttChartProps): VNode {
    const count = props.tasks?.length ?? 0;
    return h("section", { class: "mmda-gantt-stub", ...props }, [
      count
        ? h("p", `${count} tasks (skin required)`)
        : h("p", "Gantt (skin required)"),
    ]);
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
      { region: "secondary", class: "mmda-attachments", ...props },
    );
  }

  buildView(context: UiContext, props: UiViewPropsType = {}): VNode {
    const groups = context.metaui.groups.filter(
      (group) => !context.isGroupHidden(group),
    );
    const primaryCols = props.primaryCols ?? 2;
    // 主区：主表组（按 groupName）→ 子表组（按 groupIdx）
    const primary = sortViewGroups(
      groups.filter((group) => group.isPrimary()),
    ).map((group) =>
      this.buildGroup(group, context, undefined, {
        direction: "row",
        cols: primaryCols,
      }),
    );
    const summary: VNode[] = [];
    const attachments = (context.model as Record<string, any>).attachments;
    // 右边栏：附件等先渲染，概要分组始终放最后
    if (
      !context.editing &&
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
    const tails = sortViewGroups(groups.filter((group) => group.isTails())).map(
      (group) =>
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
            onRefresh: () => void runtime.search?.(),
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
  }

  /** 列表行菜单工厂：图标只解析一次，禁止 with(row)。 */
  protected createListRowMenu(
    context: UiContext,
    includeExtras = false,
  ): (row: any) => UiAction[] {
    const icons = {
      edit: this.factory.resolveIcon("edit"),
      delete: this.factory.resolveIcon("delete"),
      details: this.factory.resolveIcon("details"),
    };
    return (row) => this.listRowMenu(context, row, icons, includeExtras);
  }

  /** 列表行操作：编辑、删除、详情；扩展 actions 置于分隔线后。
   * 禁止 with(row)：索引页千行时不能为每行建 rowContext。
   */
  protected listRowMenu(
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
        pageSize: runtime.searchParam?.pager?.pageSize ?? readStoredPageSize(),
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

  confirmDialog(content: VNode, context: UiContext, props: UiDialogPropsType) {
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
    const raw = typeof source === "string" ? source.split(/[?#]/)[0] : explicit;
    const extension = (explicit || raw.split(".").pop() || "")
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
    buildGanttChart: emptyNode,
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
    openListSettings: async () => false,
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
    return this.createAction(context, "save", async () => {
      const runtime = context as any;
      const result = await runtime.save?.();
      // 创建/编辑保存成功后进详情（对话框 confirm 走 confirmAction，不经此路径）
      if (result !== false && result != null && runtime.editing) {
        const key = runtime.metaui?.primaryKey as string | undefined;
        const id =
          result?.id ??
          runtime.model?.id ??
          (key ? (result?.[key] ?? runtime.model?.[key]) : undefined);
        if (id != null && id !== "") runtime.details?.(String(id));
      }
      return result;
    });
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

import {
  defineComponent,
  h,
  onUnmounted,
  ref,
  type Component,
  type PropType,
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
  auth,
  entityActionFactory,
  EntityActionType,
  DEFAULT_PAGE_SIZE,
  defineEntity,
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
  UiListPropsType,
  UiListViewPropsType,
  UiPaginatorPropsType,
} from "./ui_list";
import type {
  UiTreeGridPropsType,
  UiTreeGridViewPropsType,
} from "./ui_tree_grid";
import { treeGridSpecFromGroup } from "./ui_tree_grid";
import {
  isImageGalleryShape,
  treeDataProvider,
  treeIdField,
} from "./ui_tree_data";
import type { UiTreeListViewPropsType } from "./ui_treelist";
import {
  collectNodeAndDescendantIds,
  treeCannotDropOn,
  treeIdOf,
  treeLabelFieldName,
  treeLabelOf,
  treeParentFieldName,
  type UiTreePropsType,
  type UiTreeViewPropsType,
} from "./ui_tree";
import {
  categoryCreateParams,
  categoryMoveParams,
  categoryTreeAuth,
  categoryTreeAuthHasAction,
} from "./ui_tree_category";
import { GenericUiLogic } from "./ui_logic";
import { resolveRepositoryModule } from "./ui_entity_view";
import type { UiGanttChartProps, UiGanttViewProps } from "./ui_gantt";
import { renderTreeView } from "./ui_tree_view";
import {
  isViewMany,
  UiViewManyKind,
  UiViewOne,
  type QrcodeProps,
  type UiViewPropsType,
  type UiViewType,
} from "./ui_view";
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
  SignupFormProps,
  SigninFormSlots,
} from "./ui_auth";
import type {
  UiDialogPropsType,
  UiMessageBoxProps,
  UiMessageBoxResult,
  UiToastProps,
} from "./ui_dialog";
import type {
  SearchForRelativeContentProps,
  SearchForRelativeProps,
  UiSearchField,
} from "./ui_filter";
import {
  UiActionDivider,
  UiContextAction,
  isActionEnabled,
  type IconResolver,
  type UiAction,
} from "./ui_action";
import type { UiButtonProps } from "./ui_button";
import { UiViewContext } from "./ui_context";
import { createHtmlOverlay, type UiOverlay } from "./ui_overlay";
import { DocxFilePreview } from "./components/DocxFilePreview";
import { MmdaGroupCard } from "./components/GroupCard";
import { XlsxFilePreview } from "./components/XlsxFilePreview";
import { translateMessage } from "../i18n/i18n";
import { deletableSelectedItems, UiBuildContext } from "./ui_build_context";

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
  buildGanttView: (context: UiContext, props: UiGanttViewProps) => VNode;
  /** @deprecated 使用 buildGanttView */
  buildGanttChart: (context: UiContext, props: UiGanttChartProps) => VNode;
  buildAttachmentGroup?: (context: UiContext, props?: PropData) => VNode;
  buildView: (context: UiContext, props?: UiViewPropsType) => VNode;
  build: (context: UiContext, extra?: Record<string, unknown>) => VNode;
  buildTree: <T = any>(props: UiTreePropsType<T>) => VNode;
  buildTreeView: <T = any>(
    props: UiTreeViewPropsType<T>,
    context?: UiContext,
  ) => VNode;
  buildListView: <T = any>(
    context: UiContext,
    props?: UiListViewPropsType<T>,
  ) => VNode;
  buildTreeGrid: <T = any>(
    rows: T[],
    metaui: MetaUi,
    rowContext: (row: T) => UiContext,
    props?: UiTreeGridPropsType<T>,
  ) => VNode;
  buildTreeGridView: <T = any>(
    context: UiContext,
    props?: UiTreeGridViewPropsType<T>,
  ) => VNode;
  buildTreeListView: <T = any>(
    context: UiContext,
    props?: UiTreeListViewPropsType<T>,
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

  protected fieldDisplayName(field: MetaUiField) {
    if (field.renderer) return field.renderer;
    if (SqlDataType.isBool(field.dataType)) return "checkedIcon";
    return "textSpan";
  }

  displayFor(field: MetaUiField, context: UiContext, props: PropData = {}) {
    const logic = context.getFieldLogic(field) as any;
    const renderer =
      logic?.customRenderer ??
      this.fldFactory[this.fieldDisplayName(field)] ??
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
   * 索引只读表：绝大多数列不进单元格模板（见 templateCellFields），禁止为每行 with(row)。
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
  }

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
  }

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
  }

  protected async loadTreeGridChildren<T>(
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
    const data = await runtime.logic?.apiClient?.searchAll?.(
      {
        pager: { pageNo: 1, pageSize: 1000 },
        queryParams,
      },
      {
        repository: runtime.logic?.repository,
        service: runtime.logic?.apiService,
      },
    );
    return (data?.list ?? []) as T[];
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
          disabled: !isActionEnabled(action, context.model, context),
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
      const groupLogic = context.getGroupLogic(group) as any;
      const customGroupView = context.editing
        ? (groupLogic?.customEditor ?? groupLogic?.customRenderer)
        : groupLogic?.customRenderer;
      if (typeof customGroupView === "function") {
        if (showGroupActions !== false) {
          wrapProps.headerActions = this.buildGroupHeaderActions(
            group,
            context,
          );
        }
        return this.wrapGroup(
          group,
          customGroupView(group, context, props),
          wrapProps,
        );
      }
      if (
        isImageGalleryShape(group.displayShape) &&
        this.factory.imageGallery
      ) {
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
        const gallery = this.factory.imageGallery(
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
      const nativeGridEditing = this.factory.nativeInplaceEdit === true;
      const nativeInplaceEdit =
        nativeGridEditing && groupLogic?.inplaceEditable !== false;
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
              ? nativeInplaceEdit && fieldLogic?.inplaceEditable !== false
              : fieldLogic?.inplaceEditable === true) &&
            !groupCtx.isFieldReadonly(field) &&
            !groupCtx.isFieldHidden(field)
          );
        })
        .map((field) => field.fieldName);
      const treeSpec = treeGridSpecFromGroup(group, rows);
      const gridProps = {
          enableSort: false,
          enableGroup: false,
          showGridlines: true,
          readOnlyRows,
          inplaceEdit: nativeGridEditing,
          inplaceEditStart: groupLogic?.inplaceEditStart ?? "excel",
          editableFields,
          canEditCell: (item: any, field: MetaUiField) => {
            const rowCtx = groupCtx.with(item);
            if (
              !(
                nativeInplaceEdit &&
                (item as { editable?: boolean }).editable !== false &&
                !rowCtx.isFieldReadonly(field) &&
                !rowCtx.isFieldHidden(field)
              )
            ) {
              return false;
            }
            // 权限列：模块 allowOps 不支持的操作不进编、不显示复选框
            if (
              SqlDataType.isBool(field.dataType) &&
              String(field.fieldName).startsWith("allow") &&
              (item as { allowOps?: number }).allowOps != null
            ) {
              const flags = auth(
                (item as { allowOps?: number }).allowOps ?? 0,
              ) as Record<string, boolean>;
              if (!flags[field.fieldName]) return false;
            }
            return true;
          },
          onCellSave: (item: any, field: MetaUiField, value: unknown) => {
            const rowCtx = groupCtx.with(item);
            if (treeSpec) {
              rowCtx.setFieldValue(field, value);
              return !rowCtx.getFieldError?.(field);
            }
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
            rowCtx.setFieldValue(field, normalized);
            return !rowCtx.getFieldError?.(field);
          },
          rowStyle: hiddenDeletedSubRowStyle,
          onItemDoubleClick: (item: any) =>
            (context as any).subGroupItem?.(group, item),
          group,
          groupUi: group.groupUi,
          isTree: Boolean(treeSpec),
          rowMenu: readOnlyRows
            ? undefined
            : (item: any) =>
                this.subGroupRowMenu(context, group, item),
        };
      const table = treeSpec
        ? this.buildTreeGrid(
            rows,
            group.groupUi,
            (row) => (readOnlyRows ? groupCtx : groupCtx.with(row)),
            {
              ...gridProps,
              ...treeSpec,
            },
          )
        : this.tableWithCells(
            rows,
            group.groupUi,
            (row) => (readOnlyRows ? groupCtx : groupCtx.with(row)),
            gridProps,
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

  buildGanttView(_context: UiContext, props: UiGanttViewProps): VNode {
    const count = props.tasks?.length ?? 0;
    return h("section", { class: "mmda-gantt-stub", ...props }, [
      count
        ? h("p", `${count} tasks (skin required)`)
        : h("p", "Gantt (skin required)"),
    ]);
  }

  buildGanttChart(context: UiContext, props: UiGanttChartProps): VNode {
    return this.buildGanttView(context, props);
  }

  build(context: UiContext, extra: Record<string, unknown> = {}): VNode {
    const runtime = context as UiViewContext;
    const view = String(runtime.view ?? "") as UiViewType;
    const factories = runtime.logic?.viewOptions;
    const option = factories?.[view]?.(runtime) ?? {};
    const merged = { ...option, ...extra } as Record<string, any>;
    if (isViewMany(view)) {
      const kind = merged.viewKind;
      if (
        merged.treeOption ||
        merged.tree ||
        kind === UiViewManyKind.categoryList ||
        kind === "categoryList"
      ) {
        return this.buildTreeListView(context, merged);
      }
      if (kind === UiViewManyKind.gantt || kind === "gantt") {
        return this.buildGanttView(context, merged);
      }
      if (kind === UiViewManyKind.treeGrid || kind === "treeGrid") {
        return this.buildTreeGridView(context, merged);
      }
      return this.buildListView(context, merged);
    }
    return this.buildView(context, merged as UiViewPropsType);
  }

  buildTree<T = any>(props: UiTreePropsType<T>): VNode {
    return this.factory.tree({
      selectionMode: props.selectionMode ?? "single",
      ...props,
    });
  }

  buildTreeView<T = any>(
    props: UiTreeViewPropsType<T>,
    context?: UiContext,
  ): VNode {
    const categoryRepo = props.repository;
    const mode = props.editMode ?? "hover";
    const reloadTick = props.reloadTick ?? { value: 0 };
    const allowDragDrop =
      props.allowDragDrop ??
      (props.editable === true ||
        Boolean(
          context &&
            categoryRepo &&
            this.resolveCategoryTreeAuth(context, props, undefined as never)
              .allowEdit,
        ));
    const wired: UiTreeViewPropsType<T> = {
      ...props,
      reloadTick,
      editMode: mode,
      allowDragDrop,
      contextMenu:
        mode === "contextMenu" && context && categoryRepo
          ? (node: T) => this.treeCategoryMenu(context, wired, node)
          : undefined,
      showHoverAdd:
        mode === "hover" && context && categoryRepo
          ? (node: T) => this.resolveCategoryTreeAuth(context, wired, node).allowCreate
          : props.showHoverAdd,
      onNodeAddChild: (node) => {
        props.onNodeAddChild?.(node);
        if (context && categoryRepo) {
          void this.openCategoryTreeDialog(
            context,
            wired,
            UiViewOne.Create,
            node,
            "child",
          );
        }
      },
      onNodeRename: (node, text) => {
        props.onNodeRename?.(node, text);
        if (context && categoryRepo) {
          void this.renameCategoryTreeNode(context, wired, node, text);
        }
      },
      onNodeMove: async (node, parent, meta) => {
        await props.onNodeMove?.(node, parent, meta);
        if (context && categoryRepo) {
          await this.moveCategoryTreeNode(context, wired, node, parent);
        }
      },
    };
    const loadChildren =
      context &&
      categoryRepo &&
      (props.preloader || context.app?.meta)
        ? (parent?: T) => this.loadCategoryTreeNodes(context, wired, parent)
        : undefined;
    return renderTreeView(this.factory, wired, loadChildren);
  }

  protected async loadCategoryTreeNodes<T>(
    context: UiContext,
    props: UiTreeViewPropsType<T>,
    parent?: T,
  ): Promise<T[]> {
    if (!parent && props.loadMode === "lazy" && props.preloader) {
      return (await props.preloader()) ?? [];
    }
    const repository = props.repository;
    if (!repository || !context.app?.meta) return props.data ?? [];
    const catLogic = await this.resolveCategoryTreeLogic(context, repository);
    const lazy = props.loadMode === "lazy";
    if (!lazy && !parent) {
      const page = await catLogic.getAll({
        pager: { pageNo: 1, pageSize: 1000 },
      });
      return (page?.list ?? []) as T[];
    }
    const parentField = treeParentFieldName(props.fields);
    const parentId = parent ? treeIdOf(parent, props.fields) : "";
    const page = await catLogic.getAll({
      pager: { pageNo: 1, pageSize: 1000 },
      queryParams: { [parentField]: parentId },
    });
    return (page?.list ?? []) as T[];
  }

  protected resolveCategoryTreeAuth<T>(
    context: UiContext,
    props: UiTreeViewPropsType<T>,
    node: T,
  ) {
    const repository = props.repository;
    const catModule =
      repository && context.app
        ? (resolveRepositoryModule(context.app, repository) ??
          context.app.findModule(repository))
        : undefined;
    const flags = node as { editable?: boolean; deletable?: boolean };
    const catAuth = categoryTreeAuth(catModule, flags);
    const listAuth = categoryTreeAuth(context.module, flags);
    return catModule?.authority && categoryTreeAuthHasAction(catAuth)
      ? catAuth
      : listAuth;
  }

  protected treeCategoryMenu<T>(
    context: UiContext,
    props: UiTreeViewPropsType<T>,
    node: T,
  ): UiAction[] {
    const repository = props.repository;
    if (!repository || node == null) return [];
    const auth = this.resolveCategoryTreeAuth(context, props, node);
    const t = (key: string) => context.t(key);
    const items: UiAction[] = [];
    if (auth.allowRead) {
      items.push({
        name: "view",
        label: t("action.view"),
        icon: this.factory.resolveIcon("details"),
        onAction: () =>
          this.openCategoryTreeDialog(context, props, UiViewOne.Details, node),
      });
    }
    if (auth.allowCreate) {
      if (items.length) items.push(UiActionDivider());
      items.push(
        {
          name: "addRoot",
          label: t("action.addRoot"),
          icon: this.factory.resolveIcon("plus"),
          onAction: () =>
            this.openCategoryTreeDialog(context, props, UiViewOne.Create, node, "root"),
        },
        {
          name: "addChild",
          label: t("action.addChild"),
          icon: this.factory.resolveIcon("plus"),
          onAction: () =>
            this.openCategoryTreeDialog(context, props, UiViewOne.Create, node, "child"),
        },
        {
          name: "addSibling",
          label: t("action.addSibling"),
          icon: this.factory.resolveIcon("plus"),
          onAction: () =>
            this.openCategoryTreeDialog(
              context,
              props,
              UiViewOne.Create,
              node,
              "sibling",
            ),
        },
      );
    }
    if (auth.allowDelete) {
      if (items.length) items.push(UiActionDivider());
      items.push({
        name: "delete",
        label: t("action.delete"),
        icon: this.factory.resolveIcon("delete"),
        onAction: () => this.deleteCategoryTreeNode(context, props, node),
      });
    }
    if (auth.allowEdit) {
      if (items.length) items.push(UiActionDivider());
      items.push(
        {
          name: "edit",
          label: t("action.edit"),
          icon: this.factory.resolveIcon("edit"),
          onAction: () =>
            this.openCategoryTreeDialog(context, props, UiViewOne.Edit, node),
        },
        {
          name: "rename",
          label: t("action.rename"),
          icon: this.factory.resolveIcon("edit"),
        },
      );
    }
    return items;
  }

  protected async resolveCategoryTreeLogic(
    context: UiContext,
    repository: string,
  ) {
    const app = context.app;
    const service =
      (context.logic as { apiService?: string } | undefined)?.apiService ??
      app?.name ??
      "base";
    const token = `${service}:${repository}Logic`;
    try {
      const injected = await app?.di.injectAsync<InstanceType<typeof GenericUiLogic>>(
        token,
      );
      if (injected) return injected;
    } catch {
      // 未注册的仓库走通用 Logic
    }
    const module =
      resolveRepositoryModule(app, repository) ?? app?.findModule(repository);
    return new GenericUiLogic(defineEntity, {
      metaUiService: app!.meta,
      repository,
      router: context.logic?.router,
      module,
      apiService: service,
    });
  }

  protected async refreshCategoryTree<T>(
    context: UiContext,
    props: UiTreeViewPropsType<T>,
    logic: { getAll?: (param: any) => Promise<{ list?: unknown[] }> },
  ) {
    if (props.onTreeRefresh) {
      await props.onTreeRefresh();
    }
    if (props.reloadTick) {
      props.reloadTick.value += 1;
      return;
    }
    if (!logic.getAll) return;
    const page = await logic.getAll({
      pager: { pageNo: 1, pageSize: 1000 },
    });
    if (props.data) {
      props.data.splice(0, props.data.length, ...((page?.list ?? []) as T[]));
    }
  }

  protected async openCategoryTreeDialog<T>(
    context: UiContext,
    props: UiTreeViewPropsType<T>,
    view: typeof UiViewOne.Create | typeof UiViewOne.Edit | typeof UiViewOne.Details,
    node: T,
    createKind?: "root" | "child" | "sibling",
  ) {
    const repository = props.repository;
    const app = context.app;
    if (!repository || !app) return;
    const catLogic = await this.resolveCategoryTreeLogic(context, repository);
    const pack = await app.meta.getPack({
      repository,
      service: catLogic.apiService,
    });
    if (!pack?.metaui) return;
    const id = view === UiViewOne.Create ? undefined : treeIdOf(node, props.fields);
    const queryParams =
      view === UiViewOne.Create
        ? categoryCreateParams(createKind ?? "root", node, props.fields)
        : undefined;
    const ctx = new UiBuildContext({
      model: (id ? { id } : {}) as any,
      metaui: pack.metaui,
      view,
      logic: catLogic,
      app,
      locale: context.locale,
    });
    await ctx.init({ path: id, queryParams });
    const editing = view !== UiViewOne.Details;
    const accepted = await app.confirmDialog(
      this.buildView(ctx, { showBreadcrumb: false }),
      ctx,
      {
        name: view,
        title: pack.metaui.displayLabel,
        width: "70vw",
        height: "80vh",
        maxHeight: "90vh",
        showFooter: editing,
        accept: editing
          ? async () => {
              const saved = await ctx.save();
              return saved !== false;
            }
          : undefined,
      },
    );
    if (!accepted && view === UiViewOne.Create) {
      const createdId = (ctx.model as { id?: string }).id;
      if (createdId) await catLogic.delete(createdId);
      return;
    }
    if (accepted || view === UiViewOne.Details) {
      if (accepted) await this.refreshCategoryTree(context, props, catLogic);
    }
  }

  protected async deleteCategoryTreeNode<T>(
    context: UiContext,
    props: UiTreeViewPropsType<T>,
    node: T,
  ) {
    const repository = props.repository;
    if (!repository) return;
    const title =
      (node as { categoryName?: string; label?: string; name?: string })
        .categoryName ??
      (node as { label?: string }).label ??
      (node as { name?: string }).name ??
      treeIdOf(node, props.fields);
    const result = await this.confirm(context, {
      message:
        context.translate?.("confirmation.delete", { it: title }) ??
        `Delete ${title}?`,
      buttons: ["yes", "no"],
    });
    if (result !== "yes") return;
    const catLogic = await this.resolveCategoryTreeLogic(context, repository);
    const ids = collectNodeAndDescendantIds(
      props.data ?? [],
      node,
      props.fields,
    );
    if (ids.length > 1 && catLogic.deleteAll) {
      await catLogic.deleteAll(ids);
    } else {
      for (const id of ids) await catLogic.delete(id);
    }
    const listLogic = context.logic as {
      currentCategory?: { id?: string; categoryID?: string };
    };
    const currentId =
      listLogic.currentCategory?.id ?? listLogic.currentCategory?.categoryID;
    if (currentId && ids.includes(String(currentId))) {
      listLogic.currentCategory = undefined;
      const runtime = context as { search?: () => Promise<unknown> };
      void runtime.search?.();
    }
    await this.refreshCategoryTree(context, props, catLogic);
    props.onNodeDelete?.(node);
  }

  protected async renameCategoryTreeNode<T>(
    context: UiContext,
    props: UiTreeViewPropsType<T>,
    node: T,
    text: string,
  ) {
    const repository = props.repository;
    if (!repository) return;
    const field = treeLabelFieldName(props.fields);
    const nextText = text.trim();
    const prev = String((node as Record<string, unknown>)[field] ?? "").trim();
    if (!nextText || nextText === prev) return;
    const next = { ...(node as object), [field]: nextText } as T;
    const catLogic = await this.resolveCategoryTreeLogic(context, repository);
    await catLogic.save(next as any);
    await this.refreshCategoryTree(context, props, catLogic);
  }

  protected async moveCategoryTreeNode<T>(
    context: UiContext,
    props: UiTreeViewPropsType<T>,
    node: T,
    parent: T | undefined,
  ) {
    const repository = props.repository;
    if (!repository) return;
    if (!this.resolveCategoryTreeAuth(context, props, node).allowEdit) return;
    const treeData = props.data?.length
      ? props.data
      : ([node, parent].filter(Boolean) as T[]);
    if (parent && treeCannotDropOn(node, parent, treeData, props.fields)) {
      throw new Error("invalid tree drop");
    }
    const parentKey = treeParentFieldName(props.fields);
    const parentId = parent ? treeIdOf(parent, props.fields) : "";
    const prevId = String(
      (node as Record<string, unknown>)[parentKey] ??
        (node as Record<string, unknown>).parentCatID ??
        (node as Record<string, unknown>).parentId ??
        "",
    );
    if (parentId === prevId) return;
    const next = categoryMoveParams(node, parent, props.fields) as T;
    const catLogic = await this.resolveCategoryTreeLogic(context, repository);
    await catLogic.save(next as any);
    Object.assign(node as object, next);
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

  protected listViewParts<T>(
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
  }

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
  }

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
        filterModel: runtime.searchParam?.filterModel,
        loadFilterOptions:
          props.loadFilterOptions ??
          ((field) => runtime.loadReferenceOptions(field)),
        onFilterModelChange: (filterModel) => {
          runtime.searchParam.filterModel =
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

  /** 子表行删：可点看 itemDeletableFunc 与 row.deletable；确认后走 beforeItemRemove。 */
  protected subGroupRowMenu(
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
    buildGanttView: emptyNode,
    buildGanttChart: emptyNode,
    buildView: emptyNode,
    build: emptyNode,
    buildTree: emptyNode,
    buildTreeView: emptyNode,
    buildTreeGrid: emptyNode,
    buildTreeGridView: emptyNode,
    buildListView: emptyNode,
    buildTreeListView: emptyNode,
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
      const deletable = deletableSelectedItems(selected);
      if (deletable.length === 0) {
        return this.builder.toast(context, {
          severity: "error",
          detail:
            runtime.translate?.("invalid.noDeletable") ??
            "Selected records cannot be deleted.",
        });
      }
      const result = await this.builder.confirm(context, {
        message:
          deletable.length === 1
            ? (runtime.translate?.("confirmation.delete", {
                it: runtime.metaui?.displayLabel,
              }) ?? "Delete this item?")
            : (runtime.translate?.("confirmation.deleteAll", {
                it: runtime.metaui?.displayLabel,
              }) ?? "Delete selected items?"),
        buttons: ["yes", "no"],
      });
      if (result !== "yes") return;
      const ids = deletable
        .map((item: any) => item?.id)
        .filter((id: unknown) => id != null)
        .map((id: unknown) => String(id));
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
    const configured =
      (typeof action.role === "string" && action.role.trim()) ||
      action.param?.hint ||
      (action as { displayHint?: string }).displayHint;
    action.role = configured ? String(configured) : "warning";
    return this.fromEntity(context, action);
  }
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
      const self = props.builder as AbstractUiBuilder;
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
      const self = props.builder as AbstractUiBuilder;
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
          listViewParts: AbstractUiBuilder["listViewParts"];
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
});

function selectedTreeLabel<T>(
  spec?: UiTreeViewPropsType<T>,
): string {
  if (!spec) return "";
  if (spec.selectedNode) return treeLabelOf(spec.selectedNode, spec.fields);
  return "";
}

export { unimplemented };
export type { SearchForRelativeContentProps, MetaUiGroup, VNodeChild };

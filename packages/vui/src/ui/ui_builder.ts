import { h, type Component, type VNode, type VNodeArrayChildren, type VNodeChild } from "vue";
import type { EntityUrlParam, MetaUi, MetaUiField, MetaUiGroup, Module, UiBuilder as CoreUiBuilder, UiContext as UiContextContract } from "@mmda/core";
import { openListSettingDialog } from "./components/ListSettingView";
import {
  AppLayout,
  type PropData,
  type UiLayout,
  type UiSlots,
} from "./ui_layout";
import type {
  UiFactory,
  UiFieldFactory,
  UiFieldRenderer,
  UiGroupRenderer,
} from "./ui_factory";
import type {
  UiListPropsType,
  UiListViewPropsType,
  UiPaginatorPropsType,
} from "./ui_list";
import type {
  UiTreeGridPropsType,
  UiTreeGridViewPropsType,
} from "./ui_tree_grid";
import type { UiTreeListViewPropsType } from "./ui_treelist";
import type { UiTreePropsType, UiTreeViewPropsType } from "./ui_tree";
import type { UiGanttChartProps, UiGanttViewProps } from "./ui_gantt";
import {
  isViewMany,
  UiViewManyKind,
  type UiViewPropsType,
  type UiViewType,
} from "./ui_view";
import type {
  AppScaffoldProps,
  AppSideBarProps,
  AppTopBarProps,
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
  SearchForRelativeContentProps,
  SearchForRelativeProps,
  UiSearchField,
} from "./ui_filter";
import type { UiAction } from "./ui_action";
import type { UiButtonProps } from "./ui_button";
import { UiViewContext } from "./ui_context";
import { createHtmlOverlay, type UiOverlay } from "./ui_overlay";
import { DocxFilePreview } from "./components/DocxFilePreview";
import { XlsxFilePreview } from "./components/XlsxFilePreview";
import type {
  UiDialogPropsType,
  UiMessageBoxProps,
  UiToastProps,
} from "./ui_dialog";
import { UiActionFactory } from "./builders/actions";
import { attachFormBuilder } from "./builders/form";
import { attachListBuilder } from "./builders/list";
import { attachTreeBuilder } from "./builders/tree";

/** VUI 内部运行时；toast/confirm/dialog 的会话参数是 core 的 `UiContext`。 */
type UiContext = UiViewContext<any>;

export { UiActionFactory };

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

export interface VueUiBuilderHost {
  factory: UiFactory;
  fldFactory: UiFieldFactory;
  labelFor: (field: MetaUiField, props?: PropData) => VNode;
  editFor: (field: MetaUiField, context: UiContext, props?: PropData) => VNode;
  displayFor: (field: MetaUiField, context: UiContext, props?: PropData) => VNode;
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
  dropdownMenuButton: (
    props: UiButtonProps,
    actions: UiAction[],
    slots?: UiSlots,
  ) => VNode;
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
  toast: (context: UiContextContract, props: UiToastProps | PropData) => Promise<any>;
  confirm: (
    context: UiContextContract,
    props: UiMessageBoxProps | PropData,
  ) => Promise<boolean>;
  dialog: (
    content: VNode | VNode[],
    context: UiContextContract,
    props?: UiDialogPropsType,
  ) => Promise<unknown>;
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

export abstract class VueUiBuilder implements CoreUiBuilder {
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

  toast(_context: UiContextContract, props: UiToastProps | PropData) {
    this.overlay.toast(props as UiToastProps);
    return Promise.resolve();
  }

  async confirm(_context: UiContextContract, props: UiMessageBoxProps | PropData) {
    return (await this.overlay.confirm(props as UiMessageBoxProps)) === "yes";
  }

  dialog(
    content: VNode | VNode[],
    _context: UiContextContract,
    props?: UiDialogPropsType,
  ) {
    return this.overlay.dialog(
      content as VNode,
      (props ?? { name: "dialog" }) as UiDialogPropsType,
    );
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

  declare labelFor: VueUiBuilderHost["labelFor"];
  declare editFor: VueUiBuilderHost["editFor"];
  declare displayFor: VueUiBuilderHost["displayFor"];
  declare displayCellFor: VueUiBuilderHost["displayCellFor"];
  declare buildField: VueUiBuilderHost["buildField"];
  declare buildResponsiveField: VueUiBuilderHost["buildResponsiveField"];
  declare buildGroup: VueUiBuilderHost["buildGroup"];
  declare buildGroupCard: NonNullable<VueUiBuilderHost["buildGroupCard"]>;
  declare buildGroupFieldSet: NonNullable<VueUiBuilderHost["buildGroupFieldSet"]>;
  declare buildBpmnDiagram: VueUiBuilderHost["buildBpmnDiagram"];
  declare buildGanttView: VueUiBuilderHost["buildGanttView"];
  declare buildGanttChart: VueUiBuilderHost["buildGanttChart"];
  declare buildAttachmentGroup: NonNullable<VueUiBuilderHost["buildAttachmentGroup"]>;
  declare buildView: VueUiBuilderHost["buildView"];
  declare buildTree: VueUiBuilderHost["buildTree"];
  declare buildTreeView: VueUiBuilderHost["buildTreeView"];
  declare buildListView: VueUiBuilderHost["buildListView"];
  declare buildTreeGrid: VueUiBuilderHost["buildTreeGrid"];
  declare buildTreeGridView: VueUiBuilderHost["buildTreeGridView"];
  declare buildTreeListView: VueUiBuilderHost["buildTreeListView"];
  declare buildCustomView: VueUiBuilderHost["buildCustomView"];
  declare buildList: VueUiBuilderHost["buildList"];
  declare buildTable: VueUiBuilderHost["buildTable"];
  declare buildColumns: VueUiBuilderHost["buildColumns"];
  declare buildPaginator: VueUiBuilderHost["buildPaginator"];
  declare fieldDisplayName: (field: MetaUiField) => string;
  declare groupWrapClass: (group: MetaUiGroup, props?: PropData) => string;
  declare wrapGroupContent: (body: VNode | VNode[], props?: PropData) => VNode;
  declare wrapGroup: (
    group: MetaUiGroup,
    body: VNode | VNode[],
    props?: PropData,
  ) => VNode;
  declare buildGroupHeaderActions: (
    group: MetaUiGroup,
    context: UiViewContext<any>,
  ) => VNode | undefined;
  declare tableWithCells: (
    rows: any[],
    metaui: MetaUi,
    rowContext: (row: any) => UiContext,
    tableProps?: UiListPropsType<any>,
  ) => VNode;
  declare listViewParts: (
    context: UiContext,
    props?: UiListViewPropsType<any>,
  ) => {
    runtime: any;
    toolbar: VNode | null;
    searchbar: VNode | null;
    list: VNode;
    paginator: VNode | null;
  };
}

attachFormBuilder(VueUiBuilder);
attachListBuilder(VueUiBuilder);
attachTreeBuilder(VueUiBuilder);

const emptyNode = () => h("div");

/** 无皮肤时的占位 Builder，弹层一律取消。 */
export function createStubUiBuilder(): VueUiBuilderHost {
  const factory = {
    layout: {} as UiLayout,
    resolveIcon: (icon: string) => icon,
  } as UiFactory;
  const builder: VueUiBuilderHost = {
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
    confirm: async () => false,
    dialog: async () => false,
    buildDocxFilePreview: emptyNode,
    buildXlsxFilePreview: emptyNode,
    buildFilePreview: emptyNode,
  };
  return builder;
}

export { unimplemented };
export type { SearchForRelativeContentProps, MetaUiGroup, VNodeChild };

export type UiBuilder = VueUiBuilderHost;

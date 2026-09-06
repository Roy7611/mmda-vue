import { h, type Component, type VNode, type VNodeArrayChildren, type VNodeChild } from "vue";
import type { EntityUrlParam, MetaUi, MetaUiField, MetaUiGroup, Module, UiBuilder as CoreUiBuilder, UiContext as CoreUiContext } from "@mmda/core";
import { openListSettingDialog } from "../../components/ListSettingView";
import {
  AppLayout,
  type PropData,
  type UiLayout,
  type UiSlots,
} from "../layout/layout";
import type {
  UiFactory,
  UiFieldFactory,
  UiFieldRenderer,
  UiGroupRenderer,
} from "../factory/factory";
import type {
  UiListPropsType,
  UiListViewPropsType,
  UiPaginatorPropsType,
} from "../factory/list";
import type {
  UiTreeGridPropsType,
  UiTreeGridViewPropsType,
} from "../factory/tree_grid";
import type { UiTreeListViewPropsType } from "../factory/tree_category_list";
import type { UiTreePropsType, UiTreeViewPropsType } from "../factory/tree";
import type { UiGanttChartProps, UiGanttViewProps } from "../factory/gantt";
import {
  isViewMany,
  UiViewManyKind,
  type UiViewPropsType,
  type UiViewType,
} from "../../contexts/view";
import type {
  AppScaffoldProps,
  AppSideBarProps,
  AppTopBarProps,
  ModuleBreadcrumbProps,
  ModuleSearchbarProps,
  ModuleToolbarProps,
} from "../../app/app";
import { resolveColorPalette, type MmdaColorPalette } from "../../app/theme";
import type {
  SigninFormProps,
  SignupFormProps,
  SigninFormSlots,
} from "../factory/auth";
import type {
  SearchForRelativeContentProps,
  SearchForRelativeProps,
  UiSearchField,
} from "../factory/filter";
import type { UiAction } from "../factory/action";
import type { UiButtonProps } from "../factory/button";
import type { VueUiContext } from "../../contexts/vue_ui_context";
import { createHtmlOverlay, type UiOverlay } from "./overlay";
import { DocxFilePreview } from "../../components/DocxFilePreview";
import { XlsxFilePreview } from "../../components/XlsxFilePreview";
import type {
  UiDialogPropsType,
  UiMessageBoxProps,
  UiToastProps,
} from "../factory/dialog";
import { UiActionFactory } from "./actions";
import { attachFormBuilder } from "./form";
import { attachListBuilder } from "./list";
import { attachTreeBuilder } from "./tree";

export { UiActionFactory };

/** Vue 拼屏会话；弹层 API 仍走 core `UiContext`。 */
type UiContext = VueUiContext<any>;

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

const unimplemented = (name: string) => {
  throw new Error(
    `UiBuilder.${name} requires a skin package (@mmda/vui-primevue or @mmda/vui-syncfusion).`,
  );
};

/**
 * Vue 拼屏抽象实现：实现 core `UiBuilder`，模板方法填好共用拼屏。
 * 皮肤再 `extends VueUiBuilder`（SyncfusionUiBuilder / PrimeVueUiBuilder / …）。
 * 取代旧名 AbstractUiBuilder。vui 生态里类型就用本类，不要另造 Host 接口。
 */
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

  openListSettings(context: CoreUiContext) {
    return openListSettingDialog(this, context as VueUiContext);
  }

  build(context: CoreUiContext, extra: Record<string, unknown> = {}): VNode {
    const runtime = context as VueUiContext;
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
        return this.buildTreeListView(runtime, merged);
      }
      if (kind === UiViewManyKind.gantt || kind === "gantt") {
        return this.buildGanttView(runtime, merged);
      }
      if (kind === UiViewManyKind.treeGrid || kind === "treeGrid") {
        return this.buildTreeGridView(runtime, merged);
      }
      return this.buildListView(runtime, merged);
    }
    return this.buildView(runtime, merged as UiViewPropsType);
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

  toast(_context: CoreUiContext, props: UiToastProps | PropData) {
    this.overlay.toast(props as UiToastProps);
    return Promise.resolve();
  }

  async confirm(_context: CoreUiContext, props: UiMessageBoxProps | PropData) {
    return (await this.overlay.confirm(props as UiMessageBoxProps)) === "yes";
  }

  dialog(
    content: VNode | VNode[],
    _context: CoreUiContext,
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

  // form / list / tree mixin（模板方法共用部分）
  declare labelFor: (field: MetaUiField, props?: PropData) => VNode;
  declare editFor: (field: MetaUiField, context: UiContext, props?: PropData) => VNode;
  declare displayFor: (field: MetaUiField, context: UiContext, props?: PropData) => VNode;
  declare displayCellFor: (
    field: MetaUiField,
    row: any,
    context: UiContext,
    props?: PropData,
  ) => VNode | VNode[];
  declare buildField: UiFieldRenderer;
  declare buildResponsiveField: UiFieldRenderer;
  declare buildGroup: UiGroupRenderer;
  declare buildGroupCard: (
    group: MetaUiGroup,
    body: VNode | VNode[],
    props?: PropData,
  ) => VNode;
  declare buildGroupFieldSet: (
    group: MetaUiGroup,
    body: VNode | VNode[],
    props?: PropData,
  ) => VNode;
  declare buildBpmnDiagram: (
    flowTrails: any[],
    context: UiContext,
    props?: PropData,
  ) => VNode;
  declare buildGanttView: (context: UiContext, props: UiGanttViewProps) => VNode;
  /** @deprecated 使用 buildGanttView */
  declare buildGanttChart: (context: UiContext, props: UiGanttChartProps) => VNode;
  declare buildAttachmentGroup: (context: UiContext, props?: PropData) => VNode;
  declare buildView: (context: UiContext, props?: UiViewPropsType) => VNode;
  declare buildTree: <T = any>(props: UiTreePropsType<T>) => VNode;
  declare buildTreeView: <T = any>(
    props: UiTreeViewPropsType<T>,
    context?: UiContext,
  ) => VNode;
  declare buildListView: <T = any>(
    context: UiContext,
    props?: UiListViewPropsType<T>,
  ) => VNode;
  declare buildTreeGrid: <T = any>(
    rows: T[],
    metaUi: MetaUi,
    rowContext: (row: T) => UiContext,
    props?: UiTreeGridPropsType<T>,
  ) => VNode;
  declare buildTreeGridView: <T = any>(
    context: UiContext,
    props?: UiTreeGridViewPropsType<T>,
  ) => VNode;
  declare buildTreeListView: <T = any>(
    context: UiContext,
    props?: UiTreeListViewPropsType<T>,
  ) => VNode;
  declare buildCustomView: <T = any>(
    context: UiContext,
    props?: UiListViewPropsType<T>,
  ) => VNode;
  declare buildList: <T = any>(context: UiContext, props?: UiListPropsType<T>) => VNode;
  declare buildTable: <T = any>(
    context: UiContext,
    props?: UiListPropsType<T>,
  ) => VNode;
  declare buildColumns: <T = any>(
    metaUi: MetaUi,
    context: UiContext,
    props?: UiListPropsType<T>,
  ) => VNode[];
  declare buildPaginator: (context: UiContext, props?: UiPaginatorPropsType) => VNode;
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
    context: VueUiContext<any>,
  ) => VNode | undefined;
  declare tableWithCells: (
    rows: any[],
    metaUi: MetaUi,
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
export function createStubUiBuilder(): VueUiBuilder {
  const factory = {
    layout: {} as UiLayout,
    resolveIcon: (icon: string) => icon,
  } as UiFactory;
  const stub: any = {
    factory,
    fldFactory: {} as UiFieldFactory,
    labelFor: (field: { displayLabel?: string }) => h("label", field.displayLabel),
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
    buildColumns: (): unknown[] => [],
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
    setColorScheme: (): void => undefined,
    setColorPalette: (): void => undefined,
    buildLoading: emptyNode,
    buildError: emptyNode,
    buildModuleBreadcrumb: emptyNode,
    buildModuleToolbar: emptyNode,
    dropdownMenuButton: emptyNode,
    moreMenuButton: (): unknown[] => [],
    openListSettings: async () => false,
    buildSearchField: emptyNode,
    buildSearchForm: emptyNode,
    buildModuleSearchbar: emptyNode,
    buildSearchForRelative: emptyNode,
    buildSigninForm: emptyNode,
    buildSignupForm: emptyNode,
    overlay: createHtmlOverlay(),
    overlayHost: undefined,
    toast: async (): Promise<void> => undefined,
    confirm: async () => false,
    dialog: async () => false,
    buildDocxFilePreview: emptyNode,
    buildXlsxFilePreview: emptyNode,
    buildFilePreview: emptyNode,
  };
  return stub as VueUiBuilder;
}

export { unimplemented };
export type { SearchForRelativeContentProps, MetaUiGroup, VNodeChild };

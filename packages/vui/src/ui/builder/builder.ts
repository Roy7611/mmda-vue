import { h, type Component, type VNode, type VNodeArrayChildren, type VNodeChild } from "vue";
import type { EntityUrlParam, MetaUiField, MetaUiGroup, Module, UiBuilder as CoreUiBuilder, UiContext as CoreUiContext } from "@mmda/core";
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
} from "../factory/factory";
import {
  unimplementedChartFactory,
  type UiChartFactory,
} from "../factory/chart";
import {
  diagramReadonlyOf,
  unimplementedDiagramPlugin,
  type UiDiagramPlugin,
  type UiDiagramViewProps,
} from "../factory/diagram";
import {
  unimplementedMarkdownEditorPlugin,
  type UiMarkdownEditorPlugin,
  type UiMarkdownEditorProps,
} from "../factory/markdown_editor";
import {
  unimplementedImageEditorPlugin,
  type UiImageEditorPlugin,
  type UiImageEditorProps,
} from "../factory/image_editor";
import {
  unimplementedKanbanPlugin,
  type UiKanbanPlugin,
  type UiKanbanViewProps,
} from "../factory/kanban";
import {
  unimplementedGanttPlugin,
  type UiGanttChartProps,
  type UiGanttPlugin,
  type UiGanttViewProps,
} from "../factory/gantt";
import {
  unimplementedRibbonPlugin,
  type UiRibbonPlugin,
  type UiRibbonProps,
} from "../factory/ribbon";
import {
  unimplementedSchedulerPlugin,
  type UiSchedulerPlugin,
  type UiSchedulerViewProps,
} from "../factory/scheduler";
import {
  unimplementedPivotPlugin,
  type UiPivotPlugin,
  type UiPivotTableProps,
} from "../factory/pivot_table";
import {
  unimplementedAiAssistantPlugin,
  type UiAiAssistantPlugin,
  type UiAiAssistantProps,
} from "../factory/ai_assistant";
import {
  bindTimelineFactory,
  type UiTimelinePlugin,
} from "../factory/timeline";
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
import type { VueUiContext } from "../../contexts/vue_ui_context";
import { createHtmlOverlay, type UiOverlay } from "./overlay";
import { DocxFilePreview } from "../../components/DocxFilePreview";
import { XlsxFilePreview } from "../../components/XlsxFilePreview";
import type {
  UiConfirmProps,
  UiDialogProps,
  UiToastProps,
} from "../factory/dialog";
import { UiActionFactory } from "./actions";
import { WithForm } from "./form";
import { WithList } from "./list_view";
import { WithTree } from "./tree";

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
 * form / list / tree 用 Handbook mixin 叠在 `VueUiBuilderBase` 上。
 */
export abstract class VueUiBuilderBase {
  readonly actionFactory: UiActionFactory;
  chartFactory: UiChartFactory = unimplementedChartFactory();
  diagramPlugin: UiDiagramPlugin = unimplementedDiagramPlugin();
  markdownEditorPlugin: UiMarkdownEditorPlugin =
    unimplementedMarkdownEditorPlugin();
  imageEditorPlugin: UiImageEditorPlugin = unimplementedImageEditorPlugin();
  kanbanPlugin: UiKanbanPlugin = unimplementedKanbanPlugin();
  ganttPlugin: UiGanttPlugin = unimplementedGanttPlugin();
  ribbonPlugin: UiRibbonPlugin = unimplementedRibbonPlugin();
  schedulerPlugin: UiSchedulerPlugin = unimplementedSchedulerPlugin();
  pivotPlugin: UiPivotPlugin = unimplementedPivotPlugin();
  aiAssistantPlugin: UiAiAssistantPlugin = unimplementedAiAssistantPlugin();
  timelinePlugin: UiTimelinePlugin | null = null;

  constructor(
    public readonly factory: UiFactory,
    public readonly fldFactory: UiFieldFactory,
    public readonly layout: UiLayout,
    public overlay: UiOverlay = createHtmlOverlay(),
  ) {
    this.actionFactory = new UiActionFactory(
      this as unknown as VueUiBuilder,
      factory.resolveIcon,
    );
    if (typeof factory.timeline === "function") {
      bindTimelineFactory(factory, () => this.timelinePlugin);
    }
  }

  setChartFactory(factory: UiChartFactory): this {
    this.chartFactory = factory;
    return this;
  }

  setDiagramPlugin(plugin: UiDiagramPlugin): this {
    this.diagramPlugin = plugin;
    return this;
  }

  setMarkdownEditorPlugin(plugin: UiMarkdownEditorPlugin): this {
    this.markdownEditorPlugin = plugin;
    return this;
  }

  setImageEditorPlugin(plugin: UiImageEditorPlugin): this {
    this.imageEditorPlugin = plugin;
    return this;
  }

  setKanbanPlugin(plugin: UiKanbanPlugin): this {
    this.kanbanPlugin = plugin;
    return this;
  }

  setGanttPlugin(plugin: UiGanttPlugin): this {
    this.ganttPlugin = plugin;
    return this;
  }

  setRibbonPlugin(plugin: UiRibbonPlugin): this {
    this.ribbonPlugin = plugin;
    return this;
  }

  setSchedulerPlugin(plugin: UiSchedulerPlugin): this {
    this.schedulerPlugin = plugin;
    return this;
  }

  setPivotPlugin(plugin: UiPivotPlugin): this {
    this.pivotPlugin = plugin;
    return this;
  }

  setAiAssistantPlugin(plugin: UiAiAssistantPlugin): this {
    this.aiAssistantPlugin = plugin;
    return this;
  }

  setTimelinePlugin(plugin: UiTimelinePlugin | null): this {
    this.timelinePlugin = plugin;
    return this;
  }

  buildGanttView(_context: any, props: UiGanttViewProps): VNode {
    return this.ganttPlugin.ganttView(props);
  }

  buildGanttChart(context: any, props: UiGanttChartProps): VNode {
    return this.buildGanttView(context, props);
  }

  buildRibbon(props: UiRibbonProps): VNode {
    return this.ribbonPlugin.ribbon(props);
  }

  buildSchedulerView(_context: any, props: UiSchedulerViewProps): VNode {
    return this.schedulerPlugin.schedulerView(props);
  }

  buildPivotTable(props: UiPivotTableProps): VNode {
    return this.pivotPlugin.pivotTable(props);
  }

  buildDiagramView(context: any, props: UiDiagramViewProps): VNode {
    const readonly = diagramReadonlyOf(props, String(context?.view ?? ""));
    return this.diagramPlugin.diagramView({ ...props, readonly });
  }

  buildMarkdownEditor(props: UiMarkdownEditorProps): VNode {
    return this.markdownEditorPlugin.markdownEditor(props);
  }

  buildImageEditor(props: UiImageEditorProps): VNode {
    return this.imageEditorPlugin.imageEditor(props);
  }

  buildKanbanView(props: UiKanbanViewProps): VNode {
    return this.kanbanPlugin.kanbanView(props);
  }

  buildAiAssistant(props: UiAiAssistantProps): VNode {
    return this.aiAssistantPlugin.aiAssistant(props);
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

  openListSettings(context: CoreUiContext) {
    return openListSettingDialog(
      this as any,
      context as any,
    );
  }

  buildContainer(
    subContainer: VNode | VNodeArrayChildren,
    props?: PropData,
  ): VNode {
    return unimplemented("buildContainer") as VNode;
  }
  buildHeader(
    content: VNode | VNodeArrayChildren,
    props?: PropData,
  ): VNode {
    return unimplemented("buildHeader") as VNode;
  }
  buildAside(
    content: VNode | VNodeArrayChildren,
    props?: PropData,
  ): VNode {
    return unimplemented("buildAside") as VNode;
  }
  buildMain(
    content: VNode | VNodeArrayChildren,
    props?: PropData,
  ): VNode {
    return unimplemented("buildMain") as VNode;
  }
  buildFooter(
    content: VNode | VNodeArrayChildren,
    props?: PropData,
  ): VNode {
    return unimplemented("buildFooter") as VNode;
  }
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
  buildAppTopBar(props?: AppTopBarProps): VNode {
    return unimplemented("buildAppTopBar") as VNode;
  }
  buildAppSideBar(props?: AppSideBarProps): VNode {
    return unimplemented("buildAppSideBar") as VNode;
  }
  buildAppMenu(modules: Module[], props?: PropData): VNode {
    return unimplemented("buildAppMenu") as VNode;
  }
  buildLoading(context: UiContext, props?: PropData): VNode {
    return unimplemented("buildLoading") as VNode;
  }
  buildError(context: UiContext, props?: PropData): VNode {
    return unimplemented("buildError") as VNode;
  }
  buildModuleBreadcrumb(
    context: UiContext,
    props: ModuleBreadcrumbProps,
  ): VNode {
    return unimplemented("buildModuleBreadcrumb") as VNode;
  }
  buildModuleToolbar(
    context: UiContext,
    props: ModuleToolbarProps,
    slots?: UiSlots,
  ): VNode {
    return unimplemented("buildModuleToolbar") as VNode;
  }
  buildSearchField(
    field: UiSearchField,
    context: UiContext,
    props: PropData,
  ): VNode {
    return unimplemented("buildSearchField") as VNode;
  }
  buildSearchForm(context: UiContext, props?: PropData): VNode {
    return unimplemented("buildSearchForm") as VNode;
  }
  buildModuleSearchbar(
    context: UiContext,
    props: ModuleSearchbarProps,
  ): VNode {
    return unimplemented("buildModuleSearchbar") as VNode;
  }
  buildSearchPage(context: UiContext, props?: ModuleSearchbarProps) {
    const content = this.buildModuleSearchbar(context, props ?? {});
    return this.dialog(content, context, {
      title: context.t("action.search"),
    });
  }
  buildSearchForRelative(
    context: UiContext,
    field: MetaUiField,
    props: SearchForRelativeProps,
  ): VNode {
    return unimplemented("buildSearchForRelative") as VNode;
  }
  buildSigninForm(
    props: SigninFormProps,
    slots?: SigninFormSlots,
  ): VNode {
    return unimplemented("buildSigninForm") as VNode;
  }
  buildSignupForm(props: SignupFormProps): VNode {
    return unimplemented("buildSignupForm") as VNode;
  }

  toast(_context: CoreUiContext, props: Record<string, unknown>) {
    this.overlay.toast(props as UiToastProps);
    return Promise.resolve();
  }

  async confirm(_context: CoreUiContext, props: Record<string, unknown>) {
    return this.overlay.confirm(props as unknown as UiConfirmProps);
  }

  dialog(
    content: VNode | VNode[],
    _context: CoreUiContext,
    props?: Record<string, unknown>,
  ) {
    return this.overlay.dialog(
      content as VNode,
      (props as UiDialogProps | undefined) ?? { title: "" },
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
}

/**
 * Vue 拼屏入口：本体 + WithForm / WithList / WithTree。
 * 皮肤继续 `extends VueUiBuilder`。
 * mixin 推断成员为属性，这里用 interface 合成方法签名，皮肤才能 `override`。
 */
export interface VueUiBuilder {
  buildGroupCard(
    group: MetaUiGroup,
    body: VNode | VNode[],
    props?: PropData,
  ): VNode;
  buildAttachmentGroup(context: any, props?: PropData): VNode;
  buildGanttView(context: any, props: UiGanttViewProps): VNode;
  buildGanttChart(context: any, props: UiGanttChartProps): VNode;
  buildRibbon(props: UiRibbonProps): VNode;
  buildSchedulerView(context: any, props: UiSchedulerViewProps): VNode;
  buildPivotTable(props: UiPivotTableProps): VNode;
  buildBpmnDiagram(
    flowTrails: any[],
    context: any,
    props?: PropData,
  ): VNode;
  buildDiagramView(context: any, props: UiDiagramViewProps): VNode;
  buildKanbanView(props: UiKanbanViewProps): VNode;
  buildListView(context: any, props?: any): VNode;
  buildView(context: any, props?: UiViewPropsType): VNode;
  groupWrapClass(group: MetaUiGroup, props?: PropData): string;
}

export abstract class VueUiBuilder
  extends WithTree(WithList(WithForm(VueUiBuilderBase)))
  implements CoreUiBuilder
{
  build(context: CoreUiContext, extra: Record<string, unknown> = {}): VNode {
    const runtime = context as any;
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
      if (kind === UiViewManyKind.scheduler || kind === "scheduler") {
        return this.buildSchedulerView(runtime, merged);
      }
      if (kind === UiViewManyKind.treeGrid || kind === "treeGrid") {
        return this.buildTreeGridView(runtime, merged);
      }
      return this.buildListView(runtime, merged);
    }
    return this.buildView(runtime, merged as UiViewPropsType);
  }
}

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
    buildView: emptyNode,
    build: emptyNode,
    buildTree: emptyNode,
    buildTreeView: emptyNode,
    buildTreeGrid: emptyNode,
    buildTreeGridView: emptyNode,
    buildListView: emptyNode,
    buildTreeListView: emptyNode,
    buildCustomView: emptyNode,
    buildGrid: emptyNode,
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
    openListSettings: async () => false,
    buildSearchField: emptyNode,
    buildSearchForm: emptyNode,
    buildModuleSearchbar: emptyNode,
    buildSearchForRelative: emptyNode,
    buildSigninForm: emptyNode,
    buildSignupForm: emptyNode,
    overlay: createHtmlOverlay(),
    overlayHost: undefined,
    chartFactory: unimplementedChartFactory(),
    setChartFactory(factory: UiChartFactory) {
      this.chartFactory = factory;
      return this;
    },
    diagramPlugin: unimplementedDiagramPlugin(),
    setDiagramPlugin(plugin: UiDiagramPlugin) {
      this.diagramPlugin = plugin;
      return this;
    },
    buildDiagramView(context: any, props: UiDiagramViewProps) {
      const readonly = diagramReadonlyOf(props, String(context?.view ?? ""));
      return this.diagramPlugin.diagramView({ ...props, readonly });
    },
    markdownEditorPlugin: unimplementedMarkdownEditorPlugin(),
    setMarkdownEditorPlugin(plugin: UiMarkdownEditorPlugin) {
      this.markdownEditorPlugin = plugin;
      return this;
    },
    buildMarkdownEditor(props: UiMarkdownEditorProps) {
      return this.markdownEditorPlugin.markdownEditor(props);
    },
    imageEditorPlugin: unimplementedImageEditorPlugin(),
    setImageEditorPlugin(plugin: UiImageEditorPlugin) {
      this.imageEditorPlugin = plugin;
      return this;
    },
    buildImageEditor(props: UiImageEditorProps) {
      return this.imageEditorPlugin.imageEditor(props);
    },
    kanbanPlugin: unimplementedKanbanPlugin(),
    setKanbanPlugin(plugin: UiKanbanPlugin) {
      this.kanbanPlugin = plugin;
      return this;
    },
    buildKanbanView(props: UiKanbanViewProps) {
      return this.kanbanPlugin.kanbanView(props);
    },
    ganttPlugin: unimplementedGanttPlugin(),
    setGanttPlugin(plugin: UiGanttPlugin) {
      this.ganttPlugin = plugin;
      return this;
    },
    buildGanttView(_context: any, props: UiGanttViewProps) {
      return this.ganttPlugin.ganttView(props);
    },
    buildGanttChart(context: any, props: UiGanttChartProps) {
      return this.buildGanttView(context, props);
    },
    ribbonPlugin: unimplementedRibbonPlugin(),
    setRibbonPlugin(plugin: UiRibbonPlugin) {
      this.ribbonPlugin = plugin;
      return this;
    },
    buildRibbon(props: UiRibbonProps) {
      return this.ribbonPlugin.ribbon(props);
    },
    schedulerPlugin: unimplementedSchedulerPlugin(),
    setSchedulerPlugin(plugin: UiSchedulerPlugin) {
      this.schedulerPlugin = plugin;
      return this;
    },
    buildSchedulerView(_context: any, props: UiSchedulerViewProps) {
      return this.schedulerPlugin.schedulerView(props);
    },
    pivotPlugin: unimplementedPivotPlugin(),
    setPivotPlugin(plugin: UiPivotPlugin) {
      this.pivotPlugin = plugin;
      return this;
    },
    buildPivotTable(props: UiPivotTableProps) {
      return this.pivotPlugin.pivotTable(props);
    },
    aiAssistantPlugin: unimplementedAiAssistantPlugin(),
    setAiAssistantPlugin(plugin: UiAiAssistantPlugin) {
      this.aiAssistantPlugin = plugin;
      return this;
    },
    timelinePlugin: null as UiTimelinePlugin | null,
    setTimelinePlugin(plugin: UiTimelinePlugin | null) {
      this.timelinePlugin = plugin;
      return this;
    },
    buildAiAssistant(props: UiAiAssistantProps) {
      return this.aiAssistantPlugin.aiAssistant(props);
    },
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

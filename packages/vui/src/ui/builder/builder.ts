import { defineComponent, h, type Component, type VNode, type VNodeArrayChildren, type VNodeChild } from "vue";
import {
  uiCssClass,
  type Entity,
  type EntityUrlParam,
  type MetaUiField,
  type MetaUiGroup,
  type Module,
  type UiAppSideMenuProps,
  type UiBuilder as CoreUiBuilder,
  type UiContext as CoreUiContext,
  type UiDialogAction,
} from "@mmda/core";
import { VueAppSideMenu } from "../../components/AppSideMenu";
import { openTableSettingDialog } from "../../components/TableSettingView";
import {VueUiLayout, type UiProps, type UiLayout, type UiSlots} from "../layout/layout";
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
  UiViewMany,
  UiViewManyKind,
  UiViewOne,
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
import { VueUiContext } from "../../contexts/vue_ui_context";
import { createHtmlOverlay, type UiOverlay } from "./overlay";
import { DocxFilePreview } from "../../components/DocxFilePreview";
import { XlsxFilePreview } from "../../components/XlsxFilePreview";
import type {
  UiConfirmProps,
  UiDialogProps,
  UiEntityDialogOptions,
  UiListViewProps,
  UiMessageProps,
  UiToastProps,
  UiViewProps,
} from "@mmda/core";
import { UiActionFactory } from "./actions";
import { WithForm } from "./form";
import { WithList } from "./list_view";
import { WithTree } from "./tree";
import { attachFieldRowApi } from "../factory/field_row";

export { UiActionFactory };

/** 拼屏方法参数用 core UiContext；需要 Vue 会话时再 as VueUiContext。 */
type UiContext = CoreUiContext;

export interface ImportOrExportParam extends EntityUrlParam {
  handlerFn?: (context: UiContext, response: any) => void;
  importFn?: (context: UiContext, model: any) => void;
  exportFn?: (context: UiContext, model: any) => void;
}

export const isNullish = (value: unknown): value is null | undefined =>
  value == null;

export const hasProp = (name: string, props?: UiProps) =>
  props != null && !isNullish(props[name]);

export const hasPropEx = <T>(name: string, value: T, props?: UiProps) =>
  props != null && props[name] === value;

export function getProp<T>(
  name: string,
  props?: UiProps,
  remove = false,
): T | undefined {
  if (!hasProp(name, props)) return undefined;
  const value = props![name] as T;
  if (remove) delete props![name];
  return value;
}

export function addProp<T>(name: string, value: T, props: UiProps = {}) {
  props[name] = value;
  return props;
}

export function addDefaultProp<T>(
  name: string,
  value: T,
  props: UiProps = {},
) {
  if (!hasProp(name, props)) props[name] = value;
  return props;
}

export function addDefaultProps(addingProps: UiProps, props: UiProps = {}) {
  for (const [name, value] of Object.entries(addingProps)) {
    if (!hasProp(name, props)) props[name] = value;
  }
  return props;
}

export function ignoreNullishProps(props: UiProps) {
  for (const name of Object.keys(props)) {
    if (isNullish(props[name])) delete props[name];
  }
  return props;
}

export function copyProps(
  dest: UiProps,
  src: UiProps,
  names: string[],
  ignoreNullish = true,
) {
  for (const name of names) {
    if (!ignoreNullish || !isNullish(src[name])) dest[name] = src[name];
  }
}

export function selectProps(
  src: UiProps,
  names: string[],
  ignoreNullish = true,
) {
  const dest: UiProps = {};
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
    public readonly fieldFactory: UiFieldFactory,
    public readonly layout: UiLayout,
    public overlay: UiOverlay = createHtmlOverlay(),
  ) {
    attachFieldRowApi(fieldFactory, layout);
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

  openTableSettings(context: CoreUiContext) {
    return openTableSettingDialog(
      this as any,
      context as any,
    );
  }

  buildContainer(
    subContainer: VNode | VNodeArrayChildren,
    props?: UiProps,
  ): VNode {
    return unimplemented("buildContainer") as VNode;
  }
  buildHeader(
    content: VNode | VNodeArrayChildren,
    props?: UiProps,
  ): VNode {
    return unimplemented("buildHeader") as VNode;
  }
  buildAside(
    content: VNode | VNodeArrayChildren,
    props?: UiProps,
  ): VNode {
    return unimplemented("buildAside") as VNode;
  }
  buildMain(
    content: VNode | VNodeArrayChildren,
    props?: UiProps,
  ): VNode {
    return unimplemented("buildMain") as VNode;
  }
  buildFooter(
    content: VNode | VNodeArrayChildren,
    props?: UiProps,
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
    // 壳走 layout.scaffold；本方法仅兼容旧 AppShell 调用。
    return this.layout.scaffold({
      variant,
      topBar: invoke(props.topBar) as VNode | undefined,
      nav: invoke(props.sideBar) as VNode | undefined,
      page: invoke(props.body) as VNode | undefined,
      bottomBar: invoke(props.bottomBar) as VNode | undefined,
    });
  }
  buildAppTopBar(props?: AppTopBarProps): VNode {
    return unimplemented("buildAppTopBar") as VNode;
  }
  buildAppSideBar(props: AppSideBarProps = { modules: [], header: () => null }): VNode {
    return this.buildAppSideMenu({
      modules: props.modules,
      logo: props.header,
      footer: props.footer,
    });
  }
  buildAppSideMenu(props: UiAppSideMenuProps<VNode> = {}): VNode {
    return h(VueAppSideMenu, props as any);
  }
  buildAppMenu(modules: Module[], props?: UiProps): VNode {
    return unimplemented("buildAppMenu") as VNode;
  }
  buildLoading(context: UiContext, props?: UiProps): VNode {
    return unimplemented("buildLoading") as VNode;
  }
  buildError(context: UiContext, props?: UiProps): VNode {
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
    props: UiProps,
  ): VNode {
    return unimplemented("buildSearchField") as VNode;
  }
  buildSearchForm(context: UiContext, props?: UiProps): VNode {
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
    props?: SigninFormProps,
    slots?: SigninFormSlots,
  ): VNode {
    return unimplemented("buildSigninForm") as VNode;
  }

  buildSignupForm(props?: SignupFormProps): VNode {
    return unimplemented("buildSignupForm") as VNode;
  }

  toast(_context: CoreUiContext, props: Record<string, unknown>) {
    this.overlay.toast(props as UiToastProps);
    return Promise.resolve();
  }

  message(context: CoreUiContext, props: UiMessageProps) {
    const runtime = context as VueUiContext & {
      many?: boolean;
      pageNotice?: { value: UiMessageProps | null };
    };
    if (runtime.many || !runtime.pageNotice) {
      this.overlay.toast({
        severity: props.severity,
        title: undefined,
        message: props.content,
      });
      return;
    }
    runtime.pageNotice.value = {
      ...props,
      content: props.content ?? "",
      severity: props.severity ?? "info",
      showCloseIcon: props.showCloseIcon !== false,
      showIcon: props.showIcon !== false,
      variant: props.variant ?? "filled",
      visible: props.visible !== false,
    };
  }

  async confirm(_context: CoreUiContext, props: UiConfirmProps) {
    return this.overlay.confirm(props);
  }

  /** 纯弹层：只出窗，不注入实体 save 等策略。 */
  dialog(
    content: VNode | VNode[],
    context: CoreUiContext,
    props?: Record<string, unknown>,
  ) {
    const dialogProps: UiDialogProps = {
      title: "",
      ...(props as UiDialogProps | undefined),
    };
    return this.overlay.dialog(content as VNode, dialogProps, context);
  }

  /**
   * 实体编辑/新建弹窗。藏模块工具栏；底栏默认 okCancel；
   * `onAccept`（如 save）由调用方经 `dlgProps` 传入。
   */
  async editDialog(
    context: CoreUiContext,
    props?: UiEntityDialogOptions<VNode, UiViewProps>,
  ) {
    return this.runInDialog(context, async () => {
      const viewProps: UiViewProps = {
        showToolbar: false,
        ...props?.viewProps,
      };
      const content = this.buildEditView(context, viewProps);
      return this.dialog(content, context, {
        buttons: "okCancel",
        showFooter: true,
        ...props?.dlgProps,
      });
    });
  }

  /**
   * 实体详情弹窗（只读）。藏工具栏、默认无底栏；Esc / 点蒙层可关。
   */
  async detailsDialog(
    context: CoreUiContext,
    props?: UiEntityDialogOptions<VNode, UiViewProps>,
  ) {
    return this.runInDialog(context, async () => {
      const viewProps: UiViewProps = {
        showToolbar: false,
        ...props?.viewProps,
      };
      const content = this.buildDetailsView(context, viewProps);
      return this.dialog(content, context, {
        showFooter: false,
        closeOnEscape: true,
        closeOnOverlay: true,
        ...props?.dlgProps,
      });
    });
  }

  /**
   * 实体选择弹窗。内容走 {@link buildSelectView}。
   * 标题按单选/多选统一；SearchBar 在列表工具栏，不进标题栏。
   */
  async selectDialog(
    context: CoreUiContext,
    props?: UiEntityDialogOptions<VNode, UiListViewProps>,
  ) {
    return this.runInDialog(context, async () => {
      const runtime = context as any;
      const viewProps: UiListViewProps = {
        showSearchbar: true,
        showBreadcrumb: false,
        ...props?.viewProps,
      };
      const entityLabel =
        runtime.metaUi?.displayLabel ??
        runtime.metaUi?.objName ??
        "";
      const view = String(runtime.view ?? "");
      const isMany =
        view === UiViewMany.SelectMany ||
        String(view).toLowerCase().includes("many");
      const defaultTitle =
        runtime.t?.(
          isMany ? "view.selectManyEntity" : "view.selectOneEntity",
          { entity: entityLabel },
        ) ?? entityLabel;
      const dlgProps: UiDialogProps<VNode> = {
        buttons: "okCancel",
        showFooter: true,
        ...props?.dlgProps,
      };
      if (dlgProps.title == null || dlgProps.title === "") {
        dlgProps.title = defaultTitle;
      }
      const self = this;
      const SelectHost = defineComponent({
        name: "MmdaSelectDialogHost",
        setup() {
          return () =>
            h(
              "div",
              {
                class: uiCssClass("select-dialog", "body"),
                style: {
                  display: "flex",
                  flexDirection: "column",
                  flex: "1 1 auto",
                  height: "100%",
                  minHeight: 0,
                  overflow: "hidden",
                },
              },
              [self.buildSelectView(context, viewProps)],
            );
        },
      });
      return this.dialog(h(SelectHost), context, dlgProps as Record<string, unknown>);
    });
  }

  /**
   * 在选择窗等已打开对话框上再叠创建/编辑/详情。
   * ok 后刷新 parent 列表并勾选该行。
   */
  async openNestEntityDialog<E extends object = object>(
    parent: CoreUiContext,
    view: "create" | "edit" | "details",
    item?: E,
  ): Promise<{ action: UiDialogAction; entity?: E }> {
    const parentRuntime = parent as any;
    const logic = parentRuntime.logic;
    const metaUi = parentRuntime.metaUi;
    const app = parentRuntime.app;
    if (!logic || !metaUi || !app) {
      return { action: "cancel" };
    }

    const viewOne =
      view === "create"
        ? UiViewOne.Create
        : view === "edit"
          ? UiViewOne.Edit
          : UiViewOne.Details;
    const key = metaUi.primaryKey ?? "id";
    const id =
      item != null
        ? String(
            (item as Record<string, unknown>)[key] ??
              (item as Entity).id ??
              "",
          ) || undefined
        : undefined;

    const ctx = new VueUiContext({
      model: (id ? { id } : {}) as any,
      metaUi,
      view: viewOne,
      logic,
      app,
      locale: parentRuntime.locale,
      translate: parentRuntime.translateFn,
    });
    await ctx.init(id ? { path: id } : undefined);

    const dlgProps = {
      title: metaUi.displayLabel,
      width: "70vw",
      height: "80vh",
      maxHeight: "90vh",
    };
    const viewProps = { showBreadcrumb: false };
    const editing = viewOne !== UiViewOne.Details;
    const action = editing
      ? await this.editDialog(ctx, {
          dlgProps: {
            ...dlgProps,
            onAccept: async () => (await ctx.save()) !== false,
          },
          viewProps,
        })
      : await this.detailsDialog(ctx, { dlgProps, viewProps });

    if (action !== "ok" && viewOne === UiViewOne.Create) {
      const createdId = (ctx.model as Entity).id;
      if (createdId) await logic.delete(createdId);
      return { action };
    }

    const entity = ctx.model as E;
    if (action === "ok" && editing) {
      await parentRuntime.search?.();
      const entityId = String(
        (entity as Record<string, unknown>)[key] ??
          (entity as Entity).id ??
          "",
      );
      if (entityId) {
        const list = (parentRuntime.model as { list?: Entity[] } | undefined)
          ?.list;
        const found = Array.isArray(list)
          ? list.find(
              (row) =>
                String(
                  (row as Record<string, unknown>)[key] ?? row.id ?? "",
                ) === entityId,
            )
          : undefined;
        const selected = (found ?? entity) as Entity;
        const isMulti =
          parentRuntime.selectionMode === "multiple" ||
          String(parentRuntime.view ?? "").toLowerCase().includes("many");
        if (isMulti) {
          const prev = (parentRuntime.selectedItems ?? []) as Entity[];
          const without = prev.filter(
            (row) =>
              String(
                (row as Record<string, unknown>)[key] ?? row.id ?? "",
              ) !== entityId,
          );
          parentRuntime.selectedItems = [...without, selected];
        } else {
          parentRuntime.selectedItems = [selected];
        }
      }
      return { action, entity };
    }

    return { action, entity: editing ? entity : undefined };
  }

  /** 标记会话在对话框内（try/finally 复位）。 */
  protected async runInDialog<T>(
    context: CoreUiContext,
    run: () => Promise<T>,
  ): Promise<T> {
    const runtime = context as any;
    const previous = runtime.isInDialog;
    runtime.isInDialog = true;
    try {
      return await run();
    } finally {
      runtime.isInDialog = previous;
    }
  }

  buildDocxFilePreview(source: string | ArrayBuffer, props: UiProps = {}) {
    return h(DocxFilePreview, { source, ...props });
  }

  buildXlsxFilePreview(source: string | ArrayBuffer, props: UiProps = {}) {
    return h(XlsxFilePreview, { source, ...props });
  }

  buildFilePreview(source: string | ArrayBuffer, props: UiProps = {}) {
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
    props?: UiProps,
  ): VNode;
  buildAttachmentGroup(context: any, props?: UiProps): VNode;
  buildGanttView(context: any, props: UiGanttViewProps): VNode;
  buildGanttChart(context: any, props: UiGanttChartProps): VNode;
  buildRibbon(props: UiRibbonProps): VNode;
  buildSchedulerView(context: any, props: UiSchedulerViewProps): VNode;
  buildPivotTable(props: UiPivotTableProps): VNode;
  buildBpmnDiagram(
    flowTrails: any[],
    context: any,
    props?: UiProps,
  ): VNode;
  buildDiagramView(context: any, props: UiDiagramViewProps): VNode;
  buildKanbanView(props: UiKanbanViewProps): VNode;
  buildListView(context: any, props?: any): VNode;
  buildView(context: any, props?: UiViewPropsType): VNode;
  groupWrapClass(group: MetaUiGroup, props?: UiProps): string;
}

export abstract class VueUiBuilder
  extends WithTree(WithList(WithForm(VueUiBuilderBase)))
  implements CoreUiBuilder
{
  build(context: CoreUiContext, props: Record<string, unknown> = {}): VNode {
    return this.buildEntityView(context, props as any);
  }

  /** 实体屏共享实现（many → 列表/树…；one → 表单）。 */
  buildEntityView(
    context: CoreUiContext,
    props: Record<string, unknown> = {},
  ): VNode {
    const runtime = context as any;
    const view = String(runtime.view ?? "") as UiViewType;
    const factories = runtime.logic?.viewOptions;
    const option = factories?.[view]?.(runtime) ?? {};
    const merged = { ...option, ...props } as Record<string, any>;
    if (isViewMany(view)) {
      const kind = merged.viewKind;
      if (
        merged.treeOption ||
        merged.tree ||
        kind === UiViewManyKind.categoryList ||
        kind === "categoryList"
      ) {
        return this.buildExplorerView(runtime, merged);
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

  buildIndexView(context: CoreUiContext, props?: UiListViewProps): VNode {
    return this.buildEntityView(context, props as any);
  }

  buildSelectView(context: CoreUiContext, props?: UiListViewProps): VNode {
    return this.buildEntityView(context, props as any);
  }

  buildDetailsView(context: CoreUiContext, props?: UiViewProps): VNode {
    return this.buildView(context, props as UiViewPropsType);
  }

  buildEditView(context: CoreUiContext, props?: UiViewProps): VNode {
    return this.buildView(context, props as UiViewPropsType);
  }

  /** 左树右表；旧名 `buildTreeListView`。 */
  buildExplorerView(context: CoreUiContext, props?: Record<string, unknown>): VNode {
    return this.buildTreeListView(context as any, props as any);
  }

  /** 主表字段组（`group.many === false`）。 */
  buildFieldGroup(
    group: MetaUiGroup,
    context: CoreUiContext,
    props?: UiProps,
  ): VNode {
    return this.buildGroup(group, context as any, undefined, props);
  }

  /** 子表组（`group.many === true`）。 */
  buildSubGroup(
    group: MetaUiGroup,
    context: CoreUiContext,
    props?: UiProps,
  ): VNode {
    return this.buildGroup(group, context as any, undefined, props);
  }
}

const emptyNode = () => h("div");

/** 无皮肤时的占位 Builder，弹层一律取消。 */
export function createStubUiBuilder(): VueUiBuilder {
  const factory = {
    layout: new VueUiLayout(),
    resolveIcon: (icon: string) => icon,
  } as unknown as UiFactory;
  const stub: any = {
    factory,
    layout: factory.layout,
    fieldFactory: {} as UiFieldFactory,
    labelFor: (field: { displayLabel?: string }) => h("label", field.displayLabel),
    editFor: emptyNode,
    displayFor: emptyNode,
    displayCellFor: emptyNode,
    buildField: emptyNode,
    buildResponsiveField: emptyNode,
    buildGroup: emptyNode,
    buildBpmnDiagram: emptyNode,
    buildView: emptyNode,
    buildEntityView: emptyNode,
    buildIndexView: emptyNode,
    buildSelectView: emptyNode,
    buildDetailsView: emptyNode,
    buildEditView: emptyNode,
    build: emptyNode,
    editDialog: async () => "cancel" as const,
    detailsDialog: async () => "cancel" as const,
    selectDialog: async () => "cancel" as const,
    openNestEntityDialog: async () => ({ action: "cancel" as const }),
    buildTree: emptyNode,
    buildTreeView: emptyNode,
    buildTreeGrid: emptyNode,
    buildTreeGridView: emptyNode,
    buildListView: emptyNode,
    buildTreeListView: emptyNode,
    buildExplorerView: emptyNode,
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
    buildAppSideMenu: emptyNode,
    buildAppMenu: emptyNode,
    setColorScheme: (): void => undefined,
    setColorPalette: (): void => undefined,
    buildLoading: emptyNode,
    buildError: emptyNode,
    buildModuleBreadcrumb: emptyNode,
    buildModuleToolbar: emptyNode,
    openTableSettings: async () => false,
    buildSearchField: emptyNode,
    buildSearchForm: emptyNode,
    buildModuleSearchbar: emptyNode,
    buildSearchForRelative: emptyNode,
    buildSigninForm: emptyNode,
    buildSignupForm: emptyNode,
    buildFieldGroup: emptyNode,
    buildSubGroup: emptyNode,
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
    message: (): void => undefined,
    confirm: async () => false,
    dialog: async () => 'cancel' as const,
    buildDocxFilePreview: emptyNode,
    buildXlsxFilePreview: emptyNode,
    buildFilePreview: emptyNode,
  };
    attachFieldRowApi(stub.fieldFactory as any, factory.layout as any);
  return stub as VueUiBuilder;
}

export { unimplemented };
export type { SearchForRelativeContentProps, MetaUiGroup, VNodeChild };

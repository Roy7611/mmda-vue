import { defineComponent, h, type Component, type VNode, type VNodeChild } from "vue";
import {
  AbstractUiBuilder,
  moduleChain,
  uiCssClass,
  UiPluginName,
  type Entity,
  type EntityUrlParam,
  type MetaUi,
  type MetaUiGroup,
  type Module,
  type UiAppSideMenuProps,
  type UiBuilder as CoreUiBuilder,
  type UiContext as CoreUiContext,
  type UiDialogAction,
  type UiDiagramProps,
  type UiDetailsTopbarProps,
  type UiEditTopbarProps,
  type UiGanttProps,
  type UiIndexTopbarProps,
  type UiKanbanProps,
  type UiModuleBreadcrumbProps,
  type UiSchedulerProps,
  type UiTimelineProps,
} from "@mmda/core";
import { VueAppSideMenu } from "../components/AppSideMenu";
import { openTableSettingDialog } from "../components/TableSettingView";
import { logListPaint } from "./builder/list_query";
import {VuiLayout, type VuiTileSlots} from "./layout";
import type { UiProps } from "@mmda/core";
import type {
  VuiFactory,
  VuiFieldFactory,
} from "./factory";
import { mixPluginHost } from "./plugins/host";
import {
  isViewMany,
  UiViewMany,
  UiViewManyKind,
  UiViewOne,
  type VuiViewProps,
  type UiViewType,
} from "../contexts/view";
import type {
  AppScaffoldProps,
  AppSideBarProps,
  AppTopBarProps,
  ModuleSearchbarProps,
} from "../app/app";
import {
  FONT_SCALE_RATIO,
  resolveColorPalette,
  resolveFontScale,
  type MmdaColorPalette,
  type MmdaFontScale,
} from "../app/theme";
import type {
  SigninFormProps,
  SignupFormProps,
  SigninFormSlots,
} from "./factory/auth";
import type {
  SearchForRelativeContentProps,
  VuiSearchField,
} from "./factory/filter";
import type { UiAction } from "./factory/action";
import { VuiContext } from "../contexts/vue_ui_context";
import type { VuiOverlay } from "./overlay";
import type {
  UiConfirmProps,
  UiDialogProps,
  UiEntityDialogOptions,
  UiListViewProps,
  UiMessageProps,
  UiToastProps,
  UiViewProps,
} from "@mmda/core";
import { VuiActionFactory } from "./builder/actions";
import { WithForm } from "./builder/form";
import { WithList } from "./builder/list_view";
import { ListFilterBarView } from "./builder/list_filter_bar";
import { WithTree } from "./builder/tree_view";
import {
  paintDetailsTopbar,
  paintEditTopbar,
  paintIndexTopbar,
} from "./builder/topbar";

export { VuiActionFactory };


export interface ImportOrExportParam extends EntityUrlParam {
  handlerFn?: (context: CoreUiContext, response: any) => void;
  importFn?: (context: CoreUiContext, model: any) => void;
  exportFn?: (context: CoreUiContext, model: any) => void;
}

const unimplemented = (name: string) => {
  throw new Error(
    `UiBuilder.${name} requires a skin package (@mmda/vui-primevue or @mmda/vui-syncfusion).`,
  );
};

/** 无皮肤时的弹层兜底：不弹、确认取消、对话框返回 cancel。 */
const noopOverlay: VuiOverlay = {
  toast: (): void => undefined,
  message: (): void => undefined,
  confirm: async (): Promise<boolean> => false,
  dialog: async (): Promise<UiDialogAction> => 'cancel',
  closeTopDialog: async (): Promise<void> => undefined,
};

/**
 * Vue 拼屏抽象实现：实现 core `UiBuilder`，模板方法填好共用拼屏。
 * 皮肤再 `extends VuiBuilder`（SfUiBuilder / PrimeUiBuilder / …）。
 * form / list / tree 用 Handbook mixin 叠在 `VuiBuilderBase` 上。
 */
export abstract class VuiBuilderBase extends AbstractUiBuilder<VNode> {
  readonly actionFactory: VuiActionFactory;

  constructor(
    public readonly factory: VuiFactory,
    public readonly fieldFactory: VuiFieldFactory,
    public readonly layout: VuiLayout,
    public overlay: VuiOverlay = noopOverlay,
  ) {
    super(factory, fieldFactory, layout, layout);
    this.actionFactory = new VuiActionFactory(
      this as unknown as VuiBuilder,
      factory.resolveIcon,
    );
  }

  /** 模板方法依赖的视图拼装，由 mixin 组合后的子类实现。 */
  abstract buildEditView(context: CoreUiContext, props?: UiViewProps): VNode;
  abstract buildDetailsView(context: CoreUiContext, props?: UiViewProps): VNode;
  abstract buildSelectView(
    context: CoreUiContext,
    props?: UiListViewProps,
  ): VNode;

  get overlayHost(): Component | undefined {
    return undefined;
  }

  /** {@link buildGantt} 的别名，兼容旧调用。 */
  buildGanttChart(context: CoreUiContext, props?: UiGanttProps): VNode {
    return this.buildGantt(context, props);
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

  setFontScale(scale: MmdaFontScale) {
    if (typeof document === "undefined") return;
    const resolved = resolveFontScale(scale);
    document.documentElement.dataset.mmdaFontScale = resolved;
    document.documentElement.style.setProperty(
      "--mmda-font-scale",
      String(FONT_SCALE_RATIO[resolved]),
    );
  }

  openTableSettings(context: CoreUiContext) {
    return openTableSettingDialog(
      this as any,
      context as any,
    );
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
      logo: () => props.header() as VNode,
      footer: props.footer ? () => props.footer!() as VNode : undefined,
    });
  }
  buildAppSideMenu(props: UiAppSideMenuProps<VNode> = {}): VNode {
    return h(VueAppSideMenu, props as any);
  }
  buildAppMenu(modules: Module[], props?: UiProps): VNode {
    return unimplemented("buildAppMenu") as VNode;
  }
  buildModuleBreadcrumb(
    context: CoreUiContext,
    props: UiModuleBreadcrumbProps = {},
  ): VNode {
    const { module, label } = props;
    if (!module) {
      return this.factory.breadcrumb!({
        items: [{ label: label || context.title || "" }],
        class: "mmda-breadcrumb",
      });
    }
    const chain = moduleChain(module);
    const items = chain.map((item, index) => {
      const leaf = index === chain.length - 1 && !label;
      return {
        key: item.moduleCode,
        label: item.moduleLabel ?? item.moduleName,
        icon: item.moduleIcon || undefined,
        to: leaf || !item.moduleUrl ? undefined : item.moduleUrl,
      };
    });
    if (label) {
      items.push({
        key: `${module.moduleCode}-title`,
        label,
        icon: undefined,
        to: undefined,
      });
    }
    return this.factory.breadcrumb!({
      items,
      class: "mmda-breadcrumb",
    });
  }
  buildIndexTopbar(
    context: CoreUiContext,
    props?: UiIndexTopbarProps,
    slots?: VuiTileSlots,
  ): VNode {
    return paintIndexTopbar(this as unknown as VuiBuilder, context, props ?? {}, slots);
  }
  buildDetailsTopbar(
    context: CoreUiContext,
    props?: UiDetailsTopbarProps,
    slots?: VuiTileSlots,
  ): VNode {
    return paintDetailsTopbar(this as unknown as VuiBuilder, context, props ?? {}, slots);
  }
  buildEditTopbar(
    context: CoreUiContext,
    props?: UiEditTopbarProps,
    slots?: VuiTileSlots,
  ): VNode {
    return paintEditTopbar(this as unknown as VuiBuilder, context, props ?? {}, slots);
  }
  buildSearchField(
    field: VuiSearchField,
    context: CoreUiContext,
    props: UiProps,
  ): VNode {
    return unimplemented("buildSearchField") as VNode;
  }
  buildModuleSearchbar(
    context: CoreUiContext,
    props?: UiProps,
  ): VNode {
    return unimplemented("buildModuleSearchbar") as VNode;
  }
  buildFilterBar(context: CoreUiContext, props?: Record<string, unknown>): VNode {
    return h(ListFilterBarView, {
      factory: this.factory,
      context: context as any,
      extra: props ?? {},
    });
  }
  // buildSearchView(context: CoreUiContext, props: ModuleSearchbarProps) {
  //   const content = this.buildModuleSearchbar(context, props ?? {});
  //   return this.dialog(content, context, {
  //     title: context.t("action.search"),
  //   });
  // }
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
    const runtime = context as VuiContext & {
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

    const ctx = new VuiContext({
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
    const plugin = this.plugin(UiPluginName.office);
    if (plugin) {
      return plugin.buildUi(undefined as any, {
        source,
        extension: "docx",
        ...props,
      } as any);
    }
    return h(
      "p",
      { class: "mmda-file-preview-missing" },
      "DOCX preview requires @mmda/vuix-office",
    );
  }

  buildXlsxFilePreview(source: string | ArrayBuffer, props: UiProps = {}) {
    const plugin = this.plugin(UiPluginName.office);
    if (plugin) {
      return plugin.buildUi(undefined as any, {
        source,
        extension: "xlsx",
        ...props,
      } as any);
    }
    return h(
      "p",
      { class: "mmda-file-preview-missing" },
      "XLSX preview requires @mmda/vuix-office",
    );
  }

  buildFilePreview(
    source: string | ArrayBuffer,
    props: UiProps & {
      extension?: string
      height?: string | number
      title?: string
    } = {},
  ) {
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

export abstract class VuiBuilder
  extends WithTree(WithList(WithForm(VuiBuilderBase)))
  implements CoreUiBuilder
{
  build(context: CoreUiContext, props: Record<string, unknown> = {}): VNode {
    const view = String((context as any).view ?? "");
    if (view === UiViewMany.SelectOne || view === UiViewMany.SelectMany) {
      return this.buildSelectView(context, props as UiListViewProps);
    }
    if (isViewMany(view)) {
      return this.buildIndexView(context, props as UiListViewProps);
    }
    if (view === UiViewOne.Edit || view === UiViewOne.Create) {
      return this.buildEditView(context, props as UiViewProps);
    }
    return this.buildDetailsView(context, props as UiViewProps);
  }

  buildIndexView(context: CoreUiContext, props?: UiListViewProps): VNode {
    const gated = entityPageGate(this, context);
    if (gated) return gated;
    return h(IndexPage, {
      builder: this,
      context,
      spec: mergeNamedViewProps(context, props),
    });
  }

  buildSelectView(context: CoreUiContext, props?: UiListViewProps): VNode {
    const gated = entityPageGate(this, context);
    if (gated) return gated;
    return assembleIndexScreen(this, context, mergeNamedViewProps(context, props));
  }

  buildDetailsView(context: CoreUiContext, props?: UiViewProps): VNode {
    const gated = entityPageGate(this, context);
    if (gated) return gated;
    return this.buildView(
      context,
      mergeNamedViewProps(context, props) as VuiViewProps,
    );
  }

  buildEditView(context: CoreUiContext, props?: UiViewProps): VNode {
    const gated = entityPageGate(this, context);
    if (gated) return gated;
    return this.buildView(
      context,
      mergeNamedViewProps(context, props) as VuiViewProps,
    );
  }

  /** 左树右表；旧名 `buildTreeListView`。 */
  buildExplorer(context: CoreUiContext, props?: Record<string, unknown>): VNode {
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

function mergeNamedViewProps(
  context: CoreUiContext,
  props?: object,
) {
  const runtime = context as any;
  const view = String(runtime.view ?? "") as UiViewType;
  const option = runtime.logic?.viewOptions?.[view]?.(runtime) ?? {};
  return { ...option, ...(props ?? {}) } as Record<string, any>;
}

/**
 * 具名入口：error 独占整页。
 * 首次打开由 EntityView pageLoading 挡；context 已在时 loading 是翻页 / 筛选 / 刷新，
 * 不能拆掉表格，否则分页器卸载后会回到第 1 页。
 */
function entityPageGate(
  builder: VuiBuilder,
  context: CoreUiContext,
): VNode | null {
  const runtime = context as any;
  const err = runtime.error?.value;
  if (err) {
    return (
      builder.factory.error?.({
        error: err,
        onRetry: () => {
          runtime.error.value = null;
          if (runtime.many) void runtime.search?.();
          else void runtime.refresh?.();
        },
      }) ?? h("div", { class: "mmda-entity-page-error" }, String(err))
    );
  }
  return null;
}

const IndexPage = defineComponent({
  name: "IndexPage",
  props: {
    builder: { type: Object, required: true },
    context: { type: Object, required: true },
    spec: { type: Object, default: () => ({}) },
  },
  setup(props) {
    let assembled = false;
    return () => {
      const builder = props.builder as VuiBuilder;
      const context = props.context as CoreUiContext;
      const reason = assembled ? "rerender" : "mount";
      assembled = true;
      logListPaint("index-shell", {
        objName: (context as any).metaUi?.objName,
        reason,
      });
      return assembleIndexScreen(builder, context, props.spec ?? {});
    };
  },
});

function assembleIndexScreen(
  builder: VuiBuilder,
  context: CoreUiContext,
  merged: Record<string, any>,
): VNode {
  const kind = merged.viewKind;
  if (
    merged.treeOption ||
    merged.tree ||
    kind === UiViewManyKind.categoryList ||
    kind === "categoryList"
  ) {
    return builder.buildExplorer(context, merged);
  }
  if (kind === UiViewManyKind.gantt || kind === "gantt") {
    return builder.buildGantt(context, merged);
  }
  if (kind === UiViewManyKind.scheduler || kind === "scheduler") {
    return builder.buildScheduler(context, merged);
  }
  if (kind === UiViewManyKind.treeGrid || kind === "treeGrid") {
    return builder.buildTreeGridView(context, merged);
  }
  return builder.buildListView(context, merged);
}

const emptyNode = () => h("div");

/** 无皮肤时的占位 Builder，弹层一律取消。 */
export function createStubUiBuilder(): VuiBuilder {
  const factory = {
    layout: new VuiLayout(),
    resolveIcon: (icon: string) => icon,
  } as unknown as VuiFactory;
  const stub: any = {
    factory,
    layout: factory.layout,
    fieldFactory: {} as VuiFieldFactory,
    labelFor: (field: { displayLabel?: string }) => h("label", field.displayLabel),
    editFor: emptyNode,
    displayFor: emptyNode,
    displayCellFor: emptyNode,
    buildField: emptyNode,
    buildResponsiveField: emptyNode,
    buildGroup: emptyNode,
    buildBpmnDiagram: emptyNode,
    buildView: emptyNode,
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
    buildExplorer: emptyNode,
    buildCustomView: emptyNode,
    buildGrid: emptyNode,
    buildList: emptyNode,
    buildTable: emptyNode,
    list: emptyNode,
    table: emptyNode,
    grid: emptyNode,
    treeGrid: emptyNode,
    buildColumns: (): unknown[] => [],
    buildPaginator: emptyNode,
    buildAppScaffold: emptyNode,
    buildAppTopBar: emptyNode,
    buildAppSideBar: emptyNode,
    buildAppSideMenu: emptyNode,
    buildAppMenu: emptyNode,
    setColorScheme: (): void => undefined,
    setColorPalette: (): void => undefined,
    setFontScale: (): void => undefined,
    buildModuleBreadcrumb: emptyNode,
    buildIndexTopbar: emptyNode,
    buildDetailsTopbar: emptyNode,
    buildEditTopbar: emptyNode,
    openTableSettings: async () => false,
    buildSearchField: emptyNode,
    buildModuleSearchbar: emptyNode,
    buildFilterBar: emptyNode,
    buildSearchView: emptyNode,
    buildSigninForm: emptyNode,
    buildSignupForm: emptyNode,
    buildFieldGroup: emptyNode,
    buildSubGroup: emptyNode,
    overlay: noopOverlay,
    overlayHost: undefined,
    toast: async (): Promise<void> => undefined,
    message: (): void => undefined,
    confirm: async () => false,
    dialog: async () => 'cancel' as const,
    buildDocxFilePreview: emptyNode,
    buildXlsxFilePreview: emptyNode,
    buildFilePreview: emptyNode,
  };
    mixPluginHost(stub);
    // 字段行入口在 WithForm（builder 构造表单时按 MetaUiField 选 factory 函数）
  return stub as VuiBuilder;
}

export { unimplemented };
export type { SearchForRelativeContentProps, MetaUiGroup, VNodeChild };

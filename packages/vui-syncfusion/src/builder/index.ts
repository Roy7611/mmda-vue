import {
  h,
  reactive,
  ref,
  unref,
  watch,
  type VNode,
} from "vue";
import { uiCssClass, type MetaUiGroup, type Module } from "@mmda/core";
import { VuiBuilder, GroupCard, canDeleteNamedQuery, deleteNamedQuery, indexTableMetaUi, listFixedFilterFieldNames, promptSaveNamedQuery, writeListFilterModel, pageLayoutMenuItems, paintIndexTopbar, paintDetailsTopbar, chartAsPlugin, type AppScaffoldProps, type AppSideBarProps, type AppTopBarProps, type ImportAndExportActionProps, type MmdaFontScale, type ModuleSearchbarProps, type VuiFactory, type VuiFieldFactory, type UiProps, type SigninFormProps, type SigninFormSlots, type SignupFormProps, type VuiTileSlots, type VuiContext } from "@mmda/vui"
import { SfGridFilterBar } from "../components/SfGridFilterBar";
import { SfVuiOverlayHost } from "../components/SfVuiOverlayHost";
import { createSfVuiOverlay } from "../syncfusion_overlay";
import { SfAttachmentPanel } from "../components/SfAttachmentPanel";
import { createSfVuiFieldFactory } from "../syncfusion_field_factory";
import { createSfVuiFactory, autoFitSyncfusionListGrid } from "../syncfusion_factory";
import { sfVuiLayout } from "../syncfusion_layout";
import { createSfGanttPlugin } from "../plugins/gantt";
import { createSfKanbanPlugin } from "../plugins/kanban";
import { createSfSchedulerPlugin } from "../plugins/scheduler";
import { createSfPivotPlugin } from "../plugins/pivot_table";
import { createSfDiagramEditorPlugin } from "../plugins/diagram_editor";
import { createSfImageEditorPlugin } from "../plugins/image_editor";
import { createSfAiAssistantPlugin } from "../plugins/ai_assistant";
import { createSfChartFactory } from "../plugins/chart";

import {
  invoke,
  type SfVuiContext,
} from "./utils";
import { buildImportOrExportAction as renderImportOrExportAction } from "./import_export";
import { buildModuleSearchbar as renderModuleSearchbar } from "./module_bar";
import {
  buildBpmnDiagram as renderBpmnDiagram,
  buildSigninForm as renderSigninForm,
  buildSignupForm as renderSignupForm,
} from "./features";
import {
  applyColorScheme,
  renderAppMenu,
} from "./shell";
import { refreshSyncfusionSkin } from "../syncfusion_skin";

type GroupCardProps = UiProps & {
  container?: "card" | "fieldset" | "tab" | "none"
  region?: string
  many?: boolean
  direction?: "vertical" | "horizontal" | "row" | "column"
  cols?: number
  headerActions?: VNode | VNode[]
}

export class SfVuiBuilder extends VuiBuilder {
  declare readonly factory: VuiFactory;

  constructor(
    factory = createSfVuiFactory(),
    fieldFactory: VuiFieldFactory = createSfVuiFieldFactory(),
  ) {
    super(
      factory,
      fieldFactory,
      sfVuiLayout,
      createSfVuiOverlay(),
    );
    this.use(createSfGanttPlugin())
      .use(createSfKanbanPlugin())
      .use(createSfSchedulerPlugin())
      .use(createSfPivotPlugin())
      .use(createSfDiagramEditorPlugin())
      .use(createSfImageEditorPlugin())
      .use(createSfAiAssistantPlugin())
      .use(chartAsPlugin(createSfChartFactory()));
        }

  get overlayHost() {
    return SfVuiOverlayHost;
  }

  override setColorScheme(dark: boolean) {
    super.setColorScheme(dark);
    applyColorScheme(dark);
  }

  override setFontScale(scale: MmdaFontScale) {
    super.setFontScale(scale);
    refreshSyncfusionSkin();
  }

  override buildGroupCard(
    group: MetaUiGroup,
    body: VNode | VNode[],
    props: GroupCardProps = {},
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
      GroupCard,
      {
        tag: "div",
        title: group.groupLabel,
        expanded: group.expanded !== false,
        class: [this.groupWrapClass(group, props), "e-card"],
        headerClass: "e-card-header" as any,
        toggleIcon: "e-icons e-chevron-down",
        ...rest,
      },
      {
        header: ({ title }: { title: string }) =>
          h("div", { class: "e-card-header-caption" }, [
            h("div", { class: ["e-card-header-title", uiCssClass("group", "title")] }, title),
          ]),
        // Card 只做壳；字段/表格布局由 .mmda-group__content 管
        default: () => this.wrapGroupContent(body),
        actions: headerActions ? () => headerActions : undefined,
      },
    );
  }

  override buildAttachmentGroup(
    context: VuiContext<any>,
    props: UiProps = {},
  ): VNode {
    const panel = ref<{ choose: () => void }>();
    const title = context.translate("attachments") || "附件";
    return this.wrapGroup(
      {
        groupLabel: title,
        many: false,
        expanded: true,
        isSecondary: () => true,
        isTails: () => false,
      } as MetaUiGroup,
      h(SfAttachmentPanel, {
        ref: panel,
        context: context as any,
      }),
      {
        region: "secondary",
        class: "mmda-attachments",
        ...props,
        headerActions: this.factory.button({
          id: "attachment-upload-button",
          icon: this.factory.resolveIcon("fas fa-paperclip"),
          label: "",
          tooltip:
            context.translate("action.uploadAttachment") || "上传附件",
          "aria-label":
            context.translate("action.uploadAttachment") || "上传附件",
          buttonType: "text",
          shape: "round",
          class: uiCssClass("group", "action"),
          onClick: () => panel.value?.choose(),
        }),
      },
    );
  }

  buildAppTopBar(props: AppTopBarProps = { modules: [], logo: () => null }) {
    const items = props.modules.map((module) => ({
      label: module.moduleName ?? module.moduleLabel,
      url: module.moduleUrl ?? (module as any).url,
    }));
    return h("div", { class: "mmda-topbar" }, [
      h("div", { class: "mmda-topbar__start" }, [
        invoke(props.logo),
        this.factory.menubar(items),
      ]),
      h("div", { class: "mmda-topbar__end" }, invoke(props.actions)),
    ]);
  }

  /**
   * 兼容旧调用；真源是 SfVuiLayout.scaffold（AppShell 直接调 layout）。
   * sidebarLeft：nav 与 .mmda-app-page.e-main-content 为兄弟（EJ2 Push / Pad compact）。
   */
  override buildAppScaffold(props: AppScaffoldProps = {}) {
    const variant =
      props.layout ?? (props.model === "Mobile" ? "topBarFull" : "sidebarLeft");
    return this.layout.scaffold({
      variant,
      topBar: invoke(props.topBar) as VNode | undefined,
      nav: invoke(props.sideBar) as VNode | undefined,
      page: invoke(props.body) as VNode | undefined,
      bottomBar: invoke(props.bottomBar) as VNode | undefined,
    });
  }

  buildAppSideBar(
    props: AppSideBarProps = { modules: [], header: () => null },
  ) {
    return this.buildAppSideMenu({
      modules: props.modules,
      logo: props.header as () => VNode,
      footer: props.footer as (() => VNode) | undefined,
    });
  }

  buildAppSideMenu(props: import("@mmda/core").UiAppSideMenuProps<VNode> = {}) {
    return renderAppMenu(props.modules ?? [], props as any);
  }

  buildAppMenu(modules: Module[], props?: UiProps) {
    return this.buildAppSideMenu({ modules, ...props });
  }

  buildImportOrExportAction(
    context: SfVuiContext,
    props: ImportAndExportActionProps,
  ): VNode {
    return renderImportOrExportAction.call(this as any, context, props);
  }

  private listLayoutMenuItems(context: SfVuiContext) {
    return [
      {
        name: "autoFitColumns",
        label: context.t("action.autoFitColumns"),
        icon: this.factory.resolveIcon("auto-fit-columns"),
        onAction: () => void autoFitSyncfusionListGrid(context),
      },
      {
        name: "tableSettings",
        label: context.t("action.tableSettings"),
        icon: this.factory.resolveIcon("settings"),
        onAction: () => void this.openTableSettings(context),
      },
    ];
  }

  buildIndexTopbar(
    context: SfVuiContext,
    props?: Parameters<VuiBuilder["buildIndexTopbar"]>[1],
    slots?: VuiTileSlots,
  ) {
    return paintIndexTopbar(
      this,
      context,
      props ?? {},
      slots,
      this.listLayoutMenuItems(context),
    );
  }

  buildDetailsTopbar(
    context: SfVuiContext,
    props?: Parameters<VuiBuilder["buildDetailsTopbar"]>[1],
    slots?: VuiTileSlots,
  ) {
    return paintDetailsTopbar(
      this,
      context,
      props ?? {},
      slots,
      pageLayoutMenuItems(context as any).map((item) =>
        item.divider
          ? item
          : {
              ...item,
              icon: this.factory.resolveIcon(item.icon ?? "page-layout"),
              onAction: item.onAction ?? item.command,
            },
      ),
    );
  }

  buildModuleSearchbar(context: SfVuiContext, rawProps?: UiProps) {
    // 契约型 `UiProps` → 具体形状在实现内收敛（同 `buildFilterBar` 的写法）
    const props = (rawProps ?? {}) as ModuleSearchbarProps;
    return renderModuleSearchbar.call(this, context, props);
  }

  override buildFilterBar(context: SfVuiContext, props?: Record<string, unknown>) {
    const extra = (props as { chips?: () => unknown })?.chips?.();
    const extraNodes =
      extra == null ? [] : Array.isArray(extra) ? extra : [extra];
    const runtime = context as any;
    return h(SfGridFilterBar, {
      filterModel: runtime.searchParam?.filterModel,
      metaUi: indexTableMetaUi(runtime),
      labels: {
        filter: context.t("action.filter"),
        all: context.t("action.all"),
        clearFilters: context.t("action.clearFilters"),
        saveQuery: context.t("action.saveQuery"),
        deleteQuery: context.t("action.deleteQuery"),
      },
      t: (key: string) => context.t(key),
      chips: (chipProps: Record<string, unknown>) =>
        this.factory.chips?.(chipProps as any),
      button: (btnProps: Record<string, unknown>) =>
        this.factory.button(btnProps as any),
      resolveIcon: (icon: string) => this.factory.resolveIcon(icon),
      skipFields: listFixedFilterFieldNames(runtime),
      extra: extraNodes,
      queryID: runtime.searchParam?.queryID,
      canDeleteQuery: canDeleteNamedQuery({
        predifined: runtime.searchParam?.queryPredifined,
      }),
      onFilterModelChange: (model) => {
        writeListFilterModel(runtime.searchParam, model);
        delete runtime.searchParam.queryID;
        delete runtime.searchParam.queryName;
        return runtime.search?.();
      },
      onSaveQuery: () => void promptSaveNamedQuery(runtime, this.factory),
      onDeleteQuery: () =>
        void deleteNamedQuery(runtime, {
          queryID: runtime.searchParam.queryID,
          queryName: runtime.searchParam.queryName,
          predifined: runtime.searchParam.queryPredifined,
        }),
    });
  }

  buildBpmnDiagram(flowTrails: any[], _context: SfVuiContext, props: UiProps = {}) {
    return renderBpmnDiagram(flowTrails, _context, props);
  }

  buildSigninForm(props: SigninFormProps, slots?: SigninFormSlots) {
    return renderSigninForm(props, slots);
  }

  buildSignupForm(props: SignupFormProps) {
    return renderSignupForm(props);
  }
}

import { createElement, useState, type ReactNode } from "react";
import {
  moduleChain,
  uiCssClass,
  type MetaUiField,
  type MetaUiGroup,
  type UiAppSideMenuProps,
  type UiContext,
  type UiDialogAction,
  type UiDetailsTopbarProps,
  type UiDetailsTopbarSlots,
  type UiEditTopbarProps,
  type UiEditTopbarSlots,
  type UiEntityDialogOptions,
  type UiFilterBarProps,
  type UiIndexTopbarProps,
  type UiIndexTopbarSlots,
  type UiListViewProps,
  type UiModuleBreadcrumbProps,
  type UiProps,
  type UiSearchField,
  type UiSigninFormProps,
  type UiSigninFormSlots,
  type UiSignupFormProps,
  type UiSignupFormSlots,
  type UiViewProps,
} from "@mmda/core";
import { ReactUiBuilder } from "@mmda/rui";
import { SfReactUiFactory } from "./factory";
import { SfReactUiFieldFactory } from "./field_factory";
import { SfReactUiLayout } from "./layout";
import { sfReactUiOverlay } from "./overlay";
import { createSfGanttPlugin } from "./plugins/gantt";
import { createSfKanbanPlugin } from "./plugins/kanban";
import { createSfSchedulerPlugin } from "./plugins/scheduler";
import { createSfPivotPlugin } from "./plugins/pivot_table";
import { createSfDiagramEditorPlugin } from "./plugins/diagram_editor";
import { createSfImageEditorPlugin } from "./plugins/image_editor";
import { createSfAiAssistantPlugin } from "./plugins/ai_assistant";
import { createSfRibbonPlugin } from "./plugins/ribbon";
import { chartAsPlugin, createSfChartFactory } from "./plugins/chart";

type SfGroupCardProps = UiProps & {
  container?: "card" | "fieldset" | "tab" | "none";
  region?: string;
  many?: boolean;
  direction?: "vertical" | "horizontal" | "row" | "column";
  cols?: number;
  headerActions?: ReactNode;
  footer?: ReactNode;
  collapsed?: boolean;
  collapsible?: boolean;
};

function SfGroupCard(props: {
  title: string;
  body: ReactNode;
  className: string;
  headerActions?: ReactNode;
  footer?: ReactNode;
  collapsed?: boolean;
  collapsible?: boolean;
}): ReactNode {
  const [expanded, setExpanded] = useState(props.collapsed !== true);
  const collapsible = props.collapsible !== false;

  const header = createElement(
    "div",
    { className: "e-card-header" },
    createElement(
      "div",
      { className: "e-card-header-caption" },
      createElement("div", { className: "e-card-header-title" }, props.title),
    ),
    props.headerActions
      ? createElement(
          "div",
          { className: "e-card-actions" },
          props.headerActions,
        )
      : null,
    collapsible
      ? createElement("button", {
          type: "button",
          className: "e-card-toggle e-icons e-chevron-down",
          "aria-expanded": expanded,
          onClick: () => setExpanded((value) => !value),
        })
      : null,
  );

  return createElement(
    "div",
    { className: props.className },
    header,
    expanded
      ? createElement("div", { className: "e-card-content" }, props.body)
      : null,
    expanded && props.footer
      ? createElement("div", { className: "e-card-footer" }, props.footer)
      : null,
  );
}

export class SfReactUiBuilder extends ReactUiBuilder {
  constructor(
    factory: SfReactUiFactory = new SfReactUiFactory(),
    fieldFactory: SfReactUiFieldFactory = new SfReactUiFieldFactory(factory),
  ) {
    super(factory, fieldFactory, new SfReactUiLayout());

    this.toast = (_ctx, props) => sfReactUiOverlay.toast(props);
    this.message = (_ctx, props) => sfReactUiOverlay.message(props);
    this.confirm = (_ctx, props) => sfReactUiOverlay.confirm(props);
    this.dialog = (content, _ctx, props) =>
      sfReactUiOverlay.dialog(content, props ?? {});

    this.use(createSfGanttPlugin())
      .use(createSfKanbanPlugin())
      .use(createSfSchedulerPlugin())
      .use(createSfPivotPlugin())
      .use(createSfDiagramEditorPlugin())
      .use(createSfImageEditorPlugin())
      .use(createSfAiAssistantPlugin())
      .use(createSfRibbonPlugin())
      .use(chartAsPlugin(createSfChartFactory()));
  }

  // —— groupCard（e-card 包装）——
  buildGroupCard(
    group: MetaUiGroup,
    body: ReactNode | ReactNode[],
    props: SfGroupCardProps = {},
  ): ReactNode {
    const cls = props.class ?? "";
    return createElement(SfGroupCard, {
      title: group.groupLabel,
      body,
      className: `e-card mmda-group ${cls}`,
      headerActions: props.headerActions,
      footer: props.footer,
      collapsed: props.collapsed,
      collapsible: props.collapsible,
    });
  }

  // —— Syncfusion skin ——
  setColorScheme(dark: boolean): void {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("e-dark-mode", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }

  setFontScale(scale: unknown): void {
    if (typeof document === "undefined") return;
    const ratio = typeof scale === "number" ? scale : 1;
    document.documentElement.style.setProperty(
      "--mmda-font-scale",
      String(ratio),
    );
  }

  private invoke(value: unknown): ReactNode {
    return typeof value === "function"
      ? (value as () => ReactNode)()
      : (value as ReactNode);
  }

  // —— 应用壳 / 侧栏 ——
  override buildAppSideMenu(
    props: UiAppSideMenuProps<ReactNode> = {},
  ): ReactNode {
    const modules = props.modules ?? [];
    return createElement(
      "nav",
      { className: uiCssClass("app-side-menu") },
      modules.map((module) =>
        createElement(
          "a",
          {
            key: module.moduleCode,
            className: uiCssClass("app-side-menu", "item"),
            href: module.moduleUrl ?? (module as any).url,
          },
          module.moduleLabel ?? module.moduleName,
        ),
      ),
    );
  }

  buildAppTopBar(props: any = { modules: [], logo: () => null }): ReactNode {
    const items = (props.modules ?? []).map((module: any) => ({
      label: module.moduleName ?? module.moduleLabel,
      url: module.moduleUrl ?? module.url,
    }));
    return createElement(
      "div",
      { className: "mmda-topbar" },
      createElement(
        "div",
        { className: "mmda-topbar__start" },
        this.invoke(props.logo),
        (this.factory as any).menubar?.(items),
      ),
      createElement(
        "div",
        { className: "mmda-topbar__end" },
        this.invoke(props.actions),
      ),
    );
  }

  buildAppSideBar(props: any = { modules: [], header: () => null }): ReactNode {
    return this.buildAppSideMenu({
      modules: props.modules,
      logo: () => this.invoke(props.header),
      footer: props.footer ? () => this.invoke(props.footer) : undefined,
    } as any);
  }

  buildAppScaffold(props: any = {}): ReactNode {
    const variant =
      props.layout ?? (props.model === "Mobile" ? "topBarFull" : "sidebarLeft");
    return (this.layout as any).scaffold({
      variant,
      topBar: this.invoke(props.topBar),
      nav: this.invoke(props.sideBar),
      page: this.invoke(props.body),
      bottomBar: this.invoke(props.bottomBar),
    });
  }

  // —— 模块面包屑 / 搜索 / 过滤 ——
  override buildModuleBreadcrumb(
    context: UiContext,
    props: UiModuleBreadcrumbProps = {},
  ): ReactNode {
    const { module, label } = props;
    if (!module) {
      return (this.factory as any).breadcrumb({
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
    return (this.factory as any).breadcrumb({
      items,
      class: "mmda-breadcrumb",
    });
  }

  override buildSearchField(
    field: UiSearchField,
    context: UiContext,
    _props?: UiProps,
  ): ReactNode {
    return createElement(
      "div",
      { className: "mmda-search-field" },
      this.editFor(field.field, context),
    );
  }

  override buildModuleSearchbar(
    context: UiContext,
    props: UiProps = {},
  ): ReactNode {
    return (this.factory as any).textInput({
      placeholder: context.t("action.search"),
      ...props,
    });
  }

  override buildFilterBar(
    context: UiContext,
    props?: UiFilterBarProps<ReactNode>,
  ): ReactNode {
    const chips = props?.chips?.();
    const nodes = chips == null ? [] : Array.isArray(chips) ? chips : [chips];
    return createElement(
      "div",
      { className: uiCssClass("list-filter-bar") },
      ...nodes,
    );
  }

  // —— 顶栏 ——
  override buildIndexTopbar(
    context: UiContext,
    props: UiIndexTopbarProps = {},
    slots?: UiIndexTopbarSlots<ReactNode>,
  ): ReactNode {
    return createElement(
      "header",
      { className: uiCssClass("index-topbar") },
      createElement(
        "div",
        { className: uiCssClass("index-topbar", "start") },
        slots?.start?.() ??
          this.buildModuleBreadcrumb(context, {
            module: (context as any).module,
          }),
      ),
      createElement(
        "div",
        { className: uiCssClass("index-topbar", "center") },
        slots?.center?.(),
      ),
      createElement(
        "div",
        { className: uiCssClass("index-topbar", "end") },
        slots?.end?.(),
      ),
    );
  }

  override buildDetailsTopbar(
    context: UiContext,
    props: UiDetailsTopbarProps = {},
    slots?: UiDetailsTopbarSlots<ReactNode>,
  ): ReactNode {
    return createElement(
      "header",
      { className: uiCssClass("details-topbar") },
      createElement(
        "div",
        { className: uiCssClass("details-topbar", "start") },
        slots?.start?.(),
      ),
      createElement(
        "div",
        { className: uiCssClass("details-topbar", "end") },
        slots?.end?.(),
      ),
    );
  }

  override buildEditTopbar(
    context: UiContext,
    props: UiEditTopbarProps = {},
    slots?: UiEditTopbarSlots<ReactNode>,
  ): ReactNode {
    return this.buildDetailsTopbar(context, props, slots);
  }

  // —— 登录 / 注册 ——
  override buildSigninForm(
    props: UiSigninFormProps = {},
    _slots?: UiSigninFormSlots<ReactNode>,
  ): ReactNode {
    return createElement(
      "form",
      {
        className: "mmda-auth-form",
        onSubmit: (event: any) => {
          event.preventDefault();
          props.onSignin?.(event);
        },
      },
      (this.factory as any).textInput({
        name: "account",
        placeholder: "Account",
        ...(props as any).account,
      }),
      (this.factory as any).textInput({
        name: "password",
        type: "password",
        placeholder: "Password",
        ...(props as any).password,
      }),
      (this.factory as any).button({ content: "Sign in", isPrimary: true }),
    );
  }

  override buildSignupForm(
    props: UiSignupFormProps = {},
    _slots?: UiSignupFormSlots<ReactNode>,
  ): ReactNode {
    return createElement(
      "form",
      {
        className: "mmda-auth-form",
        onSubmit: (event: any) => {
          event.preventDefault();
          props.onSignup?.(event);
        },
      },
      (this.factory as any).textInput({
        name: "mobile",
        placeholder: "Mobile",
      }),
      (this.factory as any).textInput({
        name: "password",
        type: "password",
        placeholder: "Password",
      }),
      (this.factory as any).textInput({
        name: "vcode",
        placeholder: "Verification code",
      }),
      (this.factory as any).button({ content: "Sign up", isPrimary: true }),
    );
  }

  // —— 字段组 / 子表组 ——
  override buildFieldGroup(
    group: MetaUiGroup,
    context: UiContext,
    props: UiProps = {},
  ): ReactNode {
    if (context.isGroupHidden?.(group)) return null;
    const fields = group.getListLayoutFields();
    const nodes = fields.map((field) =>
      context.editing && !context.isFieldReadonly(field)
        ? this.editFor(field, context)
        : this.displayFor(field, context),
    );
    return this.buildGroupCard(group, nodes, props);
  }

  override buildSubGroup(
    group: MetaUiGroup,
    context: UiContext,
    props: UiProps = {},
  ): ReactNode {
    if (context.isGroupHidden?.(group)) return null;
    const runtime = context as any;
    const subContext = runtime.subGroupContext?.(group.groupName) ?? runtime;
    const rows = Array.isArray(subContext.model) ? subContext.model : [];
    const metaUi = group.groupUi ?? context.metaUi;
    const grid = this.factory.grid({
      rows,
      fields: metaUi.getListedFields?.(),
      primaryKey: metaUi.primaryKey,
      objName: metaUi.objName,
      ...props,
    } as any);
    return this.buildGroupCard(group, grid, props);
  }

  // —— 视图 ——
  override buildIndexView(
    context: UiContext,
    props?: UiListViewProps,
  ): ReactNode {
    const rows = Array.isArray(context.model) ? context.model : [];
    return createElement(
      "section",
      { className: uiCssClass("index-view") },
      this.buildIndexTopbar(context),
      this.buildFilterBar(context),
      this.table(context.metaUi, {
        ...(props as any),
        rows,
        selectionMode: (props as any)?.selectionMode ?? context.selectionMode,
      } as any),
    );
  }

  override buildSelectView(
    context: UiContext,
    props?: UiListViewProps,
  ): ReactNode {
    return this.buildIndexView(context, {
      ...props,
      selectionMode: (props as any)?.selectionMode ?? context.selectionMode,
    });
  }

  override buildDetailsView(
    context: UiContext,
    _props?: UiViewProps,
  ): ReactNode {
    return createElement(
      "div",
      { className: uiCssClass("details-view") },
      context.metaUi.groups
        .filter((group) => !group.many)
        .map((group) => this.buildFieldGroup(group, context)),
    );
  }

  override buildEditView(context: UiContext, _props?: UiViewProps): ReactNode {
    return createElement(
      "div",
      { className: uiCssClass("edit-view") },
      context.metaUi.groups
        .filter((group) => !group.many)
        .map((group) => this.buildFieldGroup(group, context)),
    );
  }

  override buildExplorer(context: UiContext, props?: any): ReactNode {
    const tree = this.invoke(props?.treeOption);
    return createElement(
      "div",
      { className: uiCssClass("explorer") },
      tree
        ? createElement(
            "aside",
            { className: uiCssClass("explorer", "tree") },
            tree,
          )
        : null,
      createElement(
        "div",
        { className: uiCssClass("explorer", "table") },
        this.buildIndexView(context, props?.listView),
      ),
    );
  }

  // —— 实体弹窗 ——
  override async editDialog(
    context: UiContext,
    props?: UiEntityDialogOptions<ReactNode, UiViewProps>,
  ): Promise<UiDialogAction> {
    const content = this.buildEditView(context, props?.viewProps);
    return this.dialog(content, context, {
      buttons: "okCancel",
      showFooter: true,
      ...props?.dlgProps,
    } as any);
  }

  override async detailsDialog(
    context: UiContext,
    props?: UiEntityDialogOptions<ReactNode, UiViewProps>,
  ): Promise<UiDialogAction> {
    const content = this.buildDetailsView(context, props?.viewProps);
    return this.dialog(content, context, props?.dlgProps as any);
  }

  override async selectDialog(
    context: UiContext,
    props?: UiEntityDialogOptions<ReactNode, UiViewProps>,
  ): Promise<UiDialogAction> {
    const content = this.buildSelectView(context, props?.viewProps as any);
    return this.dialog(content, context, {
      buttons: "okCancel",
      showFooter: true,
      ...props?.dlgProps,
    } as any);
  }
}

import { createElement, useState, type ReactNode } from "react";
import {
  type MetaUiGroup,
  type UiContext,
  type UiProps,
  type UiSigninFormProps,
  type UiSigninFormSlots,
  type UiSignupFormProps,
  type UiSignupFormSlots,
} from "@mmda/core";
import { RuiBuilder } from "@mmda/rui";
import { SfRuiFactory } from "./factory";
import { SfRuiFieldFactory } from "./field_factory";
import { SfRuiLayout } from "./layout";
import { sfRuiOverlay } from "./overlay";
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

export class SfRuiBuilder extends RuiBuilder {
  constructor(
    factory: SfRuiFactory = new SfRuiFactory(),
    fieldFactory: SfRuiFieldFactory = new SfRuiFieldFactory(factory),
  ) {
    super(factory, fieldFactory, new SfRuiLayout());

    this.toast = (_ctx, props) => sfRuiOverlay.toast(props);
    this.confirm = (_ctx, props) => sfRuiOverlay.confirm(props);
    this.dialog = (content, _ctx, props) =>
      sfRuiOverlay.dialog(content, props ?? {});

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

}

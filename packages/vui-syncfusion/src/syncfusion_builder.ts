import {
  h,
  reactive,
  unref,
  type VNode,
  type VNodeArrayChildren,
} from "vue";
import { RouterLink } from "vue-router";
import {
  SqlDataType,
  debounce,
  pluralize,
  type MetaUiField,
  type MetaUiGroup,
  type Module,
  type ModuleAction,
  type ModuleAuth,
} from "@mmda/core";
import {
  AbstractUiBuilder,
  MmdaGroupCard,
  UiViewMany,
  hasSystemModules,
  type AppScaffoldProps,
  type AppSideBarProps,
  type AppTopBarProps,
  type ImportAndExportActionProps,
  type ModuleBreadcrumbProps,
  type ModuleSearchbarProps,
  type ModuleToolbarProps,
  type SyncfusionUiFactory,
  type PropData,
  type SearchForRelativeProps,
  type SigninFormProps,
  type SigninFormSlots,
  type SignupFormProps,
  type UiAction,
  type UiFieldFactory,
  type UiSearchField,
  type UiSlots,
  type UiViewContext,
} from "@mmda/vui";
import { ButtonComponent } from "@syncfusion/ej2-vue-buttons";
import {
  DatePickerComponent,
} from "@syncfusion/ej2-vue-calendars";
import {
  DropDownListComponent,
  MultiSelectComponent,
  ComboBoxComponent,
} from "@syncfusion/ej2-vue-dropdowns";
import {
  NumericTextBoxComponent,
  TextBoxComponent,
} from "@syncfusion/ej2-vue-inputs";
import { SyncfusionOverlayHost } from "./components/SyncfusionOverlayHost";
import { createSyncfusionOverlay } from "./syncfusion_overlay";
import { BpmnDiagram } from "./components/BpmnDiagram";
import { BarcodeGenerator, QRCodeGenerator } from "./components/Barcode";
import { SigninForm } from "./components/SigninForm";
import { SyncfusionAppMenu } from "./components/SyncfusionAppMenu";
import { createSyncfusionFieldFactory } from "./syncfusion_field_factory";
import { createSyncfusionUiFactory } from "./syncfusion_factory";
import { syncfusionLayout } from "./syncfusion_layout";

const UI_NAME = "mmda";

const invoke = (value: unknown): any =>
  typeof value === "function" ? (value as () => unknown)() : value;

const moduleChain = (module: Module): Module[] => {
  const chain: Module[] = [module];
  let parent = (module as Module & { parent?: Module }).parent;
  while (parent) {
    chain.unshift(parent);
    parent = (parent as Module & { parent?: Module }).parent;
  }
  return chain;
};

const breadcrumbItem = (item: {
  label?: string;
  icon?: string;
  route?: string;
  leaf?: boolean;
}) =>
  h(
    item.leaf || !item.route ? "span" : (RouterLink as any),
    item.leaf || !item.route
      ? { class: "mmda-breadcrumb__item" }
      : { to: item.route!, class: "mmda-breadcrumb__link" },
    () => [
      item.icon
        ? h("i", {
            class: [item.icon, "mmda-breadcrumb__icon"],
            "aria-hidden": "true",
          })
        : null,
      h("span", item.label),
    ],
  );

type UiContext = UiViewContext<any>;

const moduleOf = (context: UiContext): Module | undefined => {
  const runtime = context as any;
  return (runtime.module ?? runtime.logic?.module) as Module | undefined;
};

const moduleAuth = (context: UiContext): ModuleAuth | undefined =>
  moduleOf(context)?.authority;

const visibleActions = (actions: UiAction[]) =>
  actions.filter((action) => action.visible == null || unref(action.visible));

export class SyncfusionUiBuilder extends AbstractUiBuilder {
  declare readonly factory: SyncfusionUiFactory;

  constructor(
    factory = createSyncfusionUiFactory(),
    fieldFactory: UiFieldFactory = createSyncfusionFieldFactory(),
  ) {
    super(
      factory,
      fieldFactory,
      factory.layout ?? syncfusionLayout,
      createSyncfusionOverlay(),
    );
  }

  get overlayHost() {
    return SyncfusionOverlayHost;
  }

  override setColorScheme(dark: boolean) {
    super.setColorScheme(dark);
    if (typeof document !== "undefined") {
      // 只挂在 <html>：若同时给 body 加 e-dark-mode，Material3 默认紫色会盖掉色板变量
      document.documentElement.classList.toggle("e-dark-mode", dark);
      document.body?.classList.remove("e-dark-mode");
    }
  }

  override buildGroupCard(
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
      MmdaGroupCard,
      {
        tag: "div",
        title: group.groupLabel,
        expanded: group.expanded !== false,
        class: [this.groupWrapClass(group, props), "e-card"],
        headerClass: "e-card-header",
        toggleIcon: "e-icons e-chevron-down",
        ...rest,
      },
      {
        header: ({ title }: { title: string }) =>
          h("div", { class: "e-card-header-caption" }, [
            h("div", { class: "e-card-header-title mmda-group__title" }, title),
          ]),
        // Card 只做壳；字段/表格布局由 .mmda-group__content 管
        default: () => this.wrapGroupContent(body),
      },
    );
  }

  buildContainer(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("div", { class: "mmda-sf-container", ...props }, content);
  }

  buildHeader(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("header", { class: "mmda-sf-header", ...props }, content);
  }

  buildAside(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("aside", { class: "mmda-sf-aside", ...props }, content);
  }

  buildMain(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("main", { class: "mmda-sf-main", ...props }, content);
  }

  buildFooter(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("footer", { class: "mmda-sf-footer", ...props }, content);
  }

  buildAppTopBar(props: AppTopBarProps = { modules: [], logo: () => null }) {
    const items = props.modules.map((module) => ({
      label: module.moduleName ?? module.moduleLabel,
      url: module.moduleUrl ?? (module as any).url,
    }));
    return h("div", { class: "mmda-sf-topbar" }, [
      h("div", { class: "mmda-sf-topbar__start" }, [
        invoke(props.logo),
        this.factory.menubar(items),
      ]),
      h("div", { class: "mmda-sf-topbar__end" }, invoke(props.actions)),
    ]);
  }

  /**
   * Official Sidebar layout: sidebar and main content are siblings under a
   * target shell (not a CSS-grid nav column). See Target + Dock docs.
   *   .mmda-sf-shell
   *     #mmda-sf-dock-sidebar
   *     .mmda-sf-maincontent
   */
  override buildAppScaffold(props: AppScaffoldProps = {}) {
    const variant =
      props.layout ?? (props.model === "Mobile" ? "topBarFull" : "sidebarLeft");
    if (variant !== "sidebarLeft") {
      return super.buildAppScaffold(props);
    }
    return h("div", { id: "mmda-sf-shell", class: "mmda-sf-shell" }, [
      invoke(props.sideBar),
      h(
        "div",
        { class: "mmda-sf-maincontent", role: "main" },
        [invoke(props.body)],
      ),
    ]);
  }

  buildAppSideBar(
    props: AppSideBarProps = { modules: [], header: () => null },
  ) {
    const systems = hasSystemModules(props.modules);
    // Systems: SyncfusionAppMenu owns EJ2 Sidebar enableDock (+ logo/footer).
    if (systems) {
      return this.buildAppMenu(props.modules, {
        logo: props.header,
        footer: props.footer,
      });
    }
    return h("aside", { class: "mmda-sf-sidebar" }, [
      h("div", { class: "mmda-sf-sidebar__header" }, invoke(props.header)),
      h("div", { class: "mmda-sf-sidebar__body" }, [
        this.buildAppMenu(props.modules),
      ]),
      h("div", { class: "mmda-sf-sidebar__footer" }, invoke(props.footer)),
    ]);
  }

  buildAppMenu(modules: Module[], props?: PropData) {
    return h(SyncfusionAppMenu, { modules, ...props });
  }

  buildLoading(_context: UiContext, props?: PropData) {
    return h("div", { class: "mmda-sf-loading e-icons e-spin", ...props });
  }

  buildError(context: UiContext, props?: PropData) {
    return h(
      "div",
      { class: "mmda-sf-error e-error", ...props },
      context.title,
    );
  }

  buildModuleBreadcrumb(context: UiContext, props: ModuleBreadcrumbProps) {
    const { module, label } = props;
    if (!module) {
      return h(
        "span",
        { class: "mmda-sf-breadcrumb" },
        label || context.title,
      );
    }

    const model = moduleChain(module).map((item, index, items) => ({
      key: item.moduleCode,
      label: item.moduleLabel ?? (item as any).moduleName,
      icon: item.moduleIcon ?? "",
      route: item.moduleUrl,
      leaf: index === items.length - 1 && !label,
    }));

    if (label) {
      model.push({
        key: `${module.moduleCode}-title`,
        label,
        icon: "",
        route: "",
        leaf: true,
      });
    }

    // 不用 Syncfusion Breadcrumb 的 url（原生 <a> 整页跳转会丢 SPA 鉴权进登录页）
    // 与侧栏/PrimeVue 一致：可点项走 RouterLink
    return h(
      "nav",
      {
        class: "mmda-sf-breadcrumb e-breadcrumb",
        "aria-label": "breadcrumb",
      },
      model.flatMap((item, index) => [
        ...(index > 0
          ? [
              h(
                "span",
                {
                  class: "e-breadcrumb-separator mmda-breadcrumb__sep",
                  "aria-hidden": "true",
                },
                "/",
              ),
            ]
          : []),
        h(
          "span",
          { class: "e-breadcrumb-item", key: item.key },
          [breadcrumbItem(item)],
        ),
      ]),
    );
  }

  buildImportOrExportAction(
    context: UiContext,
    props: ImportAndExportActionProps,
  ): VNode {
    const runtime = context as any;
    const repository = runtime.isRoot
      ? runtime.logic.repository
      : pluralize(context.metaui.objName);
    const { role, handlerFn, importFn, exportFn } = props;
    const action =
      role === "import"
        ? this.actionFactory.import(context, {
            repository,
            handlerFn,
            importFn,
          })
        : this.actionFactory.export(context, {
            repository,
            handlerFn,
            exportFn,
          });
    const templates = runtime.templates ?? [];
    if (templates.length > 0) {
      return this.factory.splitButton({
        label: action.label,
        icon: this.factory.resolveIcon(action.icon ?? role ?? ""),
        severity: action.colorRole === "danger" ? "danger" : undefined,
        size: "small",
        onClick: action.onAction,
        actions: templates.map((template: any) => ({
          label: template.templateName,
          icon: this.factory.resolveIcon("file"),
          command: () => {
            runtime.currentTemplate = template;
            if (role === "import") {
              void (runtime.many
                ? runtime.importFiles?.({ repository, importFn })
                : runtime.importFile?.({ repository, importFn }));
            } else {
              void (runtime.many
                ? runtime.exportFiles?.({ repository, exportFn })
                : runtime.exportFile?.({ repository, exportFn }));
            }
          },
        })),
      });
    }
    return this.toolbarActionButton(context, action);
  }

  private importOrExportMenuItem(
    context: UiContext,
    role: "import" | "export",
  ) {
    const runtime = context as any;
    const repository = runtime.isRoot
      ? runtime.logic.repository
      : pluralize(context.metaui.objName);
    const action =
      role === "import"
        ? this.actionFactory.import(context, { repository })
        : this.actionFactory.export(context, { repository });
    const icon = this.factory.resolveIcon(action.icon ?? role);
    const templates = runtime.templates ?? [];

    if (!templates.length) {
      return {
        label: action.label,
        icon,
        command: action.onAction,
      };
    }

    return {
      label: action.label,
      icon,
      items: [
        {
          label: action.label,
          icon,
          command: action.onAction,
        },
        ...templates.map((template: any) => ({
          label: template.templateName,
          icon: this.factory.resolveIcon("file"),
          command: () => {
            runtime.currentTemplate = template;
            if (role === "import") {
              void (runtime.many
                ? runtime.importFiles?.({ repository })
                : runtime.importFile?.({ repository }));
            } else {
              void (runtime.many
                ? runtime.exportFiles?.({ repository })
                : runtime.exportFile?.({ repository }));
            }
          },
        })),
      ],
    };
  }

  private assembleMoreButton(context: UiContext, items: any[]): VNode[] {
    return this.moreMenuButton(context, items);
  }

  private assembleMultipleSelectionButtons(
    context: UiContext,
    actions: UiAction[],
  ): VNode[] {
    if (!actions.length) return [];
    const render = (action: UiAction) =>
      this.toolbarActionButton(
        context,
        {
          ...action,
          onAction: () => {
            if (action.onAction) action.onAction();
            else (context as any).doAction?.(action, context.model);
          },
        },
        { id: `${action.name}-button` },
      );

    if (actions.length === 1) return [render(actions[0]!)];

    return [
      this.dropdownMenuButton(
        {
          label: context.t("action.batchOperation"),
          class: "mmda-batch-menu-button",
        },
        actions.map((action) => ({
          name: action.name,
          label: action.label,
          icon: action.icon,
          onAction: () => {
            if (action.onAction) action.onAction();
            else (context as any).doAction?.(action, context.model);
          },
        })),
      ),
    ];
  }

  private toolbarActionButton(
    context: UiContext,
    action: UiAction,
    props?: PropData,
  ) {
    return this.factory.actionButton(
      action,
      (message) => context.t(message),
      false,
      { size: "small", ...props },
    );
  }

  private indexViewActionButtons(context: UiContext): VNode[] {
    const runtime = context as any;
    const { globalProps, selectionMode, customActions, view } = runtime;
    const { $t } = globalProps ?? { $t: (m: string) => context.t(m) };
    const auth = moduleAuth(context);
    const children: VNode[] = [];
    const moreItems: any[] = [];

    const inBatchMode =
      view === UiViewMany.SelectMany ||
      view === UiViewMany.EditMany ||
      selectionMode === "multiple";

    if (inBatchMode) {
      children.push(
        this.toolbarActionButton(context, this.actionFactory.cancel(context)),
        this.toolbarActionButton(context, this.actionFactory.confirm(context)),
      );
      return children;
    }

    if (!auth) return children;

    if (auth.allowImport) {
      moreItems.push(this.importOrExportMenuItem(context, "import"));
    }
    if (auth.allowExport) {
      moreItems.push(this.importOrExportMenuItem(context, "export"));
    }
    if (auth.allowCreate) {
      children.push(
        this.toolbarActionButton(context, this.actionFactory.create(context)),
      );
    }
    if (auth.allowPrint) {
      const action = this.actionFactory.print(context);
      moreItems.push({
        label: action.label,
        icon: this.factory.resolveIcon(action.icon ?? "print"),
        command: action.onAction,
      });
    }

    const listActions: UiAction[] = [];
    const multipleSelectActions: UiAction[] = [];

    if (auth.authorizedActions?.length) {
      multipleSelectActions.push(
        ...auth.authorizedActions
          .filter(
            (action: ModuleAction) =>
              action.actionModes === 4 &&
              action.promptType === "MULTIPLE_SELECT",
          )
          .map(
            (action: ModuleAction) =>
              ({
                id: `${action.actionName}-button`,
                name: action.actionName,
                role: `${UI_NAME}-${action.actionName}-action`,
                icon: action.displayIcon,
                label: action.displayLabel,
              }) as UiAction,
          ),
      );
      listActions.push(
        ...auth.authorizedActions
          .filter(
            (action: ModuleAction) =>
              action.actionModes === 4 &&
              action.promptType !== "MULTIPLE_SELECT",
          )
          .map(
            (action: ModuleAction) =>
              ({
                id: `${action.actionName}-button`,
                name: action.actionName,
                role: `${UI_NAME}-${action.actionName}-action`,
                icon: action.displayIcon,
                label: action.displayLabel,
                colorRole: (
                  action.displayHint as string | undefined
                )?.toLowerCase(),
                onAction: () =>
                  (context as any).doAction?.(
                    {
                      name: action.actionName,
                      icon: action.displayIcon,
                      label: action.displayLabel,
                    },
                    context.model,
                  ),
              }) as UiAction,
          ),
      );
    }

    if (auth.allowDelete) {
      multipleSelectActions.unshift({
        id: "delete-all-button",
        name: "deleteAll",
        role: `${UI_NAME}-delete-all-action`,
        label: $t("action.deleteAll"),
        icon: "fas fa-trash-alt",
        colorRole: "danger",
        onAction: () => {
          runtime.toSelectManyIndex?.("deleteAll", async () => {
            const action = this.actionFactory.deleteAll(context);
            await action.onAction?.();
            return true;
          });
        },
      });
    }

    children.push(
      ...this.assembleMultipleSelectionButtons(context, multipleSelectActions),
    );

    if (
      customActions?.length &&
      (view === UiViewMany.SelectMany || selectionMode !== "multiple")
    ) {
      listActions.push(
        ...customActions
          .filter((action: UiAction) =>
            auth.authorizedActions?.some(
              (item: ModuleAction) => item.actionName === action.name,
            ),
          )
          .map((action: UiAction) =>
            this.actionFactory.action(context, action as any),
          ),
      );
    }

    moreItems.push(
      ...visibleActions(listActions).map((action) => ({
        label: action.label,
        icon: this.factory.resolveIcon(action.icon ?? action.name ?? ""),
        disabled: action.disabled,
        command: action.onAction,
      })),
    );
    children.push(...this.assembleMoreButton(context, moreItems));

    return children;
  }

  private detailsViewActionButtons(context: UiContext): VNode[] {
    const runtime = context as any;
    const { model, customActions } = runtime;
    const auth = moduleAuth(context);
    const entityAuth = runtime.getModuleAuth?.(model) ?? auth;
    const children: VNode[] = [
      this.toolbarActionButton(context, this.actionFactory.back(context)),
    ];
    const moreItems: any[] = [];
    if (!entityAuth) return children;

    if (entityAuth.allowEdit && model?.editable !== false) {
      children.push(
        this.toolbarActionButton(context, this.actionFactory.edit(context)),
      );
    }
    if (entityAuth.allowCreate) {
      children.push(
        this.toolbarActionButton(context, this.actionFactory.create(context)),
      );
    }
    if (entityAuth.allowDelete && model?.deletable !== false) {
      children.push(
        this.toolbarActionButton(context, this.actionFactory.delete(context)),
      );
    }
    if (model?.actions?.length) {
      children.push(
        ...model.actions.map((action: any) =>
          this.toolbarActionButton(
            context,
            this.actionFactory.action(context, action as any),
            {
              id: `${action.name ?? action.actionName}-button`,
            },
          ),
        ),
      );
    }
    if (customActions?.length) {
      children.push(
        ...customActions
          .filter((action: UiAction) =>
            entityAuth.authorizedActions?.some(
              (item: ModuleAction) => item.actionName === action.name,
            ),
          )
          .map((action: UiAction) =>
            this.toolbarActionButton(
              context,
              this.actionFactory.action(context, action as any),
              {
                id: `${action.name}-button`,
              },
            ),
          ),
      );
    }
    if (entityAuth.allowPrint) {
      const action = this.actionFactory.print(context);
      moreItems.push({
        label: action.label,
        icon: this.factory.resolveIcon(action.icon ?? "print"),
        command: action.onAction,
      });
    }
    if (entityAuth.allowExport) {
      moreItems.push(this.importOrExportMenuItem(context, "export"));
    }
    if (entityAuth.allowImport) {
      moreItems.push(this.importOrExportMenuItem(context, "import"));
    }
    children.push(...this.assembleMoreButton(context, moreItems));
    return children;
  }

  private editViewActionButtons(context: UiContext): VNode[] {
    const runtime = context as any;
    const { customActions } = runtime;
    const auth = moduleAuth(context);
    const children: VNode[] = [
      this.toolbarActionButton(context, this.actionFactory.back(context)),
    ];
    if (auth?.allowImport) {
      children.push(
        this.buildImportOrExportAction(context, { role: "import" }),
      );
    }
    children.push(
      this.toolbarActionButton(context, {
        ...this.actionFactory.save(context),
        disabled: runtime.uploading?.value,
      }),
    );
    if (customActions?.length && auth?.authorizedActions?.length) {
      children.push(
        ...customActions
          .filter((action: UiAction) =>
            auth.authorizedActions!.some(
              (item: ModuleAction) => item.actionName === action.name,
            ),
          )
          .map((action: UiAction) =>
            this.toolbarActionButton(
              context,
              this.actionFactory.action(context, action as any),
              {
                id: `${action.name}-button`,
              },
            ),
          ),
      );
    }
    return children;
  }

  private toolbarActionButtons(context: UiContext): VNode[] {
    const runtime = context as any;
    if (runtime.many) return this.indexViewActionButtons(context);
    if (runtime.editing) return this.editViewActionButtons(context);
    return this.detailsViewActionButtons(context);
  }

  buildModuleToolbar(
    context: UiContext,
    props: ModuleToolbarProps,
    slots?: UiSlots,
  ) {
    const runtime = context as any;
    const module = moduleOf(context);
    const hasCenter = !!slots?.center;

    const start = () => {
      if (props.showBreadcrumb === false) return undefined;
      if (slots?.default) return slots.default();
      if (module) {
        return this.buildModuleBreadcrumb(context, {
          module,
          label: runtime.many ? "" : context.title,
        });
      }
      return h("strong", context.title);
    };
    const center = () =>
      hasCenter
        ? h(
            "div",
            { class: "mmda-sf-toolbar__center-inner" },
            slots!.center!(),
          )
        : undefined;
    const end = () =>
      props.showActions === false
        ? undefined
        : this.factory.buttonGroup(() => this.toolbarActionButtons(context), {
            class: "mmda-sf-toolbar-actions",
            role: `${UI_NAME}-toolbar-action-group`,
          });

    // 有搜索中区（index/select）用三列；编辑/详情仅左右，不占空中间列
    return h(
      "div",
      {
        class: [
          "mmda-sf-toolbar",
          hasCenter && "mmda-sf-toolbar--with-center",
        ],
      },
      [
        h("div", { class: "mmda-sf-toolbar__start" }, start() as any),
        hasCenter
          ? h("div", { class: "mmda-sf-toolbar__center" }, center() as any)
          : null,
        h("div", { class: "mmda-sf-toolbar__end" }, end() as any),
      ],
    );
  }

  buildSearchField(field: UiSearchField, _context: UiContext, props: PropData) {
    const meta = field.field;
    const bind = (value: any) => {
      field.searchVal.value = value;
    };
    let editor: VNode;
    if (meta.reference?.refOptions?.length) {
      editor = h(DropDownListComponent as any, {
        value: field.searchVal.value,
        dataSource: meta.reference.refOptions,
        change: (args: any) => bind(args.value),
        ...props,
      });
    } else if (SqlDataType.isBool(meta.dataType)) {
      editor = h(DropDownListComponent as any, {
        value: field.searchVal.value,
        dataSource: [
          { text: "Yes", value: true },
          { text: "No", value: false },
        ],
        fields: { text: "text", value: "value" },
        change: (args: any) => bind(args.value),
        ...props,
      });
    } else if (SqlDataType.isDate(meta.dataType)) {
      editor = h(DatePickerComponent as any, {
        value: field.searchVal.value,
        format: "yyyy-MM-dd",
        change: (args: any) => bind(args.value),
        ...props,
      });
    } else if (SqlDataType.isNum(meta.dataType)) {
      editor = h(NumericTextBoxComponent as any, {
        value: field.searchVal.value,
        change: (args: any) => bind(args.value),
        ...props,
      });
    } else {
      editor = h(TextBoxComponent as any, {
        value: field.searchVal.value,
        placeholder: meta.displayLabel,
        input: (args: any) => bind(args.value),
        ...props,
      });
    }
    return h("label", { class: "mmda-sf-search-field" }, [
      h("span", meta.displayLabel),
      editor,
    ]);
  }

  buildSearchForm(context: UiContext, props?: PropData) {
    return h(
      "form",
      {
        class: "mmda-sf-search-form",
        ...props,
        onSubmit: (event: Event) => event.preventDefault(),
      },
      ((context as any).searchFields ?? []).map((field: UiSearchField) =>
        this.buildSearchField(field, context, {}),
      ),
    );
  }

  buildModuleSearchbar(context: UiContext, props: ModuleSearchbarProps) {
    const runtime = context as any;
    const filters = runtime.filters ?? [];
    const quickFilters = filters.map((filter: any) =>
      h("div", { class: "mmda-sf-quick-filter" }, [
        h("span", { class: "mmda-sf-quick-filter__label" }, filter.label),
        filter.metaUiFilter.fixed
          ? this.factory.selectButton(filter.selectedConditions.value[0], {
              options: filter.selectOptions,
              modelValue: filter.selectedConditions.value[0],
              "onUpdate:modelValue": (condition: any) => {
                if (condition)
                  runtime.toggleQuickFilter(filter, condition, true);
                else filter.selectedConditions.value = [];
                runtime.searchParam.pager.pageNo = 1;
                void runtime.search?.();
              },
            })
          : h(MultiSelectComponent as any, {
              value: filter.selectedConditions.value,
              dataSource: filter.selectOptions,
              change: (args: any) => {
                filter.selectedConditions.value = args.value;
                runtime.syncQuickFilters?.();
                runtime.searchParam.pager.pageNo = 1;
                void runtime.search?.();
              },
            }),
      ]),
    );

    return h(
      "form",
      {
        class: "mmda-sf-searchbar",
        onSubmit: (event: Event) => {
          event.preventDefault();
          props.onSearch?.(runtime.searchParam?.searchWord ?? "");
        },
      },
      [
        ...quickFilters,
        ...(runtime.searchFields ?? []).map((field: UiSearchField) =>
          this.buildSearchField(field, context, {}),
        ),
        ...(runtime.customSearchFields ?? []).map((field: any) =>
          field.renderer(context, field),
        ),
        h(TextBoxComponent as any, {
          value: runtime.searchParam?.searchWord ?? "",
          placeholder: context.translate("action.search"),
          input: (args: any) => {
            runtime.searchParam.searchWord = args.value;
          },
        }),
        h(ButtonComponent as any, {
          content: context.translate("action.search"),
          iconCss: this.factory.resolveIcon("search"),
          isPrimary: true,
        }),
        (filters.length > 0 || runtime.searchFields?.length > 0) &&
          h(ButtonComponent as any, {
            content: context.translate("action.reset"),
            iconCss: this.factory.resolveIcon("reset"),
            cssClass: "e-outline",
            onClick: () => void runtime.resetFilters?.(),
          }),
      ],
    );
  }

  buildSearchForRelative(
    context: UiContext,
    field: MetaUiField,
    props: SearchForRelativeProps,
  ) {
    const reference = field.reference
    const refFlds = reference?.refFlds?.length
      ? reference.refFlds
      : ['value', 'text']
    // valueField / labelField = EJ2 fields.value / fields.text（属性名）
    const valueField =
      (props as any).valueField ??
      (props.dataKey as string) ??
      refFlds[0] ??
      'value'
    const labelField =
      (props as any).labelField ??
      (typeof props.optionLabel === 'string' ? props.optionLabel : null) ??
      refFlds[1] ??
      valueField
    const options = (props.options as any[]) ?? []
    const current = props.modelValue
    const selectedValue =
      current != null && typeof current === 'object'
        ? (reference?.valueOf(current) ?? current?.[valueField])
        : typeof current === 'object'
          ? null
          : current

    /** 保证 options 上有 labelField，供 EJ2 fields.text 读取（元数据标签字段名可能与实体字段不完全一致）。 */
    const resolveLabel = (item: any): string => {
      if (item == null || typeof item !== 'object') return ''
      const direct = item[labelField]
      if (direct != null && String(direct) !== '' && String(direct) !== 'undefined') {
        return String(direct)
      }
      const fromRef = reference?.labelOf?.(item)
      if (fromRef != null && String(fromRef) !== '' && String(fromRef) !== 'undefined') {
        return String(fromRef)
      }
      for (const key of [refFlds[1], 'categoryName', 'name', 'label', 'text']) {
        if (!key) continue
        const v = item[key]
        if (v != null && String(v) !== '' && String(v) !== 'undefined') return String(v)
      }
      return ''
    }
    const withLabel = (item: any) => {
      if (!item || typeof item !== 'object') return item
      const label = resolveLabel(item)
      if (label && item[labelField] !== label) item[labelField] = label
      return item
    }

    const selectedText =
      current != null && typeof current === 'object' ? resolveLabel(current) : ''

    const comboOptions = (
      current != null &&
      typeof current === 'object' &&
      !options.some(
        (option) =>
          (reference?.valueOf(option) ?? option?.[valueField]) ===
          selectedValue,
      )
        ? [current, ...options]
        : options
    ).map(withLabel)

    let ej2: any = null
    let pendingFilterArgs: any = null

    // 输入联想：防抖后远程查选项，再回填 ComboBox 下拉（勿触发 Vue 重渲染）
    const runRemoteFilter = debounce(async (text: string) => {
      try {
        await (context as any).searchRelative?.(field, text)
      } catch (error) {
        console.error(error)
      }
      const next = (context.getFieldOptions(field).selectOptions ?? []).map(
        withLabel,
      )
      try {
        pendingFilterArgs?.updateData?.(next)
        if (ej2 && !ej2.isDestroyed && Array.isArray(next)) {
          ej2.dataSource = next
        }
      } catch (error) {
        console.error(error)
      }
    }, 400)

    const openPickDialog = async (event?: Event) => {
      event?.preventDefault?.()
      event?.stopPropagation?.()
      try {
        if (typeof props.toSearch === 'function') {
          await props.toSearch(event as Event)
        } else {
          await (context as any).pickRelative?.(field)
        }
      } catch (error) {
        console.error(error)
        context.uiBuilder?.toast?.(context, {
          severity: 'error',
          summary: context.translate?.('dialog.title.error') ?? '错误',
          detail: error instanceof Error ? error.message : String(error),
          group: 'br',
          life: 3000,
        })
      }
    }

    /** 对齐老 SearchBox：下拉箭头换成放大镜，点击打开选择对话框（不是再挂一个按钮）。 */
    const bindSearchIcon = () => {
      const root =
        ej2?.inputWrapper?.container ??
        ej2?.overAllWrapper ??
        ej2?.element?.closest?.('.e-input-group') ??
        ej2?.element?.parentElement
      const icon = root?.querySelector?.(
        '.e-input-group-icon.e-ddl-icon, .e-ddl-icon',
      ) as HTMLElement | null
      if (!icon || icon.dataset.mmdaSearchBound === '1') return
      icon.dataset.mmdaSearchBound = '1'
      icon.className = 'e-input-group-icon e-icons e-search mmda-sf-search-pick'
      icon.setAttribute(
        'title',
        context.translate?.('action.search') ?? '搜索',
      )
      icon.setAttribute('aria-label', icon.getAttribute('title') ?? '搜索')
      icon.addEventListener(
        'mousedown',
        (event: MouseEvent) => {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          void openPickDialog(event)
        },
        true,
      )
    }

    const comboValue =
      selectedValue === 0 || selectedValue === '0' ? null : selectedValue

    return h(
      ComboBoxComponent as any,
      {
        // 稳定 key：输入过滤时不能重挂，否则 EJ2 filtering 中途 vnode 被拆掉
        key: `mmda-search-${field.fieldName}`,
        dataSource: comboOptions,
        fields: { text: labelField, value: valueField },
        value: comboValue,
        text: selectedText || null,
        allowFiltering: true,
        allowCustom: false,
        showClearButton: props.showClear !== false && field.nullable,
        placeholder:
          props.placeholder ??
          context.translate?.('action.select') ??
          '请选择',
        cssClass: [
          'mmda-sf-search-combo',
          props.invalid ? 'e-error' : '',
        ]
          .filter(Boolean)
          .join(' '),
        ref: (comp: any) => {
          ej2 = comp?.ej2Instances ?? comp ?? null
        },
        created: () => {
          queueMicrotask(bindSearchIcon)
          setTimeout(bindSearchIcon, 0)
        },
        filtering: (args: any) => {
          // 关闭本地过滤，改走远程 searchRelative（与老 AutoComplete 一致）
          args.preventDefaultAction = true
          pendingFilterArgs = args
          const text = String(args?.text ?? '').trim()
          if (!text) {
            args.updateData?.(
              (context.getFieldOptions(field).selectOptions ?? []).map(
                withLabel,
              ),
            )
            return
          }
          runRemoteFilter(text)
        },
        change: (args: any) => {
          const value = args?.value
          // 优先用 selectOptions 完整对象，勿把 EJ2 残缺 itemData 写回模型
          const item =
            context
              .getFieldOptions(field)
              .selectOptions.find(
                (option: any) =>
                  (reference?.valueOf(option) ?? option?.[valueField]) ===
                  value,
              ) ??
            (args?.itemData &&
            (reference?.valueOf(args.itemData) ??
              args.itemData?.[valueField]) != null
              ? args.itemData
              : null)
          props.onChange?.(item)
        },
      },
    )
  }

  buildBpmnDiagram(
    flowTrails: any[],
    _context: UiContext,
    props: PropData = {},
  ) {
    return h("section", { class: "mmda-sf-flow", ...props }, [
      h(BpmnDiagram, {
        nodes: props.nodes,
        connectors: props.connectors,
        readonly: props.readonly ?? true,
        height: props.height,
      }),
      flowTrails?.length
        ? h(
            "ol",
            { class: "mmda-sf-flow__trails" },
            flowTrails.map((item) =>
              h(
                "li",
                { key: item.id ?? item.name },
                item.label ?? item.name ?? String(item),
              ),
            ),
          )
        : undefined,
    ]);
  }

  buildQrcode(value: string, props: PropData = {}) {
    return h(QRCodeGenerator, { value, ...props });
  }

  buildBarcode(value: string, props: PropData = {}) {
    return h(BarcodeGenerator, { value, ...props });
  }

  buildSigninForm(props: SigninFormProps, slots?: SigninFormSlots) {
    return h(SigninForm, props, slots);
  }

  buildSignupForm(props: SignupFormProps) {
    const user = reactive({
      mobile: "",
      password: "",
      vcode: "",
      agreed: true,
    });
    return h(
      "form",
      {
        class: "mmda-sf-auth-form",
        onSubmit: (event: Event) => {
          event.preventDefault();
          props.onSubmit?.(user);
        },
      },
      [
        h(TextBoxComponent as any, {
          placeholder: "Mobile",
          value: user.mobile,
          input: (args: any) => (user.mobile = args.value),
        }),
        h(TextBoxComponent as any, {
          placeholder: "Password",
          type: "password",
          value: user.password,
          input: (args: any) => (user.password = args.value),
        }),
        h(TextBoxComponent as any, {
          placeholder: "Verification code",
          value: user.vcode,
          input: (args: any) => (user.vcode = args.value),
        }),
        h(ButtonComponent as any, { content: "Sign up", isPrimary: true }),
      ],
    );
  }
}

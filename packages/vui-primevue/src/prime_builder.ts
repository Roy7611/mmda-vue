import {
  h,
  reactive,
  type VNode,
  type VNodeArrayChildren,
} from "vue";
import { SqlDataType, pluralize, type MetaUiField, type MetaUiGroup, type Module, type ModuleAction, type ModuleAuth } from "@mmda/core";
import { VueUiBuilder, UiViewMany, assembleMenuItems, type AppSideBarProps, type AppTopBarProps, type ImportAndExportActionProps, type ModuleBreadcrumbProps, type ModuleSearchbarProps, type ModuleToolbarProps, type PrimeVueUiFactory, type UiProps, type SearchForRelativeProps, type SigninFormProps, type SigninFormSlots, type SignupFormProps, type UiAction, type UiFieldFactory, type UiSearchField, type UiSlots, type UiViewContext, paintModuleToolbar, defaultToolbarMoreActions } from "@mmda/vui"
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import DatePicker from "primevue/datepicker";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import MultiSelect from "primevue/multiselect";
import Password from "primevue/password";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import Toolbar from "primevue/toolbar";
import { PrimeGroupCard } from "./components/PrimeGroupCard";
import { PrimeAppSideMenu } from "./components/PrimeAppSideMenu";
import { PrimeVueOverlayHost } from "./components/PrimeVueOverlayHost";
import { createPrimeOverlay } from "./prime_overlay";
import { BpmnModeler } from "./components/BpmnModeler";
import { SigninForm } from "./components/SigninForm";
import { createPrimeVueFieldFactory } from "./prime_field_factory";
import { createPrimeVueUiFactory } from "./prime_factory";
import { primeLayout } from "./prime_layout";

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
  // 一级 SYSTEM 已在侧栏显示，面包屑从二级模块起
  const withoutSystem = chain.filter((item) => item.moduleType !== "SYSTEM");
  return withoutSystem.length ? withoutSystem : chain;
};

type UiContext = UiViewContext<any>;

const moduleOf = (context: UiContext): Module | undefined => {
  const runtime = context as any;
  return (runtime.module ?? runtime.logic?.module) as Module | undefined;
};

const moduleAuth = (context: UiContext): ModuleAuth | undefined =>
  moduleOf(context)?.authority;

const visibleActions = (actions: UiAction[]) =>
  actions.filter((action) => {
    const visible = action.visible
    if (visible == null) return true
    if (typeof visible === 'function') return true
    if (typeof visible === 'object' && visible !== null && 'value' in visible) {
      return Boolean((visible as { value: unknown }).value)
    }
    return Boolean(visible)
  })

export class PrimeVueUiBuilder extends VueUiBuilder {
  declare readonly factory: PrimeVueUiFactory;

  constructor(
    factory = createPrimeVueUiFactory(),
    fieldFactory: UiFieldFactory = createPrimeVueFieldFactory(),
  ) {
    super(
      factory,
      fieldFactory,
      factory.layout ?? primeLayout,
      createPrimeOverlay(),
    );
  }

  get overlayHost() {
    return PrimeVueOverlayHost;
  }

  override setColorScheme(dark: boolean) {
    super.setColorScheme(dark);
    if (typeof document !== "undefined")
      document.documentElement.classList.toggle("p-dark", dark);
  }

  override buildGroupCard(
    group: MetaUiGroup,
    body: VNode | VNode[],
    props: UiProps = {},
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
      PrimeGroupCard,
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

  buildContainer(content: VNode | VNodeArrayChildren, props?: UiProps) {
    return h("div", { class: "mmda-prime-container", ...props }, content);
  }

  buildHeader(content: VNode | VNodeArrayChildren, props?: UiProps) {
    return h("header", { class: "mmda-prime-header", ...props }, content);
  }

  buildAside(content: VNode | VNodeArrayChildren, props?: UiProps) {
    return h("aside", { class: "mmda-prime-aside", ...props }, content);
  }

  buildMain(content: VNode | VNodeArrayChildren, props?: UiProps) {
    return h("main", { class: "mmda-prime-main", ...props }, content);
  }

  buildFooter(content: VNode | VNodeArrayChildren, props?: UiProps) {
    return h("footer", { class: "mmda-prime-footer", ...props }, content);
  }

  buildAppTopBar(props: AppTopBarProps = { modules: [], logo: () => null }) {
    const items = props.modules.map((module) => ({
      label: module.moduleName ?? module.moduleLabel,
      url: module.moduleUrl ?? (module as any).url,
    }));
    return h(
      Toolbar,
      { class: "mmda-prime-topbar" },
      {
        start: () => [invoke(props.logo), this.factory.menubar(items)],
        end: () => invoke(props.actions),
      },
    );
  }

  buildAppSideBar(
    props: AppSideBarProps = { modules: [], header: () => null },
  ) {
    return this.buildAppSideMenu({
      modules: props.modules,
      logo: props.header,
      footer: props.footer,
    });
  }

  buildAppSideMenu(props: import("@mmda/core").UiAppSideMenuProps<VNode> = {}) {
    return h(PrimeAppSideMenu, props as any);
  }

  buildAppMenu(modules: Module[], props?: UiProps) {
    const { item, expand, ...rest } = props ?? {};
    if (expand === false) {
      const menuItems = assembleMenuItems(modules);
      return this.factory.menubar(
        menuItems,
        {
          class: "mmda-prime-app-menu",
          ...rest,
        },
        item ? { item } : undefined,
      );
    }
    return this.buildAppSideMenu({
      modules,
      class: "mmda-prime-app-menu",
      ...rest,
    });
  }

  buildLoading(_context: UiContext, props?: UiProps) {
    return this.factory.loading(props);
  }

  buildError(context: UiContext, props?: UiProps) {
    return h(
      Message,
      { severity: "error", class: "mmda-prime-error", ...props },
      () => context.title,
    );
  }

  buildModuleBreadcrumb(context: UiContext, props: ModuleBreadcrumbProps) {
    const { module, label } = props;
    if (!module) {
      return this.factory.breadcrumb({
        items: [{ label: label || context.title }],
        class: "mmda-prime-breadcrumb",
      });
    }

    const chain = moduleChain(module);
    const items = chain.map((item, index) => {
      const leaf = index === chain.length - 1 && !label;
      return {
        key: item.moduleCode,
        label: item.moduleLabel ?? (item as any).moduleName,
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

    return this.factory.breadcrumb({
      items,
      class: "mmda-prime-breadcrumb",
    });
  }

  buildImportOrExportAction(
    context: UiContext,
    props: ImportAndExportActionProps,
  ): VNode {
    const runtime = context as any;
    const repository = runtime.isRoot
      ? runtime.logic.repository
      : pluralize(context.metaUi.objName);
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
          icon: "pi pi-file",
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
      : pluralize(context.metaUi.objName);
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
          icon: "pi pi-file",
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
    if (!items.length) return [];
    return [
      this.factory.moreMenuButton(
        {
          label: context.t("action.more"),
          tooltip: context.t("action.more"),
          "aria-label": context.t("action.more"),
          buttonType: "tonal",
          colorRole: "secondary",
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
      this.factory.dropDownButton(
        {
          label: context.t("action.batchOperation"),
          class: "mmda-batch-menu-button",
          buttonType: "tonal",
          colorRole: "secondary",
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
    props?: UiProps,
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
              action.promptType === 'MULTIPLE_SELECT',
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
              action.promptType !== 'MULTIPLE_SELECT',
          )
          .map((action: ModuleAction) =>
            this.actionFactory.action(context, {
              id: `${action.actionName}-button`,
              name: action.actionName,
              icon: action.displayIcon,
              label: action.displayLabel,
              role: action.displayHint,
              executableExpression: action.executableExpression,
            }),
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
        onAction: () => this.actionFactory.deleteAll(context).onAction?.(),
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
            this.actionFactory.action(context, action),
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
    return paintModuleToolbar(this.factory, context, props, slots, {
      className: "mmda-prime-toolbar",
      breadcrumb: () => {
        if (module) {
          return this.buildModuleBreadcrumb(context, {
            module,
            label: props.breadcrumbLeaf || (runtime.many ? "" : context.title),
          });
        }
        return h("strong", context.title);
      },
      actionGroup: () =>
        this.factory.buttonGroup(() => this.toolbarActionButtons(context), {
          class: "mmda-prime-toolbar-actions",
          role: `${UI_NAME}-toolbar-action-group`,
        }),
      moreActions: () => defaultToolbarMoreActions(this.actionFactory, context),
      navActions: () =>
        module
          ? moduleChain(module).map((item) => ({
              name: item.moduleCode,
              label: item.moduleLabel ?? (item as any).moduleName,
              icon: item.moduleIcon,
            }))
          : [],
      openSearchPage: () => {
        if (props.onSearchPage) props.onSearchPage();
        else void this.buildSearchPage(context);
      },
    });
  }

  buildSearchField(field: UiSearchField, _context: UiContext, props: UiProps) {
    const meta = field.field;
    const common = {
      modelValue: field.searchVal.value,
      placeholder: meta.displayLabel,
      size: "small",
      "onUpdate:modelValue": (value: any) => {
        field.searchVal.value = value;
      },
      ...props,
    };
    let editor: VNode;
    if (meta.reference?.refOptions?.length) {
      editor = h(Select, {
        ...common,
        options: meta.reference.refOptions,
        optionLabel: (option: any) => meta.reference!.labelOf(option),
        showClear: true,
      });
    } else if (SqlDataType.isBool(meta.dataType)) {
      editor = h(Select, {
        ...common,
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
        optionLabel: "label",
        optionValue: "value",
        showClear: true,
      });
    } else if (SqlDataType.isDate(meta.dataType)) {
      editor = h(DatePicker, {
        ...common,
        dateFormat: "yy-mm-dd",
        showIcon: true,
      });
    } else if (SqlDataType.isNum(meta.dataType)) {
      editor = h(InputNumber, common);
    } else {
      editor = h(InputText, common);
    }
    return h("label", { class: "mmda-prime-search-field" }, [
      h("span", meta.displayLabel),
      editor,
    ]);
  }

  buildSearchForm(context: UiContext, props?: UiProps) {
    return h(
      "form",
      {
        class: "mmda-prime-search-form",
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
      h("div", { class: "mmda-prime-quick-filter" }, [
        h("span", { class: "mmda-prime-quick-filter__label" }, filter.label),
        filter.metaUiFilter.fixed
          ? h(SelectButton, {
              modelValue: filter.selectedConditions.value[0],
              options: filter.selectOptions,
              optionLabel: "displayLabel",
              allowEmpty: true,
              "onUpdate:modelValue": (condition: any) => {
                if (condition)
                  runtime.toggleQuickFilter(filter, condition, true);
                else filter.selectedConditions.value = [];
                runtime.searchParam.pager.pageNo = 1;
                void runtime.search?.();
              },
            })
          : h(MultiSelect, {
              modelValue: filter.selectedConditions.value,
              options: filter.selectOptions,
              optionLabel: "displayLabel",
              display: "chip",
              placeholder: filter.label,
              "onUpdate:modelValue": (conditions: any[]) => {
                filter.selectedConditions.value = conditions;
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
        class: "mmda-prime-searchbar",
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
        h(InputText, {
          modelValue: runtime.searchParam?.searchWord ?? "",
          placeholder: context.translate("action.search"),
          size: "small",
          "onUpdate:modelValue": (value: string) => {
            runtime.searchParam.searchWord = value;
          },
        }),
        h(Button, {
          type: "submit",
          icon: "pi pi-search",
          label: context.translate("action.search"),
          size: "small",
        }),
        (filters.length > 0 || runtime.searchFields?.length > 0) &&
          h(Button, {
            type: "button",
            icon: "pi pi-filter-slash",
            label: context.translate("action.reset"),
            variant: "text",
            size: "small",
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
      : ["value", "text"]
    const valueKey = (props.dataKey as string) ?? refFlds[0] ?? "value"
    const labelKey =
      typeof props.optionLabel === "string"
        ? props.optionLabel
        : (refFlds[1] ?? valueKey)
    const options = (props.options as any[]) ?? []

    const openPick = async (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
      try {
        if (typeof props.toSearch === "function") {
          await props.toSearch(event)
          return
        }
        await (context as any).select(field)
      } catch (error) {
        console.error(error)
      }
    }

    // 对齐老 SearchBox：可编辑 Select，下拉图标换成放大镜并打开选择对话框
    return h(Select, {
      options,
      optionLabel:
        typeof props.optionLabel === "function"
          ? props.optionLabel
          : labelKey,
      dataKey: valueKey,
      modelValue: props.modelValue,
      editable: true,
      filter: true,
      showClear: props.showClear !== false && field.nullable,
      placeholder:
        props.placeholder ??
        context.translate?.("action.select") ??
        "请选择",
      invalid: props.invalid,
      class: "mmda-prime-search-combo",
      "onUpdate:modelValue": (value: any) => props.onChange?.(value),
      onFilter: (event: any) => {
        const text = String(event?.value ?? "")
        props.onInput?.(text)
        void (context as any).searchRelative?.(field, text)
      },
      pt: {
        dropdown: {
          onClick: openPick,
          title: context.translate?.("action.search") ?? "搜索",
        },
      },
    }, {
      dropdownicon: () => h("span", { class: "pi pi-search" }),
    })
  }

  buildBpmnDiagram(
    flowTrails: any[],
    _context: UiContext,
    props: UiProps = {},
  ) {
    return h("section", { class: "mmda-prime-flow", ...props }, [
      props.xml
        ? h(BpmnModeler, {
            xml: props.xml,
            readonly: props.readonly ?? true,
            height: props.height,
            "onUpdate:xml": props.onUpdateXml,
          })
        : undefined,
      flowTrails?.length
        ? h(
            "ol",
            { class: "mmda-prime-flow__trails" },
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
        class: "mmda-prime-auth-form",
        onSubmit: (event: Event) => {
          event.preventDefault();
          props.onSignup?.(user);
        },
      },
      [
        h(InputText, {
          placeholder: "Mobile",
          modelValue: user.mobile,
          "onUpdate:modelValue": (value: string) => (user.mobile = value),
        }),
        h(Password, {
          placeholder: "Password",
          modelValue: user.password,
          "onUpdate:modelValue": (value: string) => (user.password = value),
        }),
        h(InputText, {
          placeholder: "Verification code",
          modelValue: user.vcode,
          "onUpdate:modelValue": (value: string) => (user.vcode = value),
        }),
        h(Button, { type: "submit", label: "Sign up" }),
      ],
    );
  }
}

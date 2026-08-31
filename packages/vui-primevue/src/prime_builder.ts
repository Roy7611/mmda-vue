import {
  h,
  reactive,
  unref,
  type VNode,
  type VNodeArrayChildren,
} from "vue";
import { RouterLink } from "vue-router";
import {
  ModuleActionMode,
  ModuleActionPromptType,
  SqlDataType,
  pluralize,
  type MetaUiField,
  type MetaUiGroup,
  type Module,
  type ModuleAction,
  type ModuleAuth,
} from "@mmda/core";
import {
  AbstractUiBuilder,
  AppSideMenu,
  UiViewMany,
  assembleMenuItems,
  type AppSideBarProps,
  type AppTopBarProps,
  type ImportAndExportActionProps,
  type ModuleBreadcrumbProps,
  type ModuleSearchbarProps,
  type ModuleToolbarProps,
  type PrimeVueUiFactory,
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
import Breadcrumb from "primevue/breadcrumb";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import DatePicker from "primevue/datepicker";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import MultiSelect from "primevue/multiselect";
import Password from "primevue/password";
import ProgressSpinner from "primevue/progressspinner";
import Select from "primevue/select";
import SelectButton from "primevue/selectbutton";
import Toolbar from "primevue/toolbar";
import { PrimeGroupCard } from "./components/PrimeGroupCard";
import { PrimeVueOverlayHost } from "./components/PrimeVueOverlayHost";
import { createPrimeOverlay } from "./prime_overlay";
import { BpmnModeler } from "./components/BpmnModeler";
import { CodeImage } from "./components/CodeImage";
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
  return chain;
};

const breadcrumbItem = (item: {
  label?: string;
  icon?: string;
  route?: string;
  leaf?: boolean;
}) =>
  h(
    item.leaf || !item.route ? "span" : RouterLink,
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

export class PrimeVueUiBuilder extends AbstractUiBuilder {
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
    props: PropData = {},
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

  buildContainer(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("div", { class: "mmda-prime-container", ...props }, content);
  }

  buildHeader(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("header", { class: "mmda-prime-header", ...props }, content);
  }

  buildAside(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("aside", { class: "mmda-prime-aside", ...props }, content);
  }

  buildMain(content: VNode | VNodeArrayChildren, props?: PropData) {
    return h("main", { class: "mmda-prime-main", ...props }, content);
  }

  buildFooter(content: VNode | VNodeArrayChildren, props?: PropData) {
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
    return h("aside", { class: "mmda-prime-sidebar" }, [
      h("div", { class: "mmda-prime-sidebar__header" }, invoke(props.header)),
      h("div", { class: "mmda-prime-sidebar__body" }, [
        h(AppSideMenu, { modules: props.modules }),
      ]),
      h("div", { class: "mmda-prime-sidebar__footer" }, invoke(props.footer)),
    ]);
  }

  buildAppMenu(modules: Module[], props?: PropData) {
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
    return h(AppSideMenu, {
      modules,
      class: "mmda-prime-app-menu",
      ...rest,
    });
  }

  buildLoading(_context: UiContext, props?: PropData) {
    return h("div", { class: "mmda-prime-loading", ...props }, [
      h(ProgressSpinner as any, { strokeWidth: "4" }),
    ]);
  }

  buildError(context: UiContext, props?: PropData) {
    return h(
      Message,
      { severity: "error", class: "mmda-prime-error", ...props },
      () => context.title,
    );
  }

  buildModuleBreadcrumb(context: UiContext, props: ModuleBreadcrumbProps) {
    const { module, label } = props;
    if (!module) {
      return h(
        "span",
        { class: "mmda-prime-breadcrumb" },
        label || context.title,
      );
    }

    const model = moduleChain(module).map((item, index, items) => ({
      key: item.moduleCode,
      label: item.moduleLabel ?? (item as any).moduleName,
      icon: item.moduleIcon,
      route: item.moduleUrl,
      leaf: index === items.length - 1 && !label,
    }));

    if (label) {
      model.push({
        key: `${module.moduleCode}-title`,
        label,
        icon: undefined,
        route: undefined,
        leaf: true,
      });
    }

    return h(
      Breadcrumb,
      { model, class: "mmda-prime-breadcrumb" },
      {
        item: ({ item }: { item: (typeof model)[number] }) =>
          breadcrumbItem(item),
      },
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
              action.actionModes === ModuleActionMode.LIST &&
              action.promptType === ModuleActionPromptType.MULTIPLE_SELECT,
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
              action.actionModes === ModuleActionMode.LIST &&
              action.promptType !== ModuleActionPromptType.MULTIPLE_SELECT,
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
            this.actionFactory.action(context, action),
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
              this.actionFactory.action(context, action),
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
              this.actionFactory.action(context, action),
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

    return h(
      Toolbar,
      {
        class: [
          "mmda-prime-toolbar",
          hasCenter && "mmda-prime-toolbar--with-center",
        ],
      },
      {
        start: () => {
          if (props.showBreadcrumb === false) return undefined;
          if (slots?.default) return slots.default();
          if (module) {
            return this.buildModuleBreadcrumb(context, {
              module,
              label: runtime.many ? "" : context.title,
            });
          }
          return h("strong", context.title);
        },
        center: () =>
          hasCenter
            ? h("div", { class: "mmda-prime-toolbar-center" }, slots!.center!())
            : undefined,
        end: () =>
          props.showActions === false
            ? undefined
            : this.factory.buttonGroup(
                () => this.toolbarActionButtons(context),
                {
                  class: "mmda-prime-toolbar-actions",
                  role: `${UI_NAME}-toolbar-action-group`,
                },
              ),
      },
    );
  }

  buildSearchField(field: UiSearchField, _context: UiContext, props: PropData) {
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

  buildSearchForm(context: UiContext, props?: PropData) {
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
        await (context as any).pickRelative?.(field)
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
    props: PropData = {},
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

  buildQrcode(value: string, props: PropData = {}) {
    return h(CodeImage, { value, type: "qr", ...props });
  }

  buildBarcode(value: string, props: PropData = {}) {
    return h(CodeImage, { value, type: "barcode", ...props });
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
          props.onSubmit?.(user);
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

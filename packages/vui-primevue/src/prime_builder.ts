import {
  h,
  reactive,
  type VNode,
} from "vue";
import { DATE_RANGE_FILTER_KINDS, SqlDataType, pluralize, type MetaUiGroup, type Module } from "@mmda/core";
import { VueUiBuilder, assembleMenuItems, pageLayoutMenuItems, paintDetailsTopbar, type AppSideBarProps, type AppTopBarProps, type ImportAndExportActionProps, type ModuleSearchbarProps, type VueUiFactory, type VueUiFieldFactory, type UiProps, type SigninFormProps, type SigninFormSlots, type SignupFormProps, type UiAction, type UiSearchField, type UiSlots, type VueUiContext, ListSearchField } from "@mmda/vui"
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import DatePicker from "primevue/datepicker";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
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

const invoke = (value: unknown): any =>
  typeof value === "function" ? (value as () => unknown)() : value;

type UiContext = VueUiContext<any>;

export class PrimeVueUiBuilder extends VueUiBuilder {
  declare readonly factory: VueUiFactory;

  constructor(
    factory = createPrimeVueUiFactory(),
    fieldFactory: VueUiFieldFactory = createPrimeVueFieldFactory(),
  ) {
    super(
      factory,
      fieldFactory,
      primeLayout,
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

  buildAppTopBar(props: AppTopBarProps = { modules: [], logo: () => null }) {
    const items = props.modules.map((module) => ({
      label: module.moduleName ?? module.moduleLabel,
      url: module.moduleUrl ?? (module as any).url,
    }));
    return h(
      Toolbar,
      { class: "mmda-topbar" },
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
          class: "mmda-app-menu",
          ...rest,
        },
        item ? { item } : undefined,
      );
    }
    return this.buildAppSideMenu({
      modules,
      class: "mmda-app-menu",
      ...rest,
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

  private toolbarActionButton(
    context: UiContext,
    action: UiAction,
    props?: UiProps,
  ) {
    return this.factory.actionButton(
      action,
      (message) => context.t(message),
      false,
      {
        size: "small",
        ...props,
      },
    );
  }

  buildDetailsTopbar(
    context: UiContext,
    props?: Parameters<VueUiBuilder["buildDetailsTopbar"]>[1],
    slots?: UiSlots,
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
    } else if (SqlDataType.isDate(meta.dataType) && field.currentOp === "WITHIN") {
      editor = h(Select, {
        ...common,
        options: DATE_RANGE_FILTER_KINDS.map((kind) => ({
          label: _context.translate(`dateRange.${kind}`),
          value: kind,
        })),
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
    return h("label", { class: "mmda-search-field" }, [
      h("span", meta.displayLabel),
      editor,
    ]);
  }

  buildModuleSearchbar(context: UiContext, rawProps?: UiProps) {
    // 契约型 `UiProps` → 具体形状在实现内收敛（同 `buildFilterBar` 的写法）
    const props = (rawProps ?? {}) as ModuleSearchbarProps;
    const runtime = context as any;
    const filters = runtime.filters ?? [];
    const quickFilters = filters.map((filter: any) =>
      h("div", { class: "mmda-quick-filter" }, [
        h("span", { class: "mmda-quick-filter__label" }, filter.label),
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
        class: "mmda-searchbar",
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
        h(ListSearchField, {
          context: runtime,
          onFuzzySearch: () =>
            props.onSearch?.(runtime.searchParam?.searchWord ?? ""),
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

  buildBpmnDiagram(
    flowTrails: any[],
    _context: UiContext,
    props: UiProps = {},
  ) {
    return h("section", { class: "mmda-flow", ...props }, [
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
            { class: "mmda-flow__trails" },
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
        class: "mmda-auth-form",
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

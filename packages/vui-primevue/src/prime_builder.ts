import {
  h,
  reactive,
  type VNode,
} from "vue";
import { DATE_RANGE_FILTER_KINDS, SqlDataType, pluralize, type MetaUiGroup, type Module, type UiContext } from "@mmda/core";
import { VuiBuilder, assembleMenuItems, pageLayoutMenuItems, paintDetailsTopbar, type AppSideBarProps, type AppTopBarProps, type ImportAndExportActionProps, type ModuleSearchbarProps, type VuiFactory, type VuiFieldFactory, type UiProps, type SigninFormProps, type SigninFormSlots, type SignupFormProps, type UiAction, type VuiTileSlots, ListSearchField } from "@mmda/vui"
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
import { PrimeVuiOverlayHost } from "./components/PrimeVuiOverlayHost";
import { createPrimeVuiOverlay } from "./prime_overlay";
import { PrimeBpmnModeler } from "./components/PrimeBpmnModeler";
import { PrimeSigninForm } from "./components/PrimeSigninForm";
import { createPrimeVuiFieldFactory } from "./prime_field_factory";
import { createPrimeVuiFactory } from "./prime_factory";
import { primeVuiLayout } from "./prime_layout";

const invoke = (value: unknown): any =>
  typeof value === "function" ? (value as () => unknown)() : value;

type GroupCardProps = UiProps & {
  container?: "card" | "fieldset" | "tab" | "none";
  region?: string;
  many?: boolean;
  direction?: "vertical" | "horizontal" | "row" | "column";
  cols?: number;
  headerActions?: VNode | VNode[];
};

type AppMenuProps = UiProps & { item?: unknown; expand?: boolean };

type BpmnDiagramProps = UiProps & {
  xml?: string;
  readonly?: boolean;
  height?: string | number;
  onUpdateXml?: (xml: string) => void;
};

export class PrimeVuiBuilder extends VuiBuilder {
  declare readonly factory: VuiFactory;

  constructor(
    factory = createPrimeVuiFactory(),
    fieldFactory: VuiFieldFactory = createPrimeVuiFieldFactory(),
  ) {
    super(
      factory,
      fieldFactory,
      primeVuiLayout,
      createPrimeVuiOverlay(),
    );
  }

  get overlayHost() {
    return PrimeVuiOverlayHost;
  }

  override setColorScheme(dark: boolean) {
    super.setColorScheme(dark);
    if (typeof document !== "undefined")
      document.documentElement.classList.toggle("p-dark", dark);
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
      logo: props.header as () => VNode,
      footer: props.footer as (() => VNode) | undefined,
    });
  }

  buildAppSideMenu(props: import("@mmda/core").UiAppSideMenuProps<VNode> = {}) {
    return h(PrimeAppSideMenu, props as any);
  }

  buildAppMenu(modules: Module[], props?: AppMenuProps) {
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
        colorRole: action.colorRole,
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
        (filters.length > 0 || Boolean(runtime.searchParam?.filterModel)) &&
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
    props: BpmnDiagramProps = {},
  ) {
    return h("section", { class: "mmda-flow", ...props }, [
      props.xml
        ? h(PrimeBpmnModeler, {
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
    return h(PrimeSigninForm, props, slots);
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

import { h, type VNode } from "vue";
import { SqlDataType } from "@mmda/core";
import type { AbstractUiBuilder } from "@mmda/vui";
import type {
  ModuleBreadcrumbProps,
  ModuleSearchbarProps,
  ModuleToolbarProps,
  PropData,
  UiSearchField,
  UiSlots,
} from "@mmda/vui";
import { DatePickerComponent } from "@syncfusion/ej2-vue-calendars";
import {
  DropDownListComponent,
  MultiSelectComponent,
} from "@syncfusion/ej2-vue-dropdowns";
import {
  NumericTextBoxComponent,
  TextBoxComponent,
} from "@syncfusion/ej2-vue-inputs";
import {
  SfSearchTextInput,
  UI_NAME,
  breadcrumbItem,
  moduleChain,
  moduleOf,
  type UiContext,
} from "./utils";

type ModuleBarHost = any;

export { SfSearchTextInput, breadcrumbItem, moduleChain } from "./utils";

export function buildModuleBreadcrumb(
  this: AbstractUiBuilder,
  context: UiContext,
  props: ModuleBreadcrumbProps,
) {
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

export function buildModuleToolbar(
  this: ModuleBarHost,
  context: UiContext,
  props: ModuleToolbarProps & { breadcrumbLeaf?: string },
  slots?: UiSlots,
) {
  const runtime = context as any;
  const module = moduleOf(context);
  const hasCenter = !!slots?.center;

  const start = () => {
    if (props.showBreadcrumb === false) return undefined;
    if (slots?.default) return slots.default();
    if (module) {
      return buildModuleBreadcrumb.call(this, context, {
        module,
        label: props.breadcrumbLeaf || (runtime.many ? "" : context.title),
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

export function buildSearchField(
  field: UiSearchField,
  _context: UiContext,
  props: PropData,
) {
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

export function buildSearchForm(
  context: UiContext,
  props?: PropData,
) {
  return h(
    "form",
    {
      class: "mmda-sf-search-form",
      ...props,
      onSubmit: (event: Event) => event.preventDefault(),
    },
    ((context as any).searchFields ?? []).map((field: UiSearchField) =>
      buildSearchField(field, context, {}),
    ),
  );
}

export function buildModuleSearchbar(
  this: AbstractUiBuilder,
  context: UiContext,
  props: ModuleSearchbarProps & { onRefresh?: () => void },
) {
  const runtime = context as any;
  const filters = runtime.filters ?? [];
  const searchLabel = context.translate("action.search");
  const refreshLabel = context.translate("action.refresh");
  const submitFuzzySearch = () => {
    const word = String(runtime.searchParam?.searchWord ?? "").trim();
    runtime.searchParam.searchWord = word;
    runtime.searchParam.pager.pageNo = 1;
    if (!word) {
      void runtime.resetFilters?.();
      return;
    }
    props.onSearch?.(word);
  };
  const refreshSearch = () => {
    if (props.onRefresh) {
      props.onRefresh();
      return;
    }
    void runtime.search?.();
  };
  const addonButton = (
    icon: string,
    title: string,
    onClick: () => void,
  ) =>
    h(
      "button",
      {
        type: "button",
        class: "e-input-group-icon mmda-sf-searchbar__addon",
        title,
        "aria-label": title,
        onClick: (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        },
      },
      [h("span", { class: icon, "aria-hidden": "true" })],
    );
  const searchAddons = () =>
    h("span", { class: "mmda-sf-searchbar__addons" }, [
      addonButton(
        this.factory.resolveIcon("search"),
        searchLabel,
        submitFuzzySearch,
      ),
      addonButton(
        this.factory.resolveIcon("refresh"),
        refreshLabel,
        refreshSearch,
      ),
    ]);
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
        submitFuzzySearch();
      },
    },
    [
      ...quickFilters,
      ...(runtime.searchFields ?? []).map((field: UiSearchField) =>
        buildSearchField(field, context, {}),
      ),
      ...(runtime.customSearchFields ?? []).map((field: any) =>
        field.renderer(context, field),
      ),
      h(
        SfSearchTextInput,
        {
          runtime,
          placeholder: searchLabel,
          cssClass: "e-small mmda-sf-searchbar__input",
          onEnter: submitFuzzySearch,
          appendTemplate: "appendTemplate",
        },
        { appendTemplate: searchAddons },
      ),
    ],
  );
}

import { h, type VNode } from "vue";
import { SqlDataType, uiCssClass } from "@mmda/core";
import type { VueUiBuilder } from "@mmda/vui"
import type { ModuleBreadcrumbProps, ModuleSearchbarProps, ModuleToolbarProps, UiProps, UiSearchField, UiSlots } from "@mmda/vui"
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
  moduleChain,
  moduleOf,
  type UiContext,
} from "./utils";
import { paintModuleToolbar, defaultToolbarMoreActions } from "@mmda/vui"

type ModuleBarHost = any;

export { SfSearchTextInput, moduleChain } from "./utils";

export function buildModuleBreadcrumb(
  this: VueUiBuilder,
  context: UiContext,
  props: ModuleBreadcrumbProps,
) {
  const { module, label } = props;
  if (!module) {
    return this.factory.breadcrumb({
      items: [{ label: label || context.title }],
      class: "mmda-breadcrumb",
      separator: "/",
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
    class: "mmda-breadcrumb",
    separator: "/",
  });
}

export function buildModuleToolbar(
  this: ModuleBarHost,
  context: UiContext,
  props: ModuleToolbarProps & { breadcrumbLeaf?: string },
  slots?: UiSlots,
) {
  const runtime = context as any;
  const module = moduleOf(context);
  return paintModuleToolbar(this.factory, context, props, slots, {
    breadcrumb: () => {
      if (module) {
        return buildModuleBreadcrumb.call(this, context, {
          module,
          label: props.breadcrumbLeaf || (runtime.many ? "" : context.title),
        });
      }
      return h("strong", context.title);
    },
    actionGroup: (dense) =>
      this.factory.buttonGroup(
        () => this.toolbarActionButtons(context, dense),
        {
          class: uiCssClass("toolbar-actions"),
          role: "group",
        },
      ),
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

export function buildSearchField(
  field: UiSearchField,
  _context: UiContext,
  props: UiProps,
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
  return h("label", { class: "mmda-search-field" }, [
    h("span", meta.displayLabel),
    editor,
  ]);
}

export function buildSearchForm(
  context: UiContext,
  props?: UiProps,
) {
  return h(
    "form",
    {
      class: "mmda-search-form",
      ...props,
      onSubmit: (event: Event) => event.preventDefault(),
    },
    ((context as any).searchFields ?? []).map((field: UiSearchField) =>
      buildSearchField(field, context, {}),
    ),
  );
}

export function buildModuleSearchbar(
  this: VueUiBuilder,
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
        class: "e-input-group-icon mmda-searchbar__addon",
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
    h("span", { class: "mmda-searchbar__addons" }, [
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
    h("div", { class: "mmda-quick-filter" }, [
      h("span", { class: "mmda-quick-filter__label" }, filter.label),
      filter.metaUiFilter.fixed
        ? this.factory.selectButtonGroup(filter.selectedConditions.value[0], {
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
      class: "mmda-searchbar",
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
          cssClass: "e-small mmda-searchbar__input",
          onEnter: submitFuzzySearch,
          appendTemplate: "appendTemplate",
        },
        { appendTemplate: searchAddons },
      ),
    ],
  );
}

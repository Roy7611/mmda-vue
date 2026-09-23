import { h, type VNode } from "vue";
import { DATE_RANGE_FILTER_KINDS, SqlDataType } from "@mmda/core";
import type { VuiBuilder } from "@mmda/vui"
import type { ModuleSearchbarProps, UiProps } from "@mmda/vui"
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
  type SfVuiContext,
} from "./utils";
import { ListSearchField } from "@mmda/vui"

export { SfSearchTextInput, moduleChain } from "./utils";

export function buildModuleSearchbar(
  this: VuiBuilder,
  context: SfVuiContext,
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
        ? this.factory.selectButtonGroup({
            options: filter.selectOptions,
            modelValue: filter.selectedConditions.value[0],
            onUpdate: (condition: any) => {
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
      ...(runtime.customSearchFields ?? []).map((field: any) =>
        field.renderer(context, field),
      ),
      h(
        ListSearchField,
        {
          context: runtime,
          onFuzzySearch: submitFuzzySearch,
          inputClass: "e-small mmda-searchbar__input",
        },
        { default: () => searchAddons() },
      ),
    ],
  );
}

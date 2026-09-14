import { defineComponent, h, type PropType, type VNode } from "vue";
import {
  FieldFilter,
  isDateRangeKind,
  type FilterModel,
  type MetaUiField,
  type UiFilterBarProps,
} from "@mmda/core";
import type { VueUiContext } from "../../contexts/vue_ui_context";
import type { UiFactory } from "../factory/factory";
import { writeListFilterModel } from "./list_query";
import { indexTableMetaUi } from "./join_list_mode";

export type ListFilterBarChip = {
  fieldName: string;
  label: string;
};

function tOf(context: VueUiContext<any>, key: string) {
  return context.t(key);
}

function operatorText(context: VueUiContext<any>, operator?: string) {
  if (!operator) return "";
  const key = `matcher.${operator}`;
  const text = tOf(context, key);
  return text === key ? operator : text;
}

function optionLabel(field: MetaUiField | undefined, value: unknown) {
  const ref = field?.reference;
  if (!ref || value == null) return undefined;
  if (typeof value === "object") {
    const label = ref.labelOf(value);
    if (label != null && label !== "") return String(label);
  }
  const options = ref.refOptions;
  if (!Array.isArray(options)) return undefined;
  const hit = options.find((item) => ref.valueOf(item) === value);
  if (!hit) return undefined;
  const label = ref.labelOf(hit);
  return label == null || label === "" ? undefined : String(label);
}

function displayValue(
  context: VueUiContext<any>,
  field: MetaUiField | undefined,
  value: unknown,
): string {
  if (value == null || value === "") return "";
  if (isDateRangeKind(value)) {
    const key = `dateRange.${value}`;
    const text = tOf(context, key);
    return text === key ? String(value) : text;
  }
  if (typeof value === "boolean") {
    return tOf(context, value ? "boolean.yes" : "boolean.no");
  }
  return optionLabel(field, value) ?? String(value);
}

function formatLeaf(
  context: VueUiContext<any>,
  field: MetaUiField | undefined,
  filter: FieldFilter,
): string {
  const op = operatorText(context, filter.operator);
  if (filter.filterType === "set") {
    const values = (filter.values ?? [])
      .map((item) => displayValue(context, field, item))
      .filter(Boolean);
    return [op, values.join("、")].filter(Boolean).join(" ");
  }
  if (filter.filterType === "boolean") {
    if (filter.operator === "IS_TRUE" || filter.operator === "IS_FALSE") {
      return op;
    }
    return displayValue(context, field, filter.value);
  }
  if (filter.operator === "BETWEEN") {
    const from = displayValue(context, field, filter.value);
    const to = displayValue(context, field, filter.valueTo);
    return [op, [from, to].filter(Boolean).join(" ~ ")].filter(Boolean).join(" ");
  }
  if (
    filter.operator === "IS_NULL" ||
    filter.operator === "IS_NOT_NULL" ||
    filter.operator === "IS_BLANK" ||
    filter.operator === "IS_NOT_BLANK"
  ) {
    return op;
  }
  if (filter.filterType === "join") {
    const join = operatorText(context, filter.operator);
    return (filter.conditions ?? [])
      .filter((item) => !FieldFilter.isEmpty(item))
      .map((item) => formatLeaf(context, field, item))
      .join(` ${join} `);
  }
  if (filter.filterType === "multi") {
    return (filter.filterModels ?? [])
      .filter((item) => !FieldFilter.isEmpty(item))
      .map((item) => formatLeaf(context, field, item))
      .join("；");
  }
  return [op, displayValue(context, field, filter.value)].filter(Boolean).join(" ");
}

export function listFilterBarChips(
  context: VueUiContext<any>,
): ListFilterBarChip[] {
  const model = context.searchParam?.filterModel as FilterModel | undefined;
  if (!model) return [];
  const metaUi = indexTableMetaUi(context);
  const chips: ListFilterBarChip[] = [];
  for (const [fieldName, filter] of Object.entries(model)) {
    if (FieldFilter.isEmpty(filter)) continue;
    const field = metaUi.getField(fieldName);
    const title = field?.displayLabel || fieldName;
    const detail = formatLeaf(context, field, filter);
    chips.push({
      fieldName,
      label: detail ? `${title} ${detail}` : title,
    });
  }
  return chips;
}

function clearSearchField(context: VueUiContext<any>, fieldName: string) {
  for (const searchField of context.searchFields ?? []) {
    if (searchField.field?.fieldName !== fieldName) continue;
    searchField.searchWord = null;
    searchField.searchVal.value = null;
  }
}

function deleteFilterKey(context: VueUiContext<any>, fieldName: string) {
  const model = context.searchParam.filterModel;
  if (!model) return;
  delete model[fieldName];
  if (Object.keys(model).length === 0) context.searchParam.filterModel = undefined;
}

export function removeListFilterBarChip(
  context: VueUiContext<any>,
  fieldName: string,
) {
  deleteFilterKey(context, fieldName);
  clearSearchField(context, fieldName);
  writeListFilterModel(context.searchParam, context.searchParam.filterModel ?? {});
  context.listLayoutRev.value += 1;
  return context.search?.();
}

export function clearListFilterBar(context: VueUiContext<any>) {
  const model = { ...(context.searchParam.filterModel ?? {}) };
  for (const fieldName of Object.keys(model)) {
    if (FieldFilter.isEmpty(model[fieldName])) continue;
    deleteFilterKey(context, fieldName);
    clearSearchField(context, fieldName);
  }
  writeListFilterModel(context.searchParam, context.searchParam.filterModel ?? {});
  context.listLayoutRev.value += 1;
  return context.search?.();
}

/** 跟踪 searchParam.filterModel，列头过滤写完后不必整页重建也能长出芯片。 */
export const ListFilterBarView = defineComponent({
  name: "ListFilterBarView",
  props: {
    factory: { type: Object as PropType<UiFactory>, required: true },
    context: { type: Object as PropType<VueUiContext<any>>, required: true },
    extra: { type: Object as PropType<UiFilterBarProps>, default: () => ({}) },
  },
  setup(props) {
    return () => {
      void props.context.searchParam?.filterModel;
      return createListFilterBar(props.factory, props.context, props.extra ?? {});
    };
  },
});

export function createListFilterBar(
  factory: UiFactory,
  context: VueUiContext<any>,
  props: UiFilterBarProps = {},
): VNode | null {
  const chips = listFilterBarChips(context);
  const extra = props.chips?.();
  const extraNodes = extra == null ? [] : Array.isArray(extra) ? extra : [extra];
  if (!chips.length && !extraNodes.length) return null;
  const items = chips.map((chip) => ({
    label: chip.label,
    value: chip.fieldName,
  }));
  const chipList = items.length
    ? factory.chips?.({
        kind: "input",
        removable: true,
        outlined: true,
        items,
        onRemove: (item) => {
          const name = String(item.value ?? "");
          if (name) void removeListFilterBarChip(context, name);
        },
      })
    : null;
  return h("div", { class: "mmda-list-filter-bar" }, [
    chipList,
    ...extraNodes,
    chips.length
      ? factory.button({
          class: "mmda-list-filter-bar__clear",
          label: tOf(context, "action.clearFilters"),
          buttonType: "text",
          colorRole: "secondary",
          onClick: () => void clearListFilterBar(context),
        })
      : null,
  ]);
}

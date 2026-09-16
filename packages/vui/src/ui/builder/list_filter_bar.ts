import { defineComponent, h, type PropType, type VNode } from "vue";
import {
  DefaultFieldFilter,
  FieldFilter,
  chipValueEquals,
  isDateRangeKind,
  type FilterModel,
  type MetaUi,
  type MetaUiField,
  type UiFilterBarProps,
} from "@mmda/core";
import type { VueUiContext } from "../../contexts/vue_ui_context";
import type { UiFactory } from "../factory";
import { writeListFilterModel } from "./list_query";
import { indexTableMetaUi } from "./join_list_mode";
import {
  ALL_FILTER_CHIP,
  canDeleteNamedQuery,
  deleteNamedQuery,
  filterModelSetValues,
  listFixedFilterFieldNames,
  listSelfDefaultFilters,
  promptSaveNamedQuery,
  setFieldFilterValues,
} from "./list_named_query";
import { applyLastQuery, dismissLastQuery } from "./list_last_query";

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

export function filterModelChips(
  model: FilterModel | undefined,
  metaUi: MetaUi,
  t: (key: string) => string,
  skip: Set<string> = new Set(),
): ListFilterBarChip[] {
  if (!model) return [];
  const context = { t } as VueUiContext<any>;
  const chips: ListFilterBarChip[] = [];
  for (const [fieldName, filter] of Object.entries(model)) {
    if (skip.has(fieldName)) continue;
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

export function listFilterBarChips(
  context: VueUiContext<any>,
): ListFilterBarChip[] {
  return filterModelChips(
    context.searchParam?.filterModel as FilterModel | undefined,
    indexTableMetaUi(context),
    (key) => tOf(context, key),
    listFixedFilterFieldNames(context),
  );
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
  return context.search?.();
}

export function listFixedFilterChipGroups(context: VueUiContext<any>) {
  const metaUi = indexTableMetaUi(context);
  const allLabel = tOf(context, "action.all");
  const groups: Array<{
    fieldName: string;
    selected: string | number | Array<string | number>;
    items: Array<{ label: string; value: string | number; colorRole?: string }>;
  }> = [];
  for (const item of listSelfDefaultFilters(context)) {
    const field = metaUi.getField(item.fieldName);
    const reference = field?.reference;
    if (!field || !reference?.isEnum) continue;
    const options = reference.refOptions ?? [];
    const selectedValues = filterModelSetValues(
      context.searchParam?.filterModel,
      item.fieldName,
      field,
    )
      .map(
        (entry) =>
          DefaultFieldFilter.resolveValue(field, String(entry ?? "")) ?? entry,
      )
      .filter((entry) => entry !== undefined);
    const items = [
      {
        label: allLabel,
        value: ALL_FILTER_CHIP,
        colorRole: selectedValues.length ? undefined : "primary",
      },
      ...options.map((option) => {
        const value = reference.valueOf(option);
        const label = String(reference.labelOf(option) ?? value ?? "");
        const picked = selectedValues.some((entry) =>
          chipValueEquals(entry, value),
        );
        return {
          label,
          value: value as string | number,
          colorRole: picked ? "primary" : undefined,
        };
      }),
    ];
    groups.push({
      fieldName: item.fieldName,
      selected:
        selectedValues.length === 0
          ? ALL_FILTER_CHIP
          : selectedValues.length === 1
            ? (selectedValues[0] as string | number)
            : (selectedValues as Array<string | number>),
      items,
    });
  }
  return groups;
}

function iconButton(
  factory: UiFactory,
  className: string,
  icon: string,
  title: string,
  onClick: () => void,
) {
  return factory.button({
    class: className,
    icon: factory.resolveIcon?.(icon) ?? icon,
    tooltip: title,
    label: "",
    buttonType: "text",
    colorRole: "secondary",
    onClick,
  });
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
      void props.context.searchParam?.queryID;
      void props.context.lastQuery?.value;
      return createListFilterBar(props.factory, props.context, props.extra ?? {});
    };
  },
});

export function createListFilterBar(
  factory: UiFactory,
  context: VueUiContext<any>,
  props: UiFilterBarProps = {},
): VNode {
  const fixedGroups = listFixedFilterChipGroups(context);
  const chips = listFilterBarChips(context);
  const extra = props.chips?.();
  const extraNodes = extra == null ? [] : Array.isArray(extra) ? extra : [extra];
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
    : extraNodes.length || fixedGroups.length
      ? null
      : factory.chips?.({
          class: "mmda-list-filter-bar__all",
          kind: "action",
          items: [
            {
              label: tOf(context, "action.all"),
              value: ALL_FILTER_CHIP,
            },
          ],
          selected: ALL_FILTER_CHIP,
        });
  const fixedLists = fixedGroups.map((group) =>
    factory.chips?.({
      class: "mmda-list-filter-bar__fixed",
      kind: "action",
      items: group.items,
      selected: group.selected,
      onClick: (item) => {
        const value = item.value;
        if (value === ALL_FILTER_CHIP || value == null) {
          void setFieldFilterValues(context, group.fieldName, []);
          return;
        }
        void setFieldFilterValues(context, group.fieldName, [value]);
      },
    }),
  );
  const storedQuery = context.lastQuery?.value;
  const lastQueryLink = storedQuery
    ? h("span", { class: "mmda-list-filter-bar__last-query" }, [
        h(
          "button",
          {
            type: "button",
            class: "mmda-list-filter-bar__last-query-apply",
            onClick: () => void applyLastQuery(context),
          },
          tOf(context, "action.lastQuery"),
        ),
        h(
          "button",
          {
            type: "button",
            class: "mmda-list-filter-bar__last-query-dismiss",
            title: tOf(context, "action.clear"),
            onClick: () => void dismissLastQuery(context),
          },
          "×",
        ),
      ])
    : null;
  const queryID = context.searchParam?.queryID;
  const actions = h("div", { class: "mmda-list-filter-bar__actions" }, [
    iconButton(
      factory,
      "mmda-list-filter-bar__clear",
      "clear",
      tOf(context, "action.clearFilters"),
      () => void clearListFilterBar(context),
    ),
    iconButton(
      factory,
      "mmda-list-filter-bar__save",
      "save",
      tOf(context, "action.saveQuery"),
      () => void promptSaveNamedQuery(context, factory),
    ),
    queryID &&
    canDeleteNamedQuery({
      predifined: context.searchParam?.queryPredifined,
      queryID,
    })
      ? iconButton(
          factory,
          "mmda-list-filter-bar__delete-query",
          "delete",
          tOf(context, "action.deleteQuery"),
          () =>
            void deleteNamedQuery(context, {
              queryID,
              queryName: context.searchParam.queryName,
              predifined: context.searchParam.queryPredifined,
            }),
        )
      : null,
  ]);
  const empty = !fixedGroups.length && !items.length && !extraNodes.length;
  return h(
    "div",
    {
      class: empty
        ? "mmda-list-filter-bar mmda-list-filter-bar--empty"
        : "mmda-list-filter-bar",
    },
    [
      h("span", { class: "mmda-list-filter-bar__title" }, tOf(context, "action.filter")),
      ...fixedLists,
      chipList,
      lastQueryLink,
      ...extraNodes,
      actions,
    ],
  );
}

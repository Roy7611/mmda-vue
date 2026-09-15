import { defineComponent, h, ref } from "vue";
import {
  DefaultFieldFilter,
  EntityQuery,
  EntitySearchParam,
  FieldFilter,
  type FilterModel,
} from "@mmda/core";
import type { VueUiContext } from "../../contexts/vue_ui_context";
import type { UiFactory } from "../factory/factory";
import { writeListFilterModel } from "./list_query";
import { indexTableMetaUi } from "./join_list_mode";

export const LIST_SEARCH_MODE_FUZZY = "fuzzy";
export const LIST_SEARCH_MODE_NAMED = "named";
export type ListSearchMode = "fuzzy" | "named";

export const ALL_FILTER_CHIP = "__all__";
export const CUSTOMIZED_QUERY_REPO = "CustomizedQueries";

export function listSearchModeOf(context: VueUiContext<any>): ListSearchMode {
  return context.searchMode === LIST_SEARCH_MODE_NAMED
    ? LIST_SEARCH_MODE_NAMED
    : LIST_SEARCH_MODE_FUZZY;
}

export function setListSearchMode(
  context: VueUiContext<any>,
  mode: ListSearchMode,
) {
  context.searchMode = mode;
  if (context.searchParam) context.searchParam.searchWord = "";
}

export function listDefaultFieldFilters(
  context: VueUiContext<any>,
): DefaultFieldFilter[] {
  return DefaultFieldFilter.parse(context.logic?.module?.defaultFilter);
}

export function listSelfDefaultFilters(
  context: VueUiContext<any>,
): DefaultFieldFilter[] {
  return listDefaultFieldFilters(context).filter((item) =>
    DefaultFieldFilter.isSelf(item),
  );
}

export function listFixedFilterFieldNames(
  context: VueUiContext<any>,
): Set<string> {
  const metaUi = indexTableMetaUi(context);
  const names = new Set<string>();
  for (const item of listSelfDefaultFilters(context)) {
    const field = metaUi.getField(item.fieldName);
    if (field?.reference?.isEnum) names.add(item.fieldName);
  }
  return names;
}

export function setFieldFilterValues(
  context: VueUiContext<any>,
  fieldName: string,
  values: unknown[],
) {
  const model: FilterModel = { ...(context.searchParam.filterModel ?? {}) };
  if (!values.length) delete model[fieldName];
  else {
    const field = indexTableMetaUi(context).getField(fieldName);
    const raw = values[0];
    const value =
      field?.reference?.isEnum
        ? (DefaultFieldFilter.resolveValue(
            field,
            raw == null ? "" : String(raw),
          ) ?? raw)
        : raw;
    model[fieldName] = FieldFilter.in(value);
  }
  writeListFilterModel(context.searchParam, model);
  delete context.searchParam.queryID;
  delete context.searchParam.queryName;
  context.rememberLastQuery?.();
  return context.search?.();
}

export function filterModelSetValues(
  model: FilterModel | undefined,
  fieldName: string,
  field?: {
    reference?: {
      isEnum?: boolean;
      refOptions?: unknown[];
      valueOf?: (option: unknown) => unknown;
      labelOf?: (option: unknown) => unknown;
    };
  },
): unknown[] {
  const filter = model?.[fieldName];
  if (!filter || FieldFilter.isEmpty(filter)) return [];
  if (field?.reference?.isEnum) {
    return DefaultFieldFilter.includedValues(field, filter);
  }
  if (filter.filterType === "set") return [...(filter.values ?? [])];
  if (filter.value != null && filter.value !== "") return [filter.value];
  return [];
}

export function canDeleteNamedQuery(row: {
  predifined?: boolean;
} | null): boolean {
  return row != null && row.predifined !== true;
}

export function clearNamedQueryRef(context: VueUiContext<any>) {
  delete context.searchParam.queryID;
  delete context.searchParam.queryName;
  delete context.searchParam.queryPredifined;
}

export function applyNamedQuery(
  context: VueUiContext<any>,
  row: {
    queryID?: string;
    queryName?: string;
    queryExpression?: string;
    predifined?: boolean;
  },
): boolean {
  const parsed = EntityQuery.parse(row.queryExpression);
  if (parsed?.kind !== "query") return false;
  EntityQuery.apply(context.searchParam, parsed.query);
  context.searchParam.queryID = row.queryID;
  context.searchParam.queryName = row.queryName;
  context.searchParam.queryPredifined = row.predifined === true;
  delete context.searchParam.searchWord;
  if (context.searchParam.pager) context.searchParam.pager.pageNo = 1;
  context.rememberLastQuery?.();
  return true;
}

export async function searchNamedQueries(
  context: VueUiContext<any>,
  word: string,
): Promise<any[]> {
  const objName = context.metaUi?.objName;
  const client = context.apiClient;
  if (!objName || !client?.searchAll) return [];
  const param = EntitySearchParam.create(word.trim());
  param.pager.pageSize = 20;
  param.filterModel = { objName: FieldFilter.eq(objName) };
  const page = await client.searchAll(param, {
    repository: CUSTOMIZED_QUERY_REPO,
  });
  const rows = (page as { data?: any[] })?.data ?? [];
  return rows.filter((row) => {
    const parsed = EntityQuery.parse(row?.queryExpression);
    return parsed?.kind === "query";
  });
}

export async function deleteNamedQuery(
  context: VueUiContext<any>,
  row: { queryID?: string; queryName?: string; predifined?: boolean },
): Promise<boolean> {
  if (!canDeleteNamedQuery(row) || !row.queryID) return false;
  const builder = context.uiBuilder ?? context.app?.ui;
  const ok = await builder?.confirm?.(context, {
    message: context.t("confirmation.delete", { it: row.queryName ?? row.queryID }),
  });
  if (!ok) return false;
  await context.apiClient.deleteOne(String(row.queryID), {
    repository: CUSTOMIZED_QUERY_REPO,
  });
  if (context.searchParam.queryID === row.queryID) clearNamedQueryRef(context);
  return true;
}

export async function promptSaveNamedQuery(
  context: VueUiContext<any>,
  factory: UiFactory,
): Promise<boolean> {
  const builder = context.uiBuilder ?? context.app?.ui;
  if (!builder?.dialog || !factory.textInput) return false;
  const name = ref(String(context.searchParam.queryName ?? ""));
  const NameInput = defineComponent({
    name: "SaveNamedQueryInput",
    setup() {
      return () =>
        h("div", { class: "mmda-save-named-query" }, [
          factory.textInput!({
            value: name.value,
            placeholder: context.t("action.saveQueryName"),
            width: "100%",
            onChange: (value: string) => {
              name.value = String(value ?? "");
            },
          }),
        ]);
    },
  });
  const result = await builder.dialog(h(NameInput), context, {
    title: context.t("action.saveQuery"),
    width: "22rem",
    showFooter: true,
    buttons: "okCancel",
    enableResize: false,
  });
  if (result !== "ok") return false;
  const queryName = name.value.trim();
  if (!queryName) return false;
  const payload: Record<string, unknown> = {
    objName: context.metaUi?.objName,
    queryName,
    queryExpression: EntityQuery.stringify(
      EntityQuery.copy(context.searchParam),
    ),
    creatorOnly: true,
    predifined: false,
  };
  if (context.searchParam.queryID) payload.queryID = context.searchParam.queryID;
  await context.apiClient.saveOne(payload as any, {
    repository: CUSTOMIZED_QUERY_REPO,
  });
  context.searchParam.queryName = queryName;
  return true;
}

export function listSearchModeAddon(
  context: VueUiContext<any>,
  onChange?: () => void,
) {
  const mode = listSearchModeOf(context);
  return h(
    "select",
    {
      class: "mmda-searchbar__mode",
      value: mode,
      "aria-label": context.t?.("action.searchMode") ?? context.translate?.("action.searchMode"),
      onChange: (event: Event) => {
        const next = (event.target as HTMLSelectElement).value;
        setListSearchMode(
          context,
          next === LIST_SEARCH_MODE_NAMED
            ? LIST_SEARCH_MODE_NAMED
            : LIST_SEARCH_MODE_FUZZY,
        );
        onChange?.();
      },
    },
    [
      h(
        "option",
        { value: LIST_SEARCH_MODE_FUZZY },
        context.t?.("action.searchFuzzy") ?? context.translate?.("action.searchFuzzy"),
      ),
      h(
        "option",
        { value: LIST_SEARCH_MODE_NAMED },
        context.t?.("action.searchNamedQuery") ??
          context.translate?.("action.searchNamedQuery"),
      ),
    ],
  );
}

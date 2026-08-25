import { Paginator, defaultPager, type Pager } from "./pagination";

export type EntityFilterType = "text" | "number" | "date" | "set" | "boolean";

export type EntityFilterOperator =
  | "EQ"
  | "NEQ"
  | "GT"
  | "GTEQ"
  | "LT"
  | "LTEQ"
  | "STARTS_WITH"
  | "ENDS_WITH"
  | "CONTAINS"
  | "NOT_CONTAINS"
  | "IS_NULL"
  | "IS_NOT_NULL"
  | "IS_ALL"
  | "IS_TRUE"
  | "IS_FALSE"
  | "IN"
  | "NOT_IN"
  | "BETWEEN";

export interface EntitySimpleFieldFilter {
  filterType: "text" | "number" | "date";
  operator: EntityFilterOperator;
  value?: unknown;
  valueTo?: unknown;
}

export interface EntitySetFieldFilter {
  filterType: "set";
  operator?: "IN" | "NOT_IN";
  values: unknown[];
}

export interface EntityBooleanFieldFilter {
  filterType: "boolean";
  value: boolean | null;
}

export type EntityFieldFilter =
  EntitySimpleFieldFilter | EntitySetFieldFilter | EntityBooleanFieldFilter;

/** AG Grid 风格的字段过滤模型，键是实体字段名。 */
export type EntityFilterModel = Record<string, EntityFieldFilter>;

/**
 * 实体列表搜索参数。
 *
 * `queryParams` 保持在 URL 中，适合 GET、路由和快捷过滤。
 * `searchParams` 是复杂字段过滤模型，存在时通过 searchAll body 发送。
 */
export interface EntitySearchParam {
  pager: Pager;
  searchWord?: string;
  queryParams?: Record<string, unknown>;
  searchParams?: EntityFilterModel;
}

export interface EntitySearchRequest {
  queryParams: Record<string, unknown>;
  searchParams?: EntityFilterModel;
}

export function defaultSearchParam(searchWord = ""): EntitySearchParam {
  return {
    pager: defaultPager(),
    searchWord,
  };
}

const cloneRecord = <T extends Record<string, unknown>>(
  value?: T,
): T | undefined => (value == null ? undefined : ({ ...value } as T));

const cloneFilterModel = (value?: EntityFilterModel) =>
  value == null
    ? undefined
    : Object.fromEntries(
        Object.entries(value).map(([field, filter]) => [
          field,
          filter.filterType === "set"
            ? { ...filter, values: [...filter.values] }
            : { ...filter },
        ]),
      );

export function assignSearchParam(
  to: EntitySearchParam,
  src: EntitySearchParam,
) {
  to.pager.pageSize = src.pager.pageSize;
  to.pager.pageNo = src.pager.pageNo;
  to.pager.sorts = src.pager.sorts?.map((sort) => ({ ...sort }));
  to.searchWord = src.searchWord;
  if (src.queryParams) to.queryParams = cloneRecord(src.queryParams);
  else delete to.queryParams;
  if (src.searchParams) to.searchParams = cloneFilterModel(src.searchParams);
  else delete to.searchParams;
  return to;
}

const stableValue = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableValue).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${key}:${stableValue(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

export function isDifferentSearchParam(
  a: EntitySearchParam,
  b: EntitySearchParam,
) {
  return stableValue(a) !== stableValue(b);
}

export function toQueryParams(param: EntitySearchParam) {
  const queryParams: Record<string, unknown> = Paginator.pagerToJson(
    param.pager,
  );
  if (param.searchWord) queryParams.searchWord = param.searchWord;
  if (param.queryParams) Object.assign(queryParams, param.queryParams);
  return queryParams;
}

export const hasSearchParams = (param: EntitySearchParam) =>
  param.searchParams != null && Object.keys(param.searchParams).length > 0;

/** 将统一状态拆成现有 ApiClient 的 URL + body 两部分。 */
export function toSearchRequest(param: EntitySearchParam): EntitySearchRequest {
  return {
    queryParams: toQueryParams(param),
    searchParams: hasSearchParams(param) ? param.searchParams : undefined,
  };
}

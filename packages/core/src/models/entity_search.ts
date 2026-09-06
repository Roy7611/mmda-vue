import {
  isDateRangeKind,
  type DateTimeRangeKind,
} from "../utils/date_range";
import { defaultPager, parseSorts, type Pager } from "./pagination";

export type EntityFilterType =
  | "text"
  | "number"
  | "date"
  | "set"
  | "boolean"
  | "join"
  | "multi";

export type EntityFilterOperator =
  | "EQ"
  | "NEQ"
  | "GT"
  | "GE"
  | "LT"
  | "LE"
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
  /** 相对日历语义。有值时不要写死 value/valueTo；POST 原样交给服务端展开。 */
  dateKind?: DateTimeRangeKind;
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

/** 同一比较器多段 AND/OR。与 multi（不同种类子过滤叠放）不同。 */
export interface EntityJoinFieldFilter {
  filterType: "join";
  operator: "AND" | "OR";
  conditions: EntityFieldFilter[];
}

/** 同一列叠不同种类子过滤（常见：比较条件 + 选项 set）。服务端 AND。 */
export interface EntityMultiFieldFilter {
  filterType: "multi";
  filterModels: EntityFieldFilter[];
}

export type EntityFieldFilter =
  | EntitySimpleFieldFilter
  | EntitySetFieldFilter
  | EntityBooleanFieldFilter
  | EntityJoinFieldFilter
  | EntityMultiFieldFilter;

/** 字段过滤文档，键是实体字段名。 */
export type EntityFilterModel = Record<string, EntityFieldFilter>;

/** Module.defaultFilter 段：queryID;queryName */
export interface NamedQueryRef {
  queryID: string;
  queryName: string;
}

/**
 * 可保存的查询定义（客户端名）。
 * CustomizedQuery.queryExpression = JSON.stringify(EntityQuery)。
 * pager.sorts 是唯一排序来源。
 */
export interface EntityQuery {
  queryID?: string;
  queryName?: string;
  objName?: string;
  remark?: string;
  filterModel?: EntityFilterModel;
  pager: Pager;
  searchWord?: string;
}

/**
 * 当次列表请求 ≈ EntityQuery。
 * `queryParams` 仅兼容旧 URL / 快捷过滤 SQL；新代码字段条件进 filterModel。
 */
export interface EntitySearchParam extends EntityQuery {
  queryParams?: Record<string, unknown>;
}

export function defaultSearchParam(searchWord = ""): EntitySearchParam {
  return {
    pager: defaultPager(),
    searchWord,
  };
}

export function defaultEntityQuery(searchWord = ""): EntityQuery {
  return {
    pager: defaultPager(),
    searchWord,
  };
}

const cloneRecord = <T extends Record<string, unknown>>(
  value?: T,
): T | undefined => (value == null ? undefined : ({ ...value } as T));

export const cloneFieldFilter = (
  filter: EntityFieldFilter,
): EntityFieldFilter => {
  if (filter.filterType === "set") {
    return { ...filter, values: [...filter.values] };
  }
  if (filter.filterType === "join") {
    return {
      ...filter,
      conditions: filter.conditions.map(cloneFieldFilter),
    };
  }
  if (filter.filterType === "multi") {
    return {
      ...filter,
      filterModels: filter.filterModels.map(cloneFieldFilter),
    };
  }
  return { ...filter };
};

export const cloneFilterModel = (value?: EntityFilterModel) =>
  value == null
    ? undefined
    : Object.fromEntries(
        Object.entries(value).map(([field, filter]) => [
          field,
          cloneFieldFilter(filter),
        ]),
      );

const clonePager = (pager: Pager): Pager => ({
  pageSize: pager.pageSize,
  pageNo: pager.pageNo,
  sorts: pager.sorts?.map((sort) => ({ ...sort })),
});

export function toEntityQuery(src: EntityQuery): EntityQuery {
  return {
    queryID: src.queryID,
    queryName: src.queryName,
    objName: src.objName,
    remark: src.remark,
    filterModel: cloneFilterModel(src.filterModel),
    pager: clonePager(src.pager ?? defaultPager()),
    searchWord: src.searchWord,
  };
}

export function applyEntityQuery(to: EntitySearchParam, src: EntityQuery) {
  to.queryID = src.queryID;
  to.queryName = src.queryName;
  to.objName = src.objName;
  to.remark = src.remark;
  to.searchWord = src.searchWord;
  const pager = src.pager ?? defaultPager();
  to.pager.pageSize = pager.pageSize;
  to.pager.pageNo = pager.pageNo;
  to.pager.sorts = pager.sorts?.map((sort) => ({ ...sort }));
  if (src.filterModel) to.filterModel = cloneFilterModel(src.filterModel);
  else delete to.filterModel;
  return to;
}

export function assignSearchParam(
  to: EntitySearchParam,
  src: EntitySearchParam,
) {
  applyEntityQuery(to, src);
  if (src.queryParams) to.queryParams = cloneRecord(src.queryParams);
  else delete to.queryParams;
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

export const hasFilterModel = (param: Pick<EntityQuery, "filterModel">) =>
  param.filterModel != null && Object.keys(param.filterModel).length > 0;

export function inFilter(
  values: unknown | unknown[],
  operator: "IN" | "NOT_IN" = "IN",
): EntitySetFieldFilter {
  return {
    filterType: "set",
    operator,
    values: Array.isArray(values) ? [...values] : [values],
  };
}

export function notInFilter(values: unknown | unknown[]): EntitySetFieldFilter {
  return inFilter(values, "NOT_IN");
}

export function eqFilter(
  value: unknown,
  filterType: EntitySimpleFieldFilter["filterType"] = "text",
): EntitySimpleFieldFilter {
  return { filterType, operator: "EQ", value };
}

export function betweenFilter(
  value: unknown,
  valueTo: unknown,
  filterType: EntitySimpleFieldFilter["filterType"] = "date",
): EntitySimpleFieldFilter {
  return { filterType, operator: "BETWEEN", value, valueTo };
}

export function dateKindFilter(
  dateKind: DateTimeRangeKind,
): EntitySimpleFieldFilter {
  return { filterType: "date", operator: "BETWEEN", dateKind };
}

export function nullFilter(
  operator: "IS_NULL" | "IS_NOT_NULL" = "IS_NULL",
): EntitySimpleFieldFilter {
  return { filterType: "text", operator };
}

export function joinFilter(
  operator: "AND" | "OR",
  conditions: EntityFieldFilter[],
): EntityJoinFieldFilter {
  return {
    filterType: "join",
    operator,
    conditions: conditions.map(cloneFieldFilter),
  };
}

export function multiFilter(
  filterModels: EntityFieldFilter[],
): EntityMultiFieldFilter {
  return {
    filterType: "multi",
    filterModels: filterModels.map(cloneFieldFilter),
  };
}

export function isEmptyFieldFilter(
  filter?: EntityFieldFilter | null,
): boolean {
  if (!filter) return true;
  if (filter.filterType === "set") return !filter.values?.length;
  if (filter.filterType === "boolean") return filter.value == null;
  if (filter.filterType === "join") {
    return filter.conditions.every((item) => isEmptyFieldFilter(item));
  }
  if (filter.filterType === "multi") {
    return filter.filterModels.every((item) => isEmptyFieldFilter(item));
  }
  if (filter.operator === "IS_ALL") return true;
  if (filter.operator === "IS_NULL" || filter.operator === "IS_NOT_NULL") {
    return false;
  }
  if (isDateRangeKind(filter.dateKind)) return false;
  if (filter.operator === "BETWEEN") {
    return filter.value == null && filter.valueTo == null;
  }
  return filter.value == null || filter.value === "";
}

export function compactFieldFilter(
  filter?: EntityFieldFilter | null,
): EntityFieldFilter | undefined {
  if (!filter || isEmptyFieldFilter(filter)) return undefined;
  if (filter.filterType === "join") {
    const conditions = filter.conditions
      .map((item) => compactFieldFilter(item))
      .filter((item): item is EntityFieldFilter => item != null);
    if (!conditions.length) return undefined;
    if (conditions.length === 1) return conditions[0];
    return { ...filter, conditions };
  }
  if (filter.filterType === "multi") {
    const filterModels = filter.filterModels
      .map((item) => compactFieldFilter(item))
      .filter((item): item is EntityFieldFilter => item != null);
    if (!filterModels.length) return undefined;
    if (filterModels.length === 1) return filterModels[0];
    return { ...filter, filterModels };
  }
  return cloneFieldFilter(filter);
}

/** 上块比较 + 下块 set：两块都有效则 multi，否则摊平。 */
export function combineCompareAndSet(
  compare?: EntityFieldFilter | null,
  set?: EntitySetFieldFilter | null,
): EntityFieldFilter | undefined {
  const first = compactFieldFilter(compare);
  const second = compactFieldFilter(set);
  if (first && second) return multiFilter([first, second]);
  return first ?? second;
}

export function stringifyQueryExpression(query: EntityQuery): string {
  return JSON.stringify(toEntityQuery(query));
}

export type ParsedQueryExpression =
  | { kind: "query"; query: EntityQuery }
  | { kind: "sql"; sql: string };

function isEntityQueryLike(value: unknown): value is EntityQuery {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return (
    "pager" in o ||
    "filterModel" in o ||
    "queryID" in o ||
    "queryName" in o ||
    "searchWord" in o
  );
}

export function parseQueryExpression(
  expr?: string | null,
): ParsedQueryExpression | undefined {
  const raw = String(expr ?? "").trim();
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isEntityQueryLike(parsed)) {
      return {
        kind: "query",
        query: toEntityQuery({
          ...parsed,
          pager: parsed.pager ?? defaultPager(),
        }),
      };
    }
    return { kind: "sql", sql: raw };
  } catch {
    return { kind: "sql", sql: raw };
  }
}

/**
 * Module.defaultFilter：`queryID;queryName|queryID;queryName`
 */
export function parseDefaultFilter(s?: string): NamedQueryRef[] {
  if (!s) return [];
  return s
    .split("|")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const sep = segment.indexOf(";");
      if (sep < 0) return undefined;
      const queryID = segment.slice(0, sep).trim();
      const queryName = segment.slice(sep + 1).trim();
      if (!queryID || !queryName) return undefined;
      return { queryID, queryName };
    })
    .filter((item): item is NamedQueryRef => item != null);
}

export function parseDefaultSort(s?: string) {
  return parseSorts(s ?? "");
}

import {
  isDateRangeKind,
  type DateTimeRangeKind,
} from "./date_range";
import type {
  DateFilterOpCode,
  JoinFilterOpCode,
  MetaUiFilterOpCode,
  MetaUiFilterTypeName,
  NumberFilterOpCode,
  SetFilterOpCode,
  TextFilterOpCode,
  BooleanFilterOpCode,
} from "../metaui/metaui_filter";
import type { ModuleAuth } from "../metaui/module";
import type { EntityCtor } from "./entity";
import { defaultPager, parseSorts, type Pager } from "./pagination";

export interface FieldFilter {
  filterType: MetaUiFilterTypeName;
  operator?: MetaUiFilterOpCode;
  value?: unknown;
  valueTo?: unknown;
  values?: unknown[];
  conditions?: FieldFilter[];
  filterModels?: FieldFilter[];
}

/** 比较类基接口。Text / Number / Date 继承它。 */
export interface SimpleFieldFilter extends FieldFilter {
  filterType: "text" | "number" | "date";
  value?: unknown;
  valueTo?: unknown;
}

export interface SetFieldFilter extends FieldFilter {
  filterType: "set";
  operator?: SetFilterOpCode;
  values: unknown[];
}

export interface BooleanFieldFilter extends FieldFilter {
  filterType: "boolean";
  operator?: BooleanFilterOpCode;
  value?: boolean | null;
}

export interface TextFieldFilter extends SimpleFieldFilter {
  filterType: "text";
  operator?: TextFilterOpCode;
}

export interface NumberFieldFilter extends SimpleFieldFilter {
  filterType: "number";
  operator?: NumberFilterOpCode;
}

export interface DateFieldFilter extends SimpleFieldFilter {
  filterType: "date";
  operator?: DateFilterOpCode;
}

/**
 * 列 FilterModel 里同一字段的多段 AND/OR。
 * 外壳与 {@link AdvancedJoinFilter} 相同；conditions 是 FieldFilter（字段名是 map 键）。不要和 Query Builder 树混用。
 */
export interface JoinFieldFilter extends FieldFilter {
  filterType: "join";
  operator: JoinFilterOpCode;
  conditions: FieldFilter[];
}

/** 同一列叠不同种类子过滤（常见：比较条件 + 选项 set）。服务端 AND。 */
export interface MultiFieldFilter extends FieldFilter {
  filterType: "multi";
  filterModels: FieldFilter[];
}

/** 字段过滤文档，键是实体字段名。 */
export type FilterModel = Record<string, FieldFilter>;

/**
 * AG Advanced Filter 树（Query Builder）。
 * 顶层 join 可跨字段 OR；与列 FilterModel 里同字段的 JoinFieldFilter 不是同一套。
 * 本轮 searchAll 不 POST 这棵树。
 */
export type AdvancedFilterModel =
  | AdvancedJoinFilter
  | AdvancedFieldFilter;

/**
 * Query Builder 树上的 join。外壳与 {@link JoinFieldFilter} 相同；
 * conditions 是 AdvancedFilterModel（叶子自带 fieldName，可跨字段）。不要塞进 FilterModel。
 */
export interface AdvancedJoinFilter {
  filterType: "join";
  operator: JoinFilterOpCode;
  conditions: AdvancedFilterModel[];
}

/** 叶子：带 fieldName（≈ AG colId）。WITHIN 时 value 是 DateTimeRangeKind。 */
export interface AdvancedFieldFilter {
  fieldName: string;
  filterType: "text" | "number" | "date" | "set" | "boolean";
  operator?: MetaUiFilterOpCode;
  value?: unknown;
  valueTo?: unknown;
  values?: unknown[];
}

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
  filterModel?: FilterModel;
  /** Query Builder / AG Advanced Filter 树。searchAll 本轮不传。 */
  advancedFilterModel?: AdvancedFilterModel;
  pager: Pager;
}

/**
 * 当次列表请求。在 EntityQuery 上增加模糊搜与 URL 兼容袋。
 */
export interface EntitySearchParam extends EntityQuery {
  searchWord?: string;
  queryParams?: Record<string, unknown>;
}

/** 标记行是否可选（列表勾选 / 选择弹层）。 */
export type SelectableFn<E = any> = (e: E, context?: any) => boolean;

/**
 * 实体选择参数
 * searchFieldList 实体搜索条件列表
 * searchFieldProps 搜索条件组件props 例如：{fieldName: {param1: value,param2: value}}
 * searchFieldSearchParam 搜索条件自定义接口入参 例如：{fieldName: {param1: value,param2: value}}
 */
export interface EntitySelectParam<E> {
  repository: string;
  service?: string;
  searchParam?: EntitySearchParam;
  selectionMode?: "single" | "multiple";
  /**
   * 未命中 DI Logic 时的行构造；默认 `defineEntity`（列表水合），不要用 `MetaModel.createEntity`。
   */
  ctor?: EntityCtor<E>;
  searchFieldList?: string[];
  searchFieldProps?: Record<string, any>;
  searchFieldSearchParam?: Record<string, any>;
  pageSizeOptions?: number[];
  labelKey?: string;
  selectableFn?: SelectableFn;
  /** 弹窗 Footer 操作按钮（可选），显示在取消/确认按钮左侧 */
  labelFn?: (item: any) => string;
  /**
   * 覆盖弹层 CRUD 权限四项；未传时有模块跟模块 authority，无模块只读。
   */
  authority?: Partial<
    Pick<ModuleAuth, "allowRead" | "allowCreate" | "allowEdit" | "allowDelete">
  >;
}

export type ParsedQueryExpression =
  | { kind: "query"; query: EntityQuery }
  | { kind: "sql"; sql: string };

function isNoValueFilterOperator(
  operator?: MetaUiFilterOpCode,
): boolean {
  return (
    operator === "IS_NULL" ||
    operator === "IS_NOT_NULL" ||
    operator === "IS_BLANK" ||
    operator === "IS_NOT_BLANK"
  );
}

function isEmptyCompareValue(
  operator: MetaUiFilterOpCode | undefined,
  value: unknown,
): boolean {
  if (operator === "EQ" || operator === "NEQ") return value == null;
  return value == null || value === "";
}

function isEmptyAdvancedField(filter: AdvancedFieldFilter): boolean {
  if (filter.filterType === "set") return !filter.values?.length;
  if (filter.filterType === "boolean") {
    if (filter.operator === "IS_ALL") return true;
    if (filter.operator) return false;
    return filter.value == null;
  }
  if (filter.operator === "IS_ALL") return true;
  if (isNoValueFilterOperator(filter.operator)) {
    return false;
  }
  if (filter.operator === "WITHIN") {
    return !isDateRangeKind(filter.value);
  }
  if (filter.operator === "BETWEEN") {
    return filter.value == null && filter.valueTo == null;
  }
  return isEmptyCompareValue(filter.operator, filter.value);
}

const cloneRecord = <T extends Record<string, unknown>>(
  value?: T,
): T | undefined => (value == null ? undefined : ({ ...value } as T));

const clonePager = (pager: Pager): Pager => ({
  pageSize: pager.pageSize,
  pageNo: pager.pageNo,
  sorts: pager.sorts?.map((sort) => ({ ...sort })),
});

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

function isEntityQueryLike(value: unknown): value is EntityQuery {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const o = value as Record<string, unknown>;
  return (
    "pager" in o ||
    "filterModel" in o ||
    "advancedFilterModel" in o ||
    "queryID" in o ||
    "queryName" in o ||
    "searchWord" in o
  );
}

export const FieldFilter = {
  clone(filter: FieldFilter): FieldFilter {
    if (filter.filterType === "set") {
      return { ...filter, values: [...(filter.values ?? [])] };
    }
    if (filter.filterType === "join") {
      return {
        ...filter,
        conditions: (filter.conditions ?? []).map(FieldFilter.clone),
      };
    }
    if (filter.filterType === "multi") {
      return {
        ...filter,
        filterModels: (filter.filterModels ?? []).map(FieldFilter.clone),
      };
    }
    return { ...filter };
  },

  isEmpty(filter?: FieldFilter | null): boolean {
    if (!filter) return true;
    if (filter.filterType === "set") return !filter.values?.length;
    if (filter.filterType === "boolean") {
      if (filter.operator === "IS_ALL") return true;
      if (filter.operator) return false;
      return filter.value == null;
    }
    if (filter.filterType === "join") {
      return (filter.conditions ?? []).every((item) => FieldFilter.isEmpty(item));
    }
    if (filter.filterType === "multi") {
      return (filter.filterModels ?? []).every((item) =>
        FieldFilter.isEmpty(item),
      );
    }
    if (filter.operator === "IS_ALL") return true;
    if (isNoValueFilterOperator(filter.operator)) {
      return false;
    }
    if (filter.operator === "WITHIN") {
      return !isDateRangeKind(filter.value);
    }
    if (filter.operator === "BETWEEN") {
      return filter.value == null && filter.valueTo == null;
    }
    return isEmptyCompareValue(filter.operator, filter.value);
  },

  compact(filter?: FieldFilter | null): FieldFilter | undefined {
    if (!filter || FieldFilter.isEmpty(filter)) return undefined;
    if (filter.filterType === "join") {
      const conditions = (filter.conditions ?? [])
        .map((item) => FieldFilter.compact(item))
        .filter((item): item is FieldFilter => item != null);
      if (!conditions.length) return undefined;
      if (conditions.length === 1) return conditions[0];
      return { ...filter, conditions };
    }
    if (filter.filterType === "multi") {
      const filterModels = (filter.filterModels ?? [])
        .map((item) => FieldFilter.compact(item))
        .filter((item): item is FieldFilter => item != null);
      if (!filterModels.length) return undefined;
      if (filterModels.length === 1) return filterModels[0];
      return { ...filter, filterModels };
    }
    return FieldFilter.clone(filter);
  },

  in(
    values: unknown | unknown[],
    operator: SetFilterOpCode = "IN",
  ): SetFieldFilter {
    return {
      filterType: "set",
      operator,
      values: Array.isArray(values) ? [...values] : [values],
    };
  },

  notIn(values: unknown | unknown[]): SetFieldFilter {
    return FieldFilter.in(values, "NOT_IN");
  },

  eq(
    value: unknown,
    filterType: SimpleFieldFilter["filterType"] = "text",
  ): SimpleFieldFilter {
    return { filterType, operator: "EQ", value };
  },

  between(
    value: unknown,
    valueTo: unknown,
    filterType: SimpleFieldFilter["filterType"] = "date",
  ): SimpleFieldFilter {
    return { filterType, operator: "BETWEEN", value, valueTo };
  },

  dateKind(dateKind: DateTimeRangeKind): DateFieldFilter {
    return { filterType: "date", operator: "WITHIN", value: dateKind };
  },

  nil(
    operator: "IS_NULL" | "IS_NOT_NULL" = "IS_NULL",
  ): SimpleFieldFilter {
    return { filterType: "text", operator };
  },

  blank(
    operator: "IS_BLANK" | "IS_NOT_BLANK" = "IS_BLANK",
  ): SimpleFieldFilter {
    return { filterType: "text", operator };
  },

  join(
    operator: JoinFilterOpCode,
    conditions: FieldFilter[],
  ): JoinFieldFilter {
    return {
      filterType: "join",
      operator,
      conditions: conditions.map(FieldFilter.clone),
    };
  },

  multi(filterModels: FieldFilter[]): MultiFieldFilter {
    return {
      filterType: "multi",
      filterModels: filterModels.map(FieldFilter.clone),
    };
  },

  combineCompareAndSet(
    compare?: FieldFilter | null,
    set?: SetFieldFilter | null,
  ): FieldFilter | undefined {
    const first = FieldFilter.compact(compare);
    const second = FieldFilter.compact(set);
    if (first && second) return FieldFilter.multi([first, second]);
    return first ?? second;
  },
};

export namespace FilterModel {
  export function clone(value?: FilterModel) {
    return value == null
      ? undefined
      : Object.fromEntries(
          Object.entries(value).map(([field, filter]) => [
            field,
            FieldFilter.clone(filter),
          ]),
        );
  }

  export function has(param: Pick<EntityQuery, "filterModel">) {
    return param.filterModel != null && Object.keys(param.filterModel).length > 0;
  }

  function expandBlankField(filter: FieldFilter): FieldFilter {
    if (filter.filterType === "multi") {
      return {
        ...filter,
        filterModels: (filter.filterModels ?? []).map(expandBlankField),
      };
    }
    if (filter.filterType === "join") {
      return {
        ...filter,
        conditions: (filter.conditions ?? []).map(expandBlankField),
      };
    }
    if (filter.filterType === "set" || filter.filterType === "boolean") {
      return FieldFilter.clone(filter);
    }
    if (filter.operator === "IS_BLANK") {
      return FieldFilter.join("OR", [
        { filterType: "text", operator: "IS_NULL" },
        { filterType: "text", operator: "EQ", value: "" },
      ]);
    }
    if (filter.operator === "IS_NOT_BLANK") {
      return FieldFilter.join("AND", [
        { filterType: "text", operator: "IS_NOT_NULL" },
        { filterType: "text", operator: "NEQ", value: "" },
      ]);
    }
    return FieldFilter.clone(filter);
  }

  /** IS_BLANK / IS_NOT_BLANK → join。IS_NULL 原样。不要 compact，以免丢掉 EQ ''。 */
  export function expandBlank(
    model?: FilterModel,
  ): FilterModel | undefined {
    if (model == null) return undefined;
    const next: FilterModel = {};
    for (const [field, filter] of Object.entries(model)) {
      next[field] = expandBlankField(filter);
    }
    return Object.keys(next).length ? next : undefined;
  }

  /** 绝对日期 set token → BETWEEN / join OR。实现在 date_filter.ts 挂上。 */
  export declare function expandDates(
    model?: FilterModel,
  ): FilterModel | undefined;
}

export namespace AdvancedFilterModel {
  /** 只给 AdvancedFilterModel。联合里 filterType === 'join' 即 AdvancedJoinFilter。 */
  export function isJoin(
    model?: AdvancedFilterModel | null,
  ): model is AdvancedJoinFilter {
    return !!model && model.filterType === "join";
  }

  export function clone(
    model?: AdvancedFilterModel | null,
  ): AdvancedFilterModel | undefined {
    if (!model) return undefined;
    if (isJoin(model)) {
      return {
        filterType: "join",
        operator: model.operator,
        conditions: model.conditions
          .map((item) => clone(item))
          .filter((item): item is AdvancedFilterModel => item != null),
      };
    }
    return {
      ...model,
      values: model.values ? [...model.values] : undefined,
    };
  }

  export function compact(
    model?: AdvancedFilterModel | null,
  ): AdvancedFilterModel | undefined {
    if (!model) return undefined;
    if (isJoin(model)) {
      const conditions = model.conditions
        .map((item) => compact(item))
        .filter((item): item is AdvancedFilterModel => item != null);
      if (!conditions.length) return undefined;
      if (conditions.length === 1) return conditions[0];
      return { filterType: "join", operator: model.operator, conditions };
    }
    if (isEmptyAdvancedField(model)) return undefined;
    return clone(model);
  }

  export function has(param: Pick<EntityQuery, "advancedFilterModel">) {
    return compact(param.advancedFilterModel) != null;
  }
}

export namespace NamedQueryRef {
  /** Module.defaultFilter：`queryID;queryName|queryID;queryName` */
  export function parse(s?: string): NamedQueryRef[] {
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
}

export namespace EntityQuery {
  export function create(): EntityQuery {
    return {
      pager: defaultPager(),
    };
  }

  export function copy(src: EntityQuery): EntityQuery {
    return {
      queryID: src.queryID,
      queryName: src.queryName,
      objName: src.objName,
      remark: src.remark,
      filterModel: FilterModel.clone(src.filterModel),
      advancedFilterModel: AdvancedFilterModel.clone(src.advancedFilterModel),
      pager: clonePager(src.pager ?? defaultPager()),
    };
  }

  export function apply(to: EntitySearchParam, src: EntityQuery) {
    to.queryID = src.queryID;
    to.queryName = src.queryName;
    to.objName = src.objName;
    to.remark = src.remark;
    const word = (src as EntitySearchParam).searchWord;
    if (word != null) to.searchWord = word;
    const pager = src.pager ?? defaultPager();
    to.pager.pageSize = pager.pageSize;
    to.pager.pageNo = pager.pageNo;
    to.pager.sorts = pager.sorts?.map((sort) => ({ ...sort }));
    if (src.filterModel) to.filterModel = FilterModel.clone(src.filterModel);
    else delete to.filterModel;
    if (src.advancedFilterModel) {
      to.advancedFilterModel = AdvancedFilterModel.clone(src.advancedFilterModel);
    } else delete to.advancedFilterModel;
    return to;
  }

  export function stringify(query: EntityQuery): string {
    return JSON.stringify(copy(query));
  }

  export function parse(
    expr?: string | null,
  ): ParsedQueryExpression | undefined {
    const raw = String(expr ?? "").trim();
    if (!raw) return undefined;
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (isEntityQueryLike(parsed)) {
        return {
          kind: "query",
          query: copy({
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

  export function parseDefaultSort(s?: string) {
    return parseSorts(s ?? "");
  }
}

export namespace EntitySearchParam {
  export function create(searchWord = ""): EntitySearchParam {
    return {
      pager: defaultPager(),
      searchWord,
    };
  }

  export function assign(to: EntitySearchParam, src: EntitySearchParam) {
    EntityQuery.apply(to, src);
    if (src.queryParams) to.queryParams = cloneRecord(src.queryParams);
    else delete to.queryParams;
    return to;
  }

  export function isDifferent(a: EntitySearchParam, b: EntitySearchParam) {
    return stableValue(a) !== stableValue(b);
  }
}

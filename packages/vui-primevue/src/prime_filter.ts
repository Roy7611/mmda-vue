import { columnFilterKindOf, combineCompareAndSet, compactFieldFilter, getFieldFilterOps, simpleFilterTypeOf, type EntityFieldFilter, type EntityFilterModel, type EntityFilterOperator, type EntitySetFieldFilter, type EntitySimpleFieldFilter, type MetaUiField } from "@mmda/core";

export type PrimeColumnFilterState = {
  operator: string;
  value?: unknown;
  valueTo?: unknown;
  joinOperator: "AND" | "OR";
  secondOperator: string;
  secondValue?: unknown;
  setValues: unknown[];
};

const COMPARE_OPS = new Set<string>([
  "EQ",
  "NEQ",
  "GT",
  "GE",
  "LT",
  "LE",
  "STARTS_WITH",
  "ENDS_WITH",
  "CONTAINS",
  "NOT_CONTAINS",
  "IS_NULL",
  "IS_NOT_NULL",
  "IS_ALL",
  "BETWEEN",
  "IS_TRUE",
  "IS_FALSE",
]);

export function splitCurrentFilter(current?: EntityFieldFilter) {
  if (!current) return { compare: undefined as EntityFieldFilter | undefined, setValues: [] as unknown[] };
  if (current.filterType === "multi") {
    const set = current.filterModels.find((item) => item.filterType === "set") as
      | EntitySetFieldFilter
      | undefined;
    const compare = current.filterModels.find((item) => item.filterType !== "set");
    return { compare, setValues: set?.values ?? [] };
  }
  if (current.filterType === "set") {
    return { compare: undefined, setValues: current.values };
  }
  return { compare: current, setValues: [] };
}

export function hydratePrimeColumnFilter(
  field: MetaUiField,
  current?: EntityFieldFilter,
): PrimeColumnFilterState {
  const { compare, setValues } = splitCurrentFilter(current);
  const defaultOp = getFieldFilterOps(field)[0] ?? "EQ";
  const join =
    compare?.filterType === "join"
      ? compare
      : undefined;
  const first = join
    ? join.conditions[0]
    : compare?.filterType === "text" ||
        compare?.filterType === "number" ||
        compare?.filterType === "date"
      ? compare
      : undefined;
  const second = join?.conditions[1];
  const opOf = (item?: EntityFieldFilter) =>
    item && "operator" in item && COMPARE_OPS.has(String(item.operator))
      ? String(item.operator)
      : defaultOp;
  return {
    operator: opOf(first),
    value: first && "value" in first ? first.value : undefined,
    valueTo: first && "valueTo" in first ? first.valueTo : undefined,
    joinOperator: join?.operator ?? "AND",
    secondOperator: opOf(second),
    secondValue: second && "value" in second ? second.value : undefined,
    setValues: [...setValues],
  };
}

export function applyPrimeColumnFilter(
  field: MetaUiField,
  state: PrimeColumnFilterState,
): EntityFieldFilter | undefined {
  if (columnFilterKindOf(field) === "boolean") {
    return state.value == null
      ? undefined
      : { filterType: "boolean", value: Boolean(state.value) };
  }
  const filterType = simpleFilterTypeOf(field);
  const first: EntitySimpleFieldFilter = {
    filterType,
    operator: state.operator as EntityFilterOperator,
    value: state.value,
    valueTo: state.valueTo,
  };
  const second: EntitySimpleFieldFilter | undefined =
    state.operator === "BETWEEN" || !state.secondValue
      ? undefined
      : {
          filterType,
          operator: (state.secondOperator ||
            state.operator) as EntityFilterOperator,
          value: state.secondValue,
        };
  const compare = compactFieldFilter(
    second
      ? {
          filterType: "join",
          operator: state.joinOperator,
          conditions: [first, second],
        }
      : first,
  );
  const set: EntitySetFieldFilter | undefined = state.setValues.length
    ? { filterType: "set", operator: "IN", values: [...state.setValues] }
    : undefined;
  return combineCompareAndSet(compare, set);
}

export function mergeFieldFilter(
  model: EntityFilterModel,
  fieldName: string,
  filter?: EntityFieldFilter,
): EntityFilterModel {
  const next = { ...model };
  if (filter) next[fieldName] = filter;
  else delete next[fieldName];
  return next;
}

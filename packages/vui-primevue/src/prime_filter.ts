import { getFieldFilterOps, isDateRangeKind, type DateTimeRangeKind, FieldFilter, type FilterModel, type SetFieldFilter, type SimpleFieldFilter, type MetaUiFilterOpCode, type MetaUiField } from "@mmda/core";
import { columnFilterKindOf, simpleFilterTypeOf } from "./filter_kind";

export type PrimeColumnFilterState = {
  operator: string;
  value?: unknown;
  valueTo?: unknown;
  dateKind?: DateTimeRangeKind;
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
  "IS_BLANK",
  "IS_NOT_BLANK",
  "IS_ALL",
  "BETWEEN",
  "WITHIN",
  "IS_TRUE",
  "IS_FALSE",
]);

export function splitCurrentFilter(current?: FieldFilter) {
  if (!current) return { compare: undefined as FieldFilter | undefined, setValues: [] as unknown[] };
  if (current.filterType === "multi") {
    const set = current.filterModels.find((item) => item.filterType === "set") as
      | SetFieldFilter
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
  current?: FieldFilter,
): PrimeColumnFilterState {
  const { compare, setValues } = splitCurrentFilter(
    FieldFilter.compact(current) ?? current,
  );
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
  const firstValue = first && "value" in first ? first.value : undefined;
  const dateKind =
    first &&
    (first.operator === "WITHIN" || isDateRangeKind(firstValue)) &&
    isDateRangeKind(firstValue)
      ? firstValue
      : undefined;
  const opOf = (item?: FieldFilter) =>
    item && "operator" in item && COMPARE_OPS.has(String(item.operator))
      ? String(item.operator)
      : defaultOp;
  return {
    operator: dateKind ? "WITHIN" : opOf(first),
    value: dateKind ? undefined : firstValue,
    valueTo: dateKind
      ? undefined
      : first && "valueTo" in first
        ? first.valueTo
        : undefined,
    dateKind,
    joinOperator: join?.operator ?? "AND",
    secondOperator: opOf(second),
    secondValue: second && "value" in second ? second.value : undefined,
    setValues: [...setValues],
  };
}

export function applyPrimeColumnFilter(
  field: MetaUiField,
  state: PrimeColumnFilterState,
): FieldFilter | undefined {
  if (columnFilterKindOf(field) === "boolean") {
    return state.value == null
      ? undefined
      : { filterType: "boolean", value: Boolean(state.value) };
  }
  const filterType = simpleFilterTypeOf(field);
  const first: SimpleFieldFilter | undefined =
    state.operator === "WITHIN"
      ? isDateRangeKind(state.dateKind)
        ? FieldFilter.dateKind(state.dateKind)
        : undefined
      : {
          filterType,
          operator: state.operator as MetaUiFilterOpCode,
          value: state.value,
          valueTo: state.valueTo,
        };
  const second: SimpleFieldFilter | undefined =
    state.operator === "BETWEEN" ||
    state.operator === "WITHIN" ||
    !state.secondValue
      ? undefined
      : {
          filterType,
          operator: (state.secondOperator ||
            state.operator) as MetaUiFilterOpCode,
          value: state.secondValue,
        };
  const compare = FieldFilter.compact(
    second
      ? {
          filterType: "join",
          operator: state.joinOperator,
          conditions: [first, second],
        }
      : first,
  );
  const set: SetFieldFilter | undefined = state.setValues.length
    ? { filterType: "set", operator: "IN", values: [...state.setValues] }
    : undefined;
  return FieldFilter.combineCompareAndSet(compare, set);
}

export function mergeFieldFilter(
  model: FilterModel,
  fieldName: string,
  filter?: FieldFilter,
): FilterModel {
  const next = { ...model };
  if (filter) next[fieldName] = filter;
  else delete next[fieldName];
  return next;
}

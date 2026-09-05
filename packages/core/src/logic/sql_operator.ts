import { isString } from "../utils/is";
import { SqlDataType } from "../metaui/datatype";
import { MetaUiField } from "../metaui/metaui_field";
import type { EntityFilterOperator } from "../models/entity_search";

/**
 * SQL 片段操作符：metadata `where` / Logic `refFilter`。
 * 结构化列表过滤用 EntityFilterOperator，不要用本类型拼进 queryParams。
 */
export interface SqlOperator {
  name: EntityFilterOperator;
  toSQL: (v: any) => string;
  parameters?: number;
  symbol?: string;
  label?: string;
}

const EQ: SqlOperator = { name: "EQ", toSQL: (v) => v, parameters: 1, symbol: "=" };
const NEQ: SqlOperator = {
  name: "NEQ",
  toSQL: (v) => `NEQ ${v}`,
  parameters: 1,
  symbol: "<>",
};
const GT: SqlOperator = {
  name: "GT",
  toSQL: (v) => `GT ${v}`,
  parameters: 1,
  symbol: ">",
};
const GE: SqlOperator = {
  name: "GE",
  toSQL: (v) => `GE ${v}`,
  parameters: 1,
  symbol: ">=",
};
const LT: SqlOperator = {
  name: "LT",
  toSQL: (v) => `LT ${v}`,
  parameters: 1,
  symbol: "<",
};
const LE: SqlOperator = {
  name: "LE",
  toSQL: (v) => `LE ${v}`,
  parameters: 1,
  symbol: "<=",
};
const STARTS_WITH: SqlOperator = {
  name: "STARTS_WITH",
  toSQL: (v) => `LIKE ${v}%`,
  parameters: 1,
  label: "Starts with",
};
const ENDS_WITH: SqlOperator = {
  name: "ENDS_WITH",
  toSQL: (v) => `LIKE %${v}`,
  parameters: 1,
  label: "Ends with",
};
const CONTAINS: SqlOperator = {
  name: "CONTAINS",
  toSQL: (v) => `LIKE %${v}%`,
  parameters: 1,
  label: "Contains",
};
const NOT_CONTAINS: SqlOperator = {
  name: "NOT_CONTAINS",
  toSQL: (v) => `NOT LIKE %${v}%`,
  parameters: 1,
  label: "Not contains",
};
const IS_NULL: SqlOperator = {
  name: "IS_NULL",
  toSQL: () => "IS NULL",
  parameters: 0,
  label: "Nil",
};
const IS_NOT_NULL: SqlOperator = {
  name: "IS_NOT_NULL",
  toSQL: () => "IS NOT NULL",
  parameters: 0,
  label: "Not nil",
};
const IS_ALL: SqlOperator = {
  name: "IS_ALL",
  toSQL: () => "",
  parameters: 0,
  label: "All",
};
const IS_TRUE: SqlOperator = {
  name: "IS_TRUE",
  toSQL: () => "1",
  parameters: 0,
  label: "Yes",
};
const IS_FALSE: SqlOperator = {
  name: "IS_FALSE",
  toSQL: () => "0",
  parameters: 0,
  label: "No",
};
const IN: SqlOperator = {
  name: "IN",
  toSQL: (v: any[] | string) => `IN ${isString(v) ? v : v.join(",")}`,
  parameters: 3,
  label: "In",
};
const NOT_IN: SqlOperator = {
  name: "NOT_IN",
  toSQL: (v: any[] | string) => `NOT IN ${isString(v) ? v : v.join(",")}`,
  parameters: 3,
  label: "Not in",
};
const BETWEEN: SqlOperator = {
  name: "BETWEEN",
  toSQL: (v: any[]) => `BETWEEN ${v[0]} AND ${v[1]}`,
  parameters: 2,
  label: "Between",
};

export const defaultSqlOps = {
  NullableOps: [IS_NULL, IS_NOT_NULL],
  BoolFieldOps: [IS_ALL, IS_TRUE, IS_FALSE],
  StringFieldOps: [
    STARTS_WITH,
    ENDS_WITH,
    CONTAINS,
    NOT_CONTAINS,
    EQ,
    NEQ,
    IN,
    NOT_IN,
  ],
  NumberFieldOps: [EQ, NEQ, GT, GE, LT, LE, BETWEEN],
  DateFieldOps: [BETWEEN, EQ, NEQ, GT, GE, LT, LE],
  EnumFieldOps: [IN, NOT_IN, EQ, NEQ],
  RefFieldOps: [EQ, NEQ],
};

export const SqlOperatorNameList = [
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
  "IS_TRUE",
  "IS_FALSE",
  "IN",
  "NOT_IN",
  "BETWEEN",
] as const;

export type SqlOperatorName = (typeof SqlOperatorNameList)[number];

export const getSqlOperator = (
  op: EntityFilterOperator | SqlOperatorName,
): SqlOperator | undefined => {
  const ops = ([] as SqlOperator[]).concat(
    ...Object.values(defaultSqlOps),
  );
  return ops.find((s) => s.name === op);
};

export const getFieldSqlOps = (field: MetaUiField): SqlOperator[] => {
  let ops: SqlOperator[] = [];
  if (SqlDataType.isBool(field.dataType)) ops = ops.concat(defaultSqlOps.BoolFieldOps);
  else if (field.reference) {
    if (field.reference.isEnum) ops = ops.concat(defaultSqlOps.EnumFieldOps);
    else ops = ops.concat(defaultSqlOps.RefFieldOps);
  } else if (SqlDataType.isDate(field.dataType))
    ops = ops.concat(defaultSqlOps.DateFieldOps);
  else if (SqlDataType.isNum(field.dataType))
    ops = ops.concat(defaultSqlOps.NumberFieldOps);
  else ops = ops.concat(defaultSqlOps.StringFieldOps);
  if (field.nullable) ops = ops.concat(defaultSqlOps.NullableOps);
  return ops;
};

export const getFieldFilterOps = (field: MetaUiField): EntityFilterOperator[] =>
  getFieldSqlOps(field).map((op) => op.name);

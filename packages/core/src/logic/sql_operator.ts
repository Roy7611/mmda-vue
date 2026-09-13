import { isString } from "../utils/is";
import { SqlDataType } from "../metaui/datatype";
import { MetaUiField } from "../metaui/metaui_field";
import type { MetaUiFilterOperatorCode } from "../metaui/metaui_filter";

/**
 * SQL 片段操作符：metadata `where` / Logic `refWhere`。
 * 结构化列表过滤用 MetaUiFilterOperatorCode，不要用本类型拼进 queryParams。
 */
export interface SqlOperator {
  name: MetaUiFilterOperatorCode;
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
/** 语义算子；toSQL 仍写 IS NULL，列表主路径走 expandBlankFilters。 */
const IS_BLANK: SqlOperator = {
  name: "IS_BLANK",
  toSQL: () => "IS NULL",
  parameters: 0,
  label: "Blank",
};
const IS_NOT_BLANK: SqlOperator = {
  name: "IS_NOT_BLANK",
  toSQL: () => "IS NOT NULL",
  parameters: 0,
  label: "Not blank",
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
const WITHIN: SqlOperator = {
  name: "WITHIN",
  toSQL: (v) => `WITHIN ${v}`,
  parameters: 1,
  label: "Within",
};

export const defaultSqlOps = {
  NullableOps: [IS_NULL, IS_NOT_NULL],
  BoolFieldOps: [IS_ALL, IS_TRUE, IS_FALSE],
  /** 比较槽；顺序对齐 AG Text Filter，默认 CONTAINS。IN / NOT_IN 只走 set。 */
  StringFieldOps: [
    CONTAINS,
    NOT_CONTAINS,
    EQ,
    NEQ,
    STARTS_WITH,
    ENDS_WITH,
    IS_BLANK,
    IS_NOT_BLANK,
  ],
  NumberFieldOps: [EQ, NEQ, GT, GE, LT, LE, BETWEEN, IS_NULL, IS_NOT_NULL],
  DateFieldOps: [EQ, NEQ, GT, GE, LT, LE, BETWEEN, WITHIN, IS_NULL, IS_NOT_NULL],
  EnumFieldOps: [EQ, NEQ],
  RefFieldOps: [EQ, NEQ],
  /** 给 getSqlOperator 查找；表头比较槽不列出。 */
  SetFieldOps: [IN, NOT_IN],
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
  "IS_BLANK",
  "IS_NOT_BLANK",
  "IS_ALL",
  "IS_TRUE",
  "IS_FALSE",
  "IN",
  "NOT_IN",
  "BETWEEN",
  "WITHIN",
] as const;

export type SqlOperatorName = (typeof SqlOperatorNameList)[number];

export const getSqlOperator = (
  op: MetaUiFilterOperatorCode | SqlOperatorName,
): SqlOperator | undefined => {
  const ops = ([] as SqlOperator[]).concat(
    ...Object.values(defaultSqlOps),
  );
  return ops.find((s) => s.name === op);
};

export const getFieldSqlOps = (field: MetaUiField): SqlOperator[] => {
  if (SqlDataType.isBool(field.dataType)) return defaultSqlOps.BoolFieldOps;
  if (field.reference) {
    const ops = field.reference.isEnum
      ? defaultSqlOps.EnumFieldOps
      : defaultSqlOps.RefFieldOps;
    return field.nullable ? ops.concat(defaultSqlOps.NullableOps) : ops;
  }
  if (SqlDataType.isDate(field.dataType)) return defaultSqlOps.DateFieldOps;
  if (SqlDataType.isNum(field.dataType)) return defaultSqlOps.NumberFieldOps;
  return defaultSqlOps.StringFieldOps;
};

export const getFieldFilterOps = (field: MetaUiField): MetaUiFilterOperatorCode[] =>
  getFieldSqlOps(field).map((op) => op.name);

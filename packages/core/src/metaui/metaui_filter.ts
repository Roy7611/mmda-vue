/**
 * 过滤器词汇表：类型位、算子。
 *
 * 字段能力问 {@link MetaUiField.inferColumnFilterType}；
 * 选项是否穷尽问 {@link MetaUiFieldRef.isRefOptionsFull}。
 *
 * {@link MetaUiFilter} / {@link MetaUiFilterCondition} 是快捷 SQL 芯片，不进 FilterModel。
 */
import { hasBit } from '../extensions/number_extensions'

/** 快捷 SQL 芯片。打开认 fallback，不落盘。 */
export interface MetaUiFilter {
  filterName: string
  filterTitle: string
  fixed: boolean
  filterConditions: MetaUiFilterCondition[]
}

export interface MetaUiFilterCondition {
  displayLabel: string
  condition: string
  fallback: boolean
  /** 打开只认 fallback + Module.defaultFilter，不落盘 */
  active?: boolean
}

/**
 * 列过滤器类型。位掩码与 metauifield.filterTypes 一致。
 *
 * `0;NONE;未配|1;TEXT;文本|2;NUMBER;数字|4;DATE;日期|8;BOOLEAN;布尔|16;SET;集合|32;MULTI;多个|64;JOIN;联合`
 */
export enum MetaUiFilterType {
  NONE = 0,
  TEXT = 1,
  NUMBER = 2,
  DATE = 4,
  BOOLEAN = 8,
  SET = 16,
  MULTI = 32,
  JOIN = 64,
}

/** FieldFilter.filterType JSON：小写 text / date / set … */
export type MetaUiFilterTypeName =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'set'
  | 'multi'
  | 'join'

export const MetaUiFilterTypeEnum = {
  /** 过滤器类型值:TEXT => 1, NUMBER => 2, DATE => 4, BOOLEAN => 8, SET => 16, MULTI => 32, JOIN => 64 */
  valueOf(name: string): MetaUiFilterType {
    const value =
      MetaUiFilterType[String(name ?? 'NONE').toUpperCase() as keyof typeof MetaUiFilterType]
    return typeof value === 'number' ? value : MetaUiFilterType.NONE
  },

  /** 过滤器类型名称: 1 => TEXT, 2 => NUMBER, 4 => DATE, 8 => BOOLEAN, 16 => SET, 32 => MULTI, 64 => JOIN */
  nameOf(type: MetaUiFilterType): string {
    return MetaUiFilterType[type] ?? 'NONE'
  },

  /** 过滤器文本描述：基础类型 + 集合 / 多选 / 联合。 */
  textOf(types: number): string | 'none' {
    var name = this.nameOf(types & 15).toLowerCase() //text / date / number / boolean
    if (hasBit(types, MetaUiFilterType.SET)) {
      name += ' set'
    }
    if (hasBit(types, MetaUiFilterType.MULTI)) {
      name += ' multi'
    }
    if (hasBit(types, MetaUiFilterType.JOIN)) {
      name += ' join'
    }
    return name
  },

  hasFlag(mask: number, bit: MetaUiFilterType): boolean {
    return hasBit(mask, bit)
  },
} as const

/**
 * 算子映射表：name（`EQ`）= 框架 / 服务器 JSON；value（`equals`）= 皮肤控件名。
 */
export const MetaUiFilterOperator = {
  EQ: 'equals',
  NEQ: 'notEqual',
  GT: 'greaterThan',
  GE: 'greaterThanOrEqual',
  LT: 'lessThan',
  LE: 'lessThanOrEqual',
  STARTS_WITH: 'startsWith',
  ENDS_WITH: 'endsWith',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'notContains',
  IS_NULL: 'isNull',
  IS_NOT_NULL: 'isNotNull',
  IS_BLANK: 'isBlank',
  IS_NOT_BLANK: 'isNotBlank',
  IS_ALL: 'isAll',
  IS_TRUE: 'isTrue',
  IS_FALSE: 'isFalse',
  IN: 'in',
  NOT_IN: 'notIn',
  BETWEEN: 'between',
  WITHIN: 'within',

  AND: 'and',
  OR: 'or',
} as const

/** FieldFilter.operator / 服务器 JSON。 */
export type MetaUiFilterOpCode = keyof typeof MetaUiFilterOperator

/** 皮肤控件名。 */
export type MetaUiFilterOpValue = (typeof MetaUiFilterOperator)[MetaUiFilterOpCode]

const textFilterOps = [
  'EQ',
  'NEQ',
  'STARTS_WITH',
  'ENDS_WITH',
  'CONTAINS',
  'NOT_CONTAINS',
  'IS_BLANK',
  'IS_NOT_BLANK',
  'IN',
  'NOT_IN',
  'BETWEEN',
] as const satisfies readonly MetaUiFilterOpCode[]

export type TextFilterOpCode = (typeof textFilterOps)[number]

const dateFilterOps = [
  'EQ',
  'NEQ',
  'GT',
  'GE',
  'LT',
  'LE',
  'IS_NULL',
  'IS_NOT_NULL',
  'IN',
  'NOT_IN',
  'BETWEEN',
  'WITHIN',
] as const satisfies readonly MetaUiFilterOpCode[]

export type DateFilterOpCode = (typeof dateFilterOps)[number]

const numberFilterOps = [
  'EQ',
  'NEQ',
  'GT',
  'GE',
  'LT',
  'LE',
  'IS_NULL',
  'IS_NOT_NULL',
  'IN',
  'NOT_IN',
  'BETWEEN',
] as const satisfies readonly MetaUiFilterOpCode[]

export type NumberFilterOpCode = (typeof numberFilterOps)[number]

const booleanFilterOps = [
  'IS_TRUE',
  'IS_FALSE',
  'IS_NULL',
  'IS_NOT_NULL',
] as const satisfies readonly MetaUiFilterOpCode[]

export type BooleanFilterOpCode = (typeof booleanFilterOps)[number]

const setFilterOps = ['IN', 'NOT_IN'] as const satisfies readonly MetaUiFilterOpCode[]

export type SetFilterOpCode = (typeof setFilterOps)[number]

const joinFilterOps = ['AND', 'OR'] as const satisfies readonly MetaUiFilterOpCode[]

export type JoinFilterOpCode = (typeof joinFilterOps)[number]

export const MetaUiFilterOperatorEnum = {
  /** 大写 EQ => equals。不支持的返回 undefined。 */
  valueOf(name: string): MetaUiFilterOpValue | undefined {
    const key = String(name ?? '').toUpperCase() as MetaUiFilterOpCode
    const value = MetaUiFilterOperator[key]
    return typeof value === 'string' ? value : undefined
  },

  /** 小写 equals => EQ。不支持的返回 undefined。 */
  nameOf(op: MetaUiFilterOpValue): MetaUiFilterOpCode | undefined {
    return (Object.keys(MetaUiFilterOperator) as MetaUiFilterOpCode[]).find(
      key => MetaUiFilterOperator[key] === op,
    )
  },

  /** 皮肤控件名（value）。 */
  textOf(op: MetaUiFilterOpValue): string {
    return op
  },

  /** 文本过滤器支持的运算符（name）。 */
  textFilterOperators: textFilterOps,
  /** 日期过滤器支持的运算符。 */
  dateFilterOperators: dateFilterOps,
  /** 数字过滤器支持的运算符。 */
  numberFilterOperators: numberFilterOps,
  /** 布尔过滤器支持的运算符。 */
  booleanFilterOperators: booleanFilterOps,
  /** 集合过滤器支持的运算符。 */
  setFilterOperators: setFilterOps,
  /** 联合过滤器支持的运算符。 */
  joinFilterOperators: joinFilterOps,
} as const

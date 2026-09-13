/**
 * 过滤器词汇表：类型位、算子。
 *
 * 字段能力问 {@link MetaUiField.inferColumnFilterType}；
 * 选项是否穷尽问 {@link MetaUiFieldRef.isRefOptionsFull}。
 *
 * @deprecated {@link MetaUiFilter} / {@link MetaUiFilterCondition} 是移动端快捷 SQL，不进 FilterModel。
 */
import { hasBit } from '../extensions/number_extensions'

/** @deprecated 快捷 SQL 芯片；新代码用 FilterModel / FieldFilter。 */
export interface MetaUiFilter {
  filterName: string
  filterTitle: string
  fixed: boolean
  filterConditions: MetaUiFilterCondition[]
}

/** @deprecated */
export interface MetaUiFilterCondition {
  displayLabel: string
  condition: string
  fallback: boolean
  /** 本机上次勾选；打开列表时优先于 fallback */
  active?: boolean
}

/**
 * 列过滤器类型。位掩码与 metauifield.filterTypes 一致；小写名给 FieldFilter.filterType JSON。
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

export type MetaUiFilterTypeName =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'set'
  | 'multi'
  | 'join'

export const MetaUiFilterTypeEnum = {
  NONE: 'none' as const,
  TEXT: 'text' as const,
  NUMBER: 'number' as const,
  DATE: 'date' as const,
  BOOLEAN: 'boolean' as const,
  SET: 'set' as const,
  MULTI: 'multi' as const,
  JOIN: 'join' as const,

  valueOf(name: string): MetaUiFilterType {
    const value =
      MetaUiFilterType[String(name ?? '').toUpperCase() as keyof typeof MetaUiFilterType]
    return typeof value === 'number' ? value : MetaUiFilterType.NONE
  },

  nameOf(type: MetaUiFilterType): string {
    return MetaUiFilterType[type] ?? 'NONE'
  },

  /** FieldFilter.filterType JSON：小写 text / date / set … */
  textOf(type: MetaUiFilterType): MetaUiFilterTypeName | 'none' {
    return this.nameOf(type).toLowerCase() as MetaUiFilterTypeName | 'none'
  },

  hasFlag(mask: number, bit: MetaUiFilterType): boolean {
    return hasBit(mask, bit)
  },
} as const

/**
 * 值 = 标准控件名；JSON / {@link MetaUiFilterOperatorCode} = 成员名（`EQ`）。
 */
export enum MetaUiFilterOperator {
  EQ = 'equals',
  NEQ = 'notEqual',
  GT = 'greaterThan',
  GE = 'greaterThanOrEqual',
  LT = 'lessThan',
  LE = 'lessThanOrEqual',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'notContains',
  IS_NULL = 'isNull',
  IS_NOT_NULL = 'isNotNull',
  IS_BLANK = 'isBlank',
  IS_NOT_BLANK = 'isNotBlank',
  IS_ALL = 'isAll',
  IS_TRUE = 'isTrue',
  IS_FALSE = 'isFalse',
  IN = 'in',
  NOT_IN = 'notIn',
  BETWEEN = 'between',
  WITHIN = 'within',
}

/** FieldFilter.operator / 服务器 JSON。 */
export type MetaUiFilterOperatorCode = keyof typeof MetaUiFilterOperator

export const MetaUiFilterOperatorEnum = {
  valueOf(name: string): MetaUiFilterOperator | undefined {
    const value =
      MetaUiFilterOperator[
        String(name ?? '').toUpperCase() as MetaUiFilterOperatorCode
      ]
    return typeof value === 'string' ? value : undefined
  },

  nameOf(op: MetaUiFilterOperator): MetaUiFilterOperatorCode | undefined {
    return (Object.keys(MetaUiFilterOperator) as MetaUiFilterOperatorCode[]).find(
      key => MetaUiFilterOperator[key] === op,
    )
  },

  textOf(op: MetaUiFilterOperator): string {
    return op
  },
}


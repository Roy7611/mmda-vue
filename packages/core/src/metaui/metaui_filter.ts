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
export const enum MetaUiFilterType {
  NONE = 0,
  TEXT = 1,
  NUMBER = 2,
  DATE = 4,
  BOOLEAN = 8,
  SET = 16,
  MULTI = 32,
  JOIN = 64,
}

/** @deprecated 用 {@link MetaUiFilterType} */
export const MetaUiFieldFilterType = {
  NONE: MetaUiFilterType.NONE,
  TEXT: MetaUiFilterType.TEXT,
  NUMBER: MetaUiFilterType.NUMBER,
  DATE: MetaUiFilterType.DATE,
  BOOLEAN: MetaUiFilterType.BOOLEAN,
  SET: MetaUiFilterType.SET,
  MULTI: MetaUiFilterType.MULTI,
  JOIN: MetaUiFilterType.JOIN,
} as const

export type MetaUiFilterTypeName =
  | 'text'
  | 'number'
  | 'date'
  | 'boolean'
  | 'set'
  | 'multi'
  | 'join'

export const MetaUiFilterTypeEnum = {
  TEXT_NAME: 'text' as const,
  NUMBER_NAME: 'number' as const,
  DATE_NAME: 'date' as const,
  BOOLEAN_NAME: 'boolean' as const,
  SET_NAME: 'set' as const,
  MULTI_NAME: 'multi' as const,
  JOIN_NAME: 'join' as const,

  nameOf(type: MetaUiFilterType): MetaUiFilterTypeName | undefined {
    switch (type) {
      case MetaUiFilterType.TEXT:
        return 'text'
      case MetaUiFilterType.NUMBER:
        return 'number'
      case MetaUiFilterType.DATE:
        return 'date'
      case MetaUiFilterType.BOOLEAN:
        return 'boolean'
      case MetaUiFilterType.SET:
        return 'set'
      case MetaUiFilterType.MULTI:
        return 'multi'
      case MetaUiFilterType.JOIN:
        return 'join'
      default:
        return undefined
    }
  },

  parse(name: string): MetaUiFilterType {
    switch (String(name ?? '').toLowerCase()) {
      case 'text':
        return MetaUiFilterType.TEXT
      case 'number':
        return MetaUiFilterType.NUMBER
      case 'date':
        return MetaUiFilterType.DATE
      case 'boolean':
        return MetaUiFilterType.BOOLEAN
      case 'set':
        return MetaUiFilterType.SET
      case 'multi':
        return MetaUiFilterType.MULTI
      case 'join':
        return MetaUiFilterType.JOIN
      default:
        return MetaUiFilterType.NONE
    }
  },

  has(mask: number, bit: MetaUiFilterType): boolean {
    return hasBit(mask, bit)
  },
}

/** 服务器 / FieldFilter.operator JSON：大写成员名。 */
export type MetaUiFilterOperatorCode =
  | 'EQ'
  | 'NEQ'
  | 'GT'
  | 'GE'
  | 'LT'
  | 'LE'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'CONTAINS'
  | 'NOT_CONTAINS'
  | 'IS_NULL'
  | 'IS_NOT_NULL'
  | 'IS_BLANK'
  | 'IS_NOT_BLANK'
  | 'IS_ALL'
  | 'IS_TRUE'
  | 'IS_FALSE'
  | 'IN'
  | 'NOT_IN'
  | 'BETWEEN'
  | 'WITHIN'

/**
 * 标准控件名（各家再转 AG / EJ2）。
 * JSON 仍发 {@link MetaUiFilterOperatorCode}（`EQ`），不发 `equals`。
 */
export const enum MetaUiFilterOperator {
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

const OPERATOR_JSON: Record<MetaUiFilterOperator, MetaUiFilterOperatorCode> = {
  [MetaUiFilterOperator.EQ]: 'EQ',
  [MetaUiFilterOperator.NEQ]: 'NEQ',
  [MetaUiFilterOperator.GT]: 'GT',
  [MetaUiFilterOperator.GE]: 'GE',
  [MetaUiFilterOperator.LT]: 'LT',
  [MetaUiFilterOperator.LE]: 'LE',
  [MetaUiFilterOperator.STARTS_WITH]: 'STARTS_WITH',
  [MetaUiFilterOperator.ENDS_WITH]: 'ENDS_WITH',
  [MetaUiFilterOperator.CONTAINS]: 'CONTAINS',
  [MetaUiFilterOperator.NOT_CONTAINS]: 'NOT_CONTAINS',
  [MetaUiFilterOperator.IS_NULL]: 'IS_NULL',
  [MetaUiFilterOperator.IS_NOT_NULL]: 'IS_NOT_NULL',
  [MetaUiFilterOperator.IS_BLANK]: 'IS_BLANK',
  [MetaUiFilterOperator.IS_NOT_BLANK]: 'IS_NOT_BLANK',
  [MetaUiFilterOperator.IS_ALL]: 'IS_ALL',
  [MetaUiFilterOperator.IS_TRUE]: 'IS_TRUE',
  [MetaUiFilterOperator.IS_FALSE]: 'IS_FALSE',
  [MetaUiFilterOperator.IN]: 'IN',
  [MetaUiFilterOperator.NOT_IN]: 'NOT_IN',
  [MetaUiFilterOperator.BETWEEN]: 'BETWEEN',
  [MetaUiFilterOperator.WITHIN]: 'WITHIN',
}

export const MetaUiFilterOperatorEnum = {
  jsonOf(op: MetaUiFilterOperator): MetaUiFilterOperatorCode {
    return OPERATOR_JSON[op]
  },

  parse(code: string): MetaUiFilterOperator | undefined {
    const key = String(code ?? '').toUpperCase()
    for (const [name, json] of Object.entries(OPERATOR_JSON)) {
      if (json === key) return name as MetaUiFilterOperator
    }
    return undefined
  },

  nameOf(code: MetaUiFilterOperatorCode): MetaUiFilterOperator | undefined {
    return this.parse(code)
  },
}

/** @deprecated 用 {@link MetaUiFilterOperatorCode} */
export type EntityFilterOperator = MetaUiFilterOperatorCode
/** @deprecated 用 {@link MetaUiFilterTypeName} */
export type EntityFilterType = MetaUiFilterTypeName

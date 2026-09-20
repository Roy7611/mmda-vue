/*
 * chrome 查询构建器走 factory.queryBuilder。
 * value 是 AdvancedFilterModel，不是列 FilterModel。
 */
import { SqlDataType } from '../../metaui/datatype'
import { MetaRelationType, type MetaUiField } from '../../metaui/metaui_field'
import type {
  AdvancedFieldFilter,
  AdvancedFilterModel,
  AdvancedJoinFilter,
} from '../../models/entity_search'
import {
  MetaUiFilterOperatorEnum,
  type MetaUiFilterOpCode,
} from '../../metaui/metaui_filter'
import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiQueryBuilderValueType =
  | 'text'
  | 'number'
  | 'date'
  | 'datetime'
  | 'boolean'

export interface UiQueryBuilderChoice {
  value: unknown
  label: string
}

export interface UiQueryBuilderColumn {
  fieldName: string
  label: string
  valueType: UiQueryBuilderValueType
  operators?: MetaUiFilterOpCode[]
  values?: UiQueryBuilderChoice[]
}

export interface UiQueryBuilderProps extends UiProps {
  fields?: MetaUiField[]
  columns?: UiQueryBuilderColumn[]
  value?: AdvancedFilterModel
  disabled?: boolean
  onChange?: (model: AdvancedFilterModel | undefined) => void
}

export function queryBuilderValueOf(
  props: UiQueryBuilderProps,
): AdvancedFilterModel | undefined {
  if (props.value !== undefined) return props.value
  return undefined
}


export function queryBuilderModifierClasses(
  props: UiQueryBuilderProps,
): unknown[] {
  return [uiCssClass('querybuilder'), props.class]
}

export function queryBuilderValueTypeOf(
  field: MetaUiField,
): UiQueryBuilderValueType {
  if (field.dataType === SqlDataType.BIT) return 'boolean'
  if (SqlDataType.isNum(field.dataType)) return 'number'
  if (SqlDataType.isDateTime(field.dataType)) return 'datetime'
  if (
    SqlDataType.isDate(field.dataType) ||
    field.dataType === SqlDataType.YEAR ||
    field.dataType === SqlDataType.YEAR_MONTH
  ) {
    return 'date'
  }
  return 'text'
}

export function defaultQueryBuilderOperators(
  valueType: UiQueryBuilderValueType,
): MetaUiFilterOpCode[] {
  if (valueType === 'number') {
    return [...MetaUiFilterOperatorEnum.numberFilterOperators]
  }
  if (valueType === 'date' || valueType === 'datetime') {
    return [...MetaUiFilterOperatorEnum.dateFilterOperators]
  }
  if (valueType === 'boolean') {
    return [...MetaUiFilterOperatorEnum.booleanFilterOperators]
  }
  return [...MetaUiFilterOperatorEnum.textFilterOperators]
}

function columnChoicesOf(field: MetaUiField): UiQueryBuilderChoice[] | undefined {
  const ref = field.reference
  if (!ref || ref.hasOne || !ref.refOptions?.length) return undefined
  if (ref.refType !== MetaRelationType.ENUM && ref.refType !== MetaRelationType.REF) {
    return undefined
  }
  return ref.refOptions.map((item) => ({
    value: ref.valueOf(item),
    label: String(ref.labelOf(item) ?? ref.valueOf(item) ?? ''),
  }))
}

export function queryBuilderColumnOf(field: MetaUiField): UiQueryBuilderColumn {
  const valueType = queryBuilderValueTypeOf(field)
  const values = columnChoicesOf(field)
  return {
    fieldName: field.fieldName,
    label: field.displayLabel || field.fieldName,
    valueType,
    operators: defaultQueryBuilderOperators(valueType),
    values,
  }
}

export function queryBuilderColumnsOf(
  props: UiQueryBuilderProps,
): UiQueryBuilderColumn[] {
  if (props.columns?.length) return props.columns
  return (props.fields ?? []).map((field) => queryBuilderColumnOf(field))
}

export function defaultAdvancedJoin(
  operator: 'AND' | 'OR' = 'AND',
): AdvancedJoinFilter {
  return { filterType: 'join', operator, conditions: [] }
}

export function defaultAdvancedColumn(
  column: UiQueryBuilderColumn,
): AdvancedFieldFilter {
  const operator = column.operators?.[0] ?? defaultQueryBuilderOperators(column.valueType)[0]
  if (column.valueType === 'boolean') {
    return { fieldName: column.fieldName, filterType: 'boolean', value: true }
  }
  if (operator === 'IN' || operator === 'NOT_IN') {
    return {
      fieldName: column.fieldName,
      filterType: 'set',
      operator,
      values: [],
    }
  }
  const filterType =
    column.valueType === 'number'
      ? 'number'
      : column.valueType === 'date' || column.valueType === 'datetime'
        ? 'date'
        : 'text'
  return {
    fieldName: column.fieldName,
    filterType,
    operator,
  }
}

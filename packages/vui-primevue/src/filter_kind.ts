import { hasBit, MetaUiField, MetaUiFilterType } from '@mmda/core'

export function resolveColumnFilterTypes(field: MetaUiField) {
  return Number(field.filterTypes) || MetaUiField.inferColumnFilterType(field)
}

export function columnFilterKindOf(
  field: MetaUiField,
): 'boolean' | 'range' | 'set' | 'multi' | 'text' {
  const types = resolveColumnFilterTypes(field)
  if (hasBit(types, MetaUiFilterType.BOOLEAN)) return 'boolean'
  const compare =
    hasBit(types, MetaUiFilterType.TEXT) ||
    hasBit(types, MetaUiFilterType.NUMBER) ||
    hasBit(types, MetaUiFilterType.DATE)
  const set = hasBit(types, MetaUiFilterType.SET)
  if (hasBit(types, MetaUiFilterType.MULTI) || (compare && set)) return 'multi'
  if (set) return 'set'
  if (hasBit(types, MetaUiFilterType.NUMBER) || hasBit(types, MetaUiFilterType.DATE)) {
    return 'range'
  }
  return 'text'
}

export function simpleFilterTypeOf(field: MetaUiField): 'text' | 'number' | 'date' {
  const types = resolveColumnFilterTypes(field)
  if (hasBit(types, MetaUiFilterType.DATE)) return 'date'
  if (hasBit(types, MetaUiFilterType.NUMBER)) return 'number'
  if (hasBit(types, MetaUiFilterType.TEXT)) return 'text'
  const inferred = MetaUiField.inferColumnFilterType(field)
  if (inferred === MetaUiFilterType.DATE) return 'date'
  if (inferred === MetaUiFilterType.NUMBER) return 'number'
  return 'text'
}

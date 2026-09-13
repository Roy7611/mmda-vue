import { hasBit, MetaUiField, MetaUiFilterType } from '@mmda/core'

/** 服务端位；本地未写时用字段推断。JOIN/MULTI 不在 infer 里。 */
export function resolveColumnFilterTypes(field: MetaUiField) {
  return Number(field.filterTypes) || MetaUiField.inferColumnFilterType(field)
}

export function hasFilterType(
  fieldOrMask: MetaUiField | number,
  bit: MetaUiFilterType,
) {
  const mask =
    typeof fieldOrMask === 'number'
      ? fieldOrMask
      : resolveColumnFilterTypes(fieldOrMask)
  return hasBit(mask, bit)
}

export function isLazyChoiceFilterField(field: MetaUiField) {
  const ref = field.reference
  return Boolean(ref?.isRef || ref?.hasOne) && !isRefOptionsComplete(field)
}

export function isRefOptionsComplete(field: MetaUiField) {
  const ref = field.reference
  if (!ref) return false
  if (ref.isRefOptionsFull === true) return true
  if (ref.isEnum) return true
  return ref.refOptionsComplete === true
}

/** 本包列头壳。不是 core 词汇；core 没有 range。 */
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

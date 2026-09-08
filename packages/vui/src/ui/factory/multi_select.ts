/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/multi-select/vue3-getting-started
 *
 * chrome 封闭多选走 factory.multiSelect。不要 allowCustom（可输入 tags 走 tagAutoComplete）。
 */
import {
  EntityState,
  MetaModel,
  hasBit,
  type MetaUiField,
  type MetaUiFieldRef,
} from '@mmda/core'
import type { PropData } from '../layout/layout'
import type { UiSelectSuggest } from './drop_down_list'

export type UiMultiSelectBindMode =
  | 'item_array'
  | 'value_array'
  | 'join_text'
  | 'or_bits'

export type UiMultiSelectDisplay = 'chips' | 'text'

export interface UiMultiSelectProps extends PropData {
  value?: unknown
  options?: unknown[]
  bindMode?: UiMultiSelectBindMode
  valueField?: string
  labelField?: string
  separator?: string
  display?: UiMultiSelectDisplay
  placeholder?: string
  disabled?: boolean
  allowFiltering?: boolean
  suggest?: UiSelectSuggest
  reference?: MetaUiFieldRef
  onChange?: (bound: unknown) => void
}

export type MultiSelectFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
  t?: (key: string) => string
  model?: object
}

export const MULTI_SELECT_SEPARATOR = ','

export function multiSelectBindModeOf(
  props: Pick<UiMultiSelectProps, 'bindMode'>,
): UiMultiSelectBindMode {
  return props.bindMode ?? 'item_array'
}

export function multiSelectValueFieldOf(
  props: Pick<UiMultiSelectProps, 'valueField'>,
): string {
  return props.valueField ?? 'value'
}

export function multiSelectLabelFieldOf(
  props: Pick<UiMultiSelectProps, 'labelField'>,
): string {
  return props.labelField ?? 'label'
}

export function multiSelectSeparatorOf(
  props: Pick<UiMultiSelectProps, 'separator'>,
): string {
  return props.separator ?? MULTI_SELECT_SEPARATOR
}

export function multiSelectOptionKeyOf(
  item: unknown,
  props: Pick<UiMultiSelectProps, 'valueField' | 'reference' | 'bindMode'>,
): string | number {
  if (item == null) return ''
  if (typeof item === 'string' || typeof item === 'number') return item
  const mode = multiSelectBindModeOf(props)
  const reference = props.reference
  if (reference && mode !== 'or_bits' && typeof item === 'object') {
    const keyed = reference.valueOf(item)
    if (keyed != null && keyed !== '') return keyed as string | number
  }
  const rec = item as Record<string, unknown>
  const field = multiSelectValueFieldOf(props)
  if (rec[field] != null && rec[field] !== '') {
    return rec[field] as string | number
  }
  if (rec.value != null && rec.value !== '') return rec.value as string | number
  return ''
}

export function multiSelectOptionLabelOf(
  item: unknown,
  props: Pick<UiMultiSelectProps, 'labelField' | 'reference' | 'valueField' | 'bindMode'>,
): string {
  if (typeof item === 'string' || typeof item === 'number') return String(item)
  if (item == null) return ''
  const reference = props.reference
  if (reference && typeof item === 'object') {
    const label = reference.labelOf(item)
    if (label != null && label !== '') return String(label)
  }
  const rec = item as Record<string, unknown>
  const field = multiSelectLabelFieldOf(props)
  if (rec[field] != null) return String(rec[field])
  if (rec.label != null) return String(rec.label)
  const key = multiSelectOptionKeyOf(item, props)
  return key === '' ? '' : String(key)
}

export function multiSelectChromeOptionsOf(
  props: Pick<UiMultiSelectProps, 'options' | 'bindMode' | 'valueField' | 'reference'>,
): unknown[] {
  const options = props.options ?? []
  if (multiSelectBindModeOf(props) !== 'or_bits') return options
  return options.filter((item) => {
    const bit = Number(multiSelectOptionKeyOf(item, props))
    return Number.isFinite(bit) && bit !== 0
  })
}

export function splitJoinText(bound: unknown, separator: string): string[] {
  if (Array.isArray(bound)) {
    return bound.map((item) => String(item).trim()).filter(Boolean)
  }
  if (bound == null || bound === '') return []
  return String(bound)
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean)
}

function findOption(
  key: unknown,
  props: UiMultiSelectProps,
): unknown | undefined {
  return (props.options ?? []).find(
    (item) =>
      multiSelectOptionKeyOf(item, props) === key ||
      String(multiSelectOptionKeyOf(item, props)) === String(key),
  )
}

export function multiSelectItemsOf(
  bound: unknown,
  props: UiMultiSelectProps,
): unknown[] {
  const mode = multiSelectBindModeOf(props)
  const options = multiSelectChromeOptionsOf(props)
  if (mode === 'item_array') {
    const list = Array.isArray(bound) ? bound : []
    return list.filter(
      (item) => !MetaModel.isEntity(item) || !MetaModel.deleted(item),
    )
  }
  if (mode === 'join_text') {
    return splitJoinText(bound, multiSelectSeparatorOf(props))
      .map((key) => findOption(key, props))
      .filter((item) => item != null)
  }
  if (mode === 'or_bits') {
    const mask = Number(bound ?? 0)
    return options.filter((item) => {
      const bit = Number(multiSelectOptionKeyOf(item, props))
      return Number.isFinite(bit) && bit !== 0 && hasBit(mask, bit)
    })
  }
  const keys = Array.isArray(bound) ? bound : bound == null ? [] : [bound]
  return keys
    .map((key) => findOption(key, props))
    .filter((item) => item != null)
}

export function multiSelectBoundOf(
  items: unknown[],
  props: UiMultiSelectProps,
): unknown {
  const mode = multiSelectBindModeOf(props)
  if (mode === 'item_array') return items
  if (mode === 'join_text') {
    return items
      .map((item) => String(multiSelectOptionKeyOf(item, props)))
      .filter(Boolean)
      .join(multiSelectSeparatorOf(props))
  }
  if (mode === 'or_bits') {
    let mask = 0
    for (const item of items) {
      const bit = Number(multiSelectOptionKeyOf(item, props))
      if (!Number.isFinite(bit) || bit === 0) continue
      mask |= bit
    }
    return mask
  }
  return items.map((item) => multiSelectOptionKeyOf(item, props))
}

export function multiSelectSelectedKeysOf(
  props: UiMultiSelectProps,
): Array<string | number> {
  const bound = props.value !== undefined ? props.value : props.modelValue
  return multiSelectItemsOf(bound, props)
    .map((item) => multiSelectOptionKeyOf(item, props))
    .filter((key) => key !== '')
}

export function resolveMultiSelectItems(
  keys: Array<string | number>,
  props: UiMultiSelectProps,
): unknown[] {
  const bound = props.value !== undefined ? props.value : props.modelValue
  const current = Array.isArray(bound) ? bound : []
  return keys
    .map((key) => {
      const option = findOption(key, props)
      if (option != null) return option
      return current.find(
        (item) =>
          multiSelectOptionKeyOf(item, props) === key ||
          String(multiSelectOptionKeyOf(item, props)) === String(key),
      )
    })
    .filter((item) => item != null)
}

function cloneSelectedEntity(item: unknown): any {
  const copy: Record<string, unknown> =
    item != null && typeof item === 'object'
      ? { ...(item as object) }
      : { value: item }
  copy.entityState = EntityState.CREATED
  return copy
}

export function applyMultiSelectSelection(
  props: UiMultiSelectProps,
  selectedItems: unknown[],
): unknown {
  if (multiSelectBindModeOf(props) !== 'item_array') {
    return multiSelectBoundOf(selectedItems, props)
  }
  const bound = props.value !== undefined ? props.value : props.modelValue
  const current = Array.isArray(bound) ? bound : []
  if (current.some((item) => MetaModel.isEntity(item))) {
    MetaModel.syncSelection(current as any[], selectedItems, {
      keyOf: (item) => multiSelectOptionKeyOf(item, props),
      createFrom: cloneSelectedEntity,
    })
    return current
  }
  return selectedItems
}

export function emitMultiSelectChange(
  props: UiMultiSelectProps,
  bound: unknown,
): void {
  props.onChange?.(bound)
  props['onUpdate:modelValue']?.(bound)
  props.onUpdate?.(bound)
}

export function applyAndEmitMultiSelectKeys(
  props: UiMultiSelectProps,
  keys: Array<string | number>,
): void {
  const items = resolveMultiSelectItems(keys, props)
  emitMultiSelectChange(props, applyMultiSelectSelection(props, items))
}

export function multiSelectModifierClasses(
  props: UiMultiSelectProps,
): unknown[] {
  const mode = multiSelectBindModeOf(props)
  const display = props.display === 'text' ? 'mmda-multi-select--text' : undefined
  return ['mmda-multi-select', `mmda-multi-select--${mode}`, display, props.class]
}

export function withMultiSelectBindMode(
  props: UiMultiSelectProps,
  bindMode: UiMultiSelectBindMode,
): UiMultiSelectProps {
  return { ...props, bindMode }
}

function fieldOptionSource(field: MetaUiField, extra: PropData): unknown[] {
  if (Array.isArray(extra.options)) return extra.options
  const reference = field.reference
  if (!reference || reference.hasOne) return []
  return reference.refOptions ?? []
}

export function multiSelectPropsFromField(
  field: MetaUiField,
  context: MultiSelectFieldContext,
  extra: PropData = {},
): UiMultiSelectProps {
  const bindMode = (extra.bindMode as UiMultiSelectBindMode) ?? 'item_array'
  return {
    value: context.getFieldValue(field),
    options: fieldOptionSource(field, extra),
    bindMode,
    valueField: extra.valueField as string | undefined,
    labelField: extra.labelField as string | undefined,
    separator: extra.separator as string | undefined,
    display: extra.display as UiMultiSelectDisplay | undefined,
    placeholder: extra.placeholder ?? field.placeholder,
    disabled: extra.disabled ?? context.isFieldReadonly(field),
    allowFiltering: extra.allowFiltering as boolean | undefined,
    suggest: extra.suggest as UiSelectSuggest | undefined,
    reference: field.reference,
    onChange: (bound) => {
      if (bindMode === 'item_array') {
        const current = context.getFieldValue(field)
        if (current !== bound) context.setFieldValue(field, bound)
        else MetaModel.modify(context.model ?? {})
      } else {
        context.setFieldValue(field, bound)
      }
      if (typeof extra.onChange === 'function') extra.onChange(bound)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(bound)
    },
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...extra.htmlAttributes,
    },
  }
}

export function multiItemSelectPropsFromField(
  field: MetaUiField,
  context: MultiSelectFieldContext,
  extra: PropData = {},
): UiMultiSelectProps {
  return multiSelectPropsFromField(field, context, {
    ...extra,
    bindMode: 'item_array',
  })
}

export function multiValueSelectPropsFromField(
  field: MetaUiField,
  context: MultiSelectFieldContext,
  extra: PropData = {},
): UiMultiSelectProps {
  return multiSelectPropsFromField(field, context, {
    ...extra,
    bindMode: 'value_array',
  })
}

export function multiTextSelectPropsFromField(
  field: MetaUiField,
  context: MultiSelectFieldContext,
  extra: PropData = {},
): UiMultiSelectProps {
  return multiSelectPropsFromField(field, context, {
    ...extra,
    bindMode: 'join_text',
  })
}

export function multiBitSelectPropsFromField(
  field: MetaUiField,
  context: MultiSelectFieldContext,
  extra: PropData = {},
): UiMultiSelectProps {
  return multiSelectPropsFromField(field, context, {
    ...extra,
    bindMode: 'or_bits',
  })
}

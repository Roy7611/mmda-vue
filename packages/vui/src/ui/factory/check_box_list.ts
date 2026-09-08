/*
 * 横排勾选：checkBoxList = value_array；bitCheckBoxList = or_bits。
 * 不要 factory.checkBoxGroup。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'
import {
  applyAndEmitMultiSelectKeys,
  multiSelectBindModeOf,
  multiSelectBoundOf,
  multiSelectChromeOptionsOf,
  multiSelectItemsOf,
  multiSelectModifierClasses,
  multiSelectOptionKeyOf,
  multiSelectOptionLabelOf,
  multiSelectPropsFromField,
  multiSelectSelectedKeysOf,
  type MultiSelectFieldContext,
  type UiMultiSelectBindMode,
  type UiMultiSelectProps,
} from './multi_select'

export interface UiCheckBoxListProps extends UiMultiSelectProps {
  showSelectAll?: boolean
  selectAllLabel?: string
}

export function checkBoxListShowSelectAll(props: UiCheckBoxListProps): boolean {
  return props.showSelectAll !== false
}

export function checkBoxListSelectableOptions(
  props: UiCheckBoxListProps,
): unknown[] {
  return multiSelectChromeOptionsOf(props)
}

export function checkBoxListItemChecked(
  props: UiCheckBoxListProps,
  item: unknown,
): boolean {
  const key = multiSelectOptionKeyOf(item, props)
  return multiSelectSelectedKeysOf(props).some(
    (entry) => entry === key || String(entry) === String(key),
  )
}

export function checkBoxListSelectedCount(props: UiCheckBoxListProps): {
  selected: number
  total: number
} {
  const options = checkBoxListSelectableOptions(props)
  const selected = options.filter((item) =>
    checkBoxListItemChecked(props, item),
  ).length
  return { selected, total: options.length }
}

export function checkBoxListAllChecked(props: UiCheckBoxListProps): boolean {
  const { selected, total } = checkBoxListSelectedCount(props)
  return total > 0 && selected === total
}

export function checkBoxListIndeterminate(props: UiCheckBoxListProps): boolean {
  const { selected, total } = checkBoxListSelectedCount(props)
  return selected > 0 && selected < total
}

export function checkBoxListKeysAfterToggle(
  props: UiCheckBoxListProps,
  item: unknown,
  checked: boolean,
): Array<string | number> {
  const key = multiSelectOptionKeyOf(item, props)
  const keys = multiSelectSelectedKeysOf(props).filter(
    (entry) => entry !== key && String(entry) !== String(key),
  )
  if (checked && key !== '') keys.push(key)
  return keys
}

export function checkBoxListKeysAfterSelectAll(
  props: UiCheckBoxListProps,
): Array<string | number> {
  if (checkBoxListAllChecked(props)) return []
  return checkBoxListSelectableOptions(props)
    .map((item) => multiSelectOptionKeyOf(item, props))
    .filter((key) => key !== '')
}

export function emitCheckBoxListToggle(
  props: UiCheckBoxListProps,
  item: unknown,
  checked: boolean,
): void {
  applyAndEmitMultiSelectKeys(props, checkBoxListKeysAfterToggle(props, item, checked))
}

export function emitCheckBoxListSelectAll(props: UiCheckBoxListProps): void {
  applyAndEmitMultiSelectKeys(props, checkBoxListKeysAfterSelectAll(props))
}

export function checkBoxListModifierClasses(
  props: UiCheckBoxListProps,
): unknown[] {
  const mode = multiSelectBindModeOf(props)
  const bits = mode === 'or_bits' ? 'mmda-checkbox-list--bits' : undefined
  return [
    'mmda-checkbox-list',
    bits,
    ...multiSelectModifierClasses(props).filter(
      (cls) => cls !== 'mmda-multi-select' && cls !== `mmda-multi-select--${mode}`,
    ),
  ]
}

function withListBindMode(
  extra: PropData,
  bindMode: UiMultiSelectBindMode,
): PropData {
  return { ...extra, bindMode }
}

export function checkBoxListPropsFromField(
  field: MetaUiField,
  context: MultiSelectFieldContext,
  extra: PropData = {},
): UiCheckBoxListProps {
  return {
    ...multiSelectPropsFromField(
      field,
      context,
      withListBindMode(extra, 'value_array'),
    ),
    showSelectAll: extra.showSelectAll as boolean | undefined,
    selectAllLabel:
      (extra.selectAllLabel as string | undefined) ??
      context.t?.('action.selectAll'),
  }
}

export function bitCheckBoxListPropsFromField(
  field: MetaUiField,
  context: MultiSelectFieldContext,
  extra: PropData = {},
): UiCheckBoxListProps {
  return {
    ...multiSelectPropsFromField(
      field,
      context,
      withListBindMode(extra, 'or_bits'),
    ),
    showSelectAll: extra.showSelectAll as boolean | undefined,
    selectAllLabel:
      (extra.selectAllLabel as string | undefined) ??
      context.t?.('action.selectAll'),
  }
}

export function checkBoxListBoundPreview(
  props: UiCheckBoxListProps,
): unknown {
  return multiSelectBoundOf(multiSelectItemsOf(
    props.value !== undefined ? props.value : props.modelValue,
    props,
  ), props)
}

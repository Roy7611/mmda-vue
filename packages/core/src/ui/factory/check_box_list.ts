import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'
import { uiCssClass } from '../css'
import {
  multiSelectBoundOf,
  multiSelectChromeOptionsOf,
  multiSelectItemsOf,
  multiSelectModifierClasses,
  multiSelectOptionKeyOf,
  multiSelectPropsFromField,
  multiSelectSelectedKeysOf,
  type UiMultiSelectProps,
} from './multi_select'

export interface UiCheckBoxListProps extends UiMultiSelectProps {
  showSelectAll?: boolean
  selectAllLabel?: string
}

export function checkBoxListModifierClasses(
  props: UiCheckBoxListProps,
): unknown[] {
  const mode = props.bindMode ?? 'item_array'
  const bits =
    mode === 'or_bits' ? uiCssClass('checkbox-list', undefined, 'bits') : undefined
  return [
    uiCssClass('checkbox-list'),
    bits,
    ...multiSelectModifierClasses(props).filter(
      (cls) =>
        cls !== uiCssClass('multi-select') &&
        cls !== uiCssClass('multi-select', undefined, mode),
    ),
  ]
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



export function checkBoxListPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiCheckBoxListProps {
  return {
    ...multiSelectPropsFromField(field, context, {
      ...extra,
      bindMode: 'value_array',
    }),
    showSelectAll: extra.showSelectAll as boolean | undefined,
    selectAllLabel:
      (extra.selectAllLabel as string | undefined) ??
      context.t?.('action.selectAll'),
  }
}

export function bitCheckBoxListPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiCheckBoxListProps {
  return {
    ...multiSelectPropsFromField(field, context, {
      ...extra,
      bindMode: 'or_bits',
    }),
    showSelectAll: extra.showSelectAll as boolean | undefined,
    selectAllLabel:
      (extra.selectAllLabel as string | undefined) ??
      context.t?.('action.selectAll'),
  }
}

export function checkBoxListBoundPreview(
  props: UiCheckBoxListProps,
): unknown {
  return multiSelectBoundOf(
    multiSelectItemsOf(
      props.value !== undefined ? props.value : props.modelValue,
      props,
    ),
    props,
  )
}

import {
  applyMultiSelectSelection,
  callUiBagFn,
  resolveMultiSelectItems,
  type UiMultiSelectProps,
} from '@mmda/core'

export type {
  UiMultiSelectBindMode,
  UiMultiSelectDisplay,
  UiMultiSelectProps,
} from '@mmda/core'
export {
  MULTI_SELECT_SEPARATOR,
  applyMultiSelectSelection,
  multiBitSelectPropsFromField,
  multiItemSelectPropsFromField,
  multiSelectBindModeOf,
  multiSelectBoundOf,
  multiSelectChromeOptionsOf,
  multiSelectItemsOf,
  multiSelectLabelFieldOf,
  multiSelectModifierClasses,
  multiSelectOptionKeyOf,
  multiSelectOptionLabelOf,
  multiSelectPropsFromField,
  multiSelectSelectedKeysOf,
  multiSelectSeparatorOf,
  multiSelectValueFieldOf,
  multiTextSelectPropsFromField,
  multiValueSelectPropsFromField,
  resolveMultiSelectItems,
  withMultiSelectBindMode,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitMultiSelectChange(
  props: UiMultiSelectProps,
  bound: unknown,
): void {
  props.onChange?.(bound)
  callUiBagFn(props, 'onUpdate:modelValue', bound)
  callUiBagFn(props, 'onUpdate', bound)
}

export function applyAndEmitMultiSelectKeys(
  props: UiMultiSelectProps,
  keys: Array<string | number>,
): void {
  const items = resolveMultiSelectItems(keys, props)
  emitMultiSelectChange(props, applyMultiSelectSelection(props, items))
}

import {
  checkBoxListKeysAfterSelectAll,
  checkBoxListKeysAfterToggle,
  type UiCheckBoxListProps,
} from '@mmda/core'
import { applyAndEmitMultiSelectKeys } from './multi_select'

export type { UiCheckBoxListProps } from '@mmda/core'
export {
  bitCheckBoxListPropsFromField,
  checkBoxListAllChecked,
  checkBoxListBoundPreview,
  checkBoxListIndeterminate,
  checkBoxListItemChecked,
  checkBoxListKeysAfterSelectAll,
  checkBoxListKeysAfterToggle,
  checkBoxListModifierClasses,
  checkBoxListPropsFromField,
  checkBoxListSelectableOptions,
  checkBoxListSelectedCount,
  checkBoxListShowSelectAll,
} from '@mmda/core'

export function emitCheckBoxListToggle(
  props: UiCheckBoxListProps,
  item: unknown,
  checked: boolean,
): void {
  applyAndEmitMultiSelectKeys(
    props,
    checkBoxListKeysAfterToggle(props, item, checked),
  )
}

export function emitCheckBoxListSelectAll(props: UiCheckBoxListProps): void {
  applyAndEmitMultiSelectKeys(props, checkBoxListKeysAfterSelectAll(props))
}

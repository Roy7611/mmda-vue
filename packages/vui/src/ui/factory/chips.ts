/*
 * chrome 走 factory.chips。
 * 字段：tags / chips 自由文本；enumChipSet 枚举多值；bitChipSet 按位勾选。
 * 契约与纯 TS 辅助在 @mmda/core；v-model emit 在本文件。
 */
import { callUiBagFn, type UiChipsProps } from '@mmda/core'

export type {
  ChipsFieldContext,
  UiChipItem,
  UiChipsKind,
  UiChipsProps,
} from '@mmda/core'

export {
  bitChipSetPropsFromField,
  chipIsSelected,
  chipItemModifierClasses,
  chipLabelsFromField,
  chipsItemsOf,
  chipsKindOf,
  chipsModifierClasses,
  chipsPropsFromField,
  chipsSelectedOf,
  chipValueOf,
  enumChipSetBindModeOf,
  enumChipSetPropsFromField,
  isChipsRemovable,
  normalizeChipItem,
  toggleChipSelection,
} from '@mmda/core'

/** Vue v-model：`onUpdate:modelValue` / `onUpdate`。 */
export function emitChipsChange(
  props: UiChipsProps,
  selected: string | number | Array<string | number> | undefined,
): void {
  props.onChange?.(selected)
  callUiBagFn(props, 'onUpdate:modelValue', selected)
  callUiBagFn(props, 'onUpdate', selected)
}

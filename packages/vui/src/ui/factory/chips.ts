/*
 * chrome 走 factory.chips。
 * 字段：tags / chips 自由文本；enumChipSet 枚举多值；bitChipSet 按位勾选。
 * 契约与纯 TS 辅助在 @mmda/core；皮肤词在各厂商 factory/chips。
 */
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
  emitChipsChange,
  enumChipSetBindModeOf,
  enumChipSetPropsFromField,
  isChipsRemovable,
  normalizeChipItem,
  toggleChipSelection,
} from '@mmda/core'

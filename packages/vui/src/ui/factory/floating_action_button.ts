import type { VNode } from 'vue'
import type { UiFloatingActionButtonProps } from '@mmda/core'
import type { UiButtonSlots } from '@mmda/core'

export type {
  UiFabPosition,
  UiFloatingActionButtonProps,
} from '@mmda/core'
export { fabModifierClasses } from '@mmda/core'

export type UiFloatingActionButtonRenderer = (
  props: UiFloatingActionButtonProps,
  slots?: UiButtonSlots<VNode>,
) => VNode

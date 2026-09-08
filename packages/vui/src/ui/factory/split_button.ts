import type { ChildSlot } from '../../contexts/view'
import type { PropData, UiSlots } from '../layout/layout'
import type { UiAction } from './action'
import type { UiButtonProps } from './button'

export interface UiSplitButtonProps extends UiButtonProps {
  actions: UiAction[]
  menuitemiconSlot?: ChildSlot
  splitSlot?: UiSlots
  splitProps?: PropData
}

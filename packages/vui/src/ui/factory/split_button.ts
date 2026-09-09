import type { ChildSlot } from '../../contexts/view'
import type {UiProps, UiSlots} from '../layout/layout'
import type { UiSplitButtonProps as CoreUiSplitButtonProps } from '@mmda/core'

export type { UiSplitButtonProps as CoreSplitButtonProps } from '@mmda/core'

/** vui 扩展：菜单槽与拆分 props（厂商壳用）。 */
export interface UiSplitButtonProps extends CoreUiSplitButtonProps {
  menuitemiconSlot?: ChildSlot
  splitSlot?: UiSlots
  splitProps?: UiProps
}

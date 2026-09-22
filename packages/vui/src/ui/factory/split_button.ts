import type { ChildSlot } from '../../contexts/view'
import type {VuiTileSlots} from '../layout'
import type { UiProps } from '@mmda/core'
import type { UiSplitButtonProps as CoreUiSplitButtonProps } from '@mmda/core'

export type { UiSplitButtonProps as CoreSplitButtonProps } from '@mmda/core'

/** vui 扩展：菜单槽与拆分 props（厂商壳用）。 */
export interface VuiSplitButtonProps extends CoreUiSplitButtonProps {
  menuitemiconSlot?: ChildSlot
  splitSlot?: VuiTileSlots
  splitProps?: UiProps
}

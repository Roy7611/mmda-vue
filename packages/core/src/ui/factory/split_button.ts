import type { UiAction } from '../action'
import type { UiButtonProps } from './button'

export interface UiSplitButtonProps extends UiButtonProps {
  actions: UiAction[]
}

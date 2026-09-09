import type { UiLoadingProps } from '@mmda/core'
import { loadingSizeOf } from '@mmda/core'

export type { UiLoadingProps, UiLoadingSize } from '@mmda/core'
export {
  LOADING_WIDTH_LARGE,
  LOADING_WIDTH_MEDIUM,
  LOADING_WIDTH_SMALL,
  loadingLabelOf,
  loadingModifierClasses,
  loadingSizeOf,
  loadingWidthOf,
} from '@mmda/core'

/** Naive 尺寸词 */
export function loadingNaiveSizeOf(
  props: UiLoadingProps = {},
): 'small' | 'medium' | 'large' {
  return loadingSizeOf(props) ?? 'medium'
}

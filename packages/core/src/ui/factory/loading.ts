import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiLoadingSize = 'small' | 'large'

export interface UiLoadingProps extends UiProps {
  /** 框旁/下说明。可选 */
  label?: string
  /** small / large。省略 = 中档 */
  size?: UiLoadingSize
}

export function loadingModifierClasses(props: UiLoadingProps = {}): unknown[] {
  const size =
    props.size === 'small' || props.size === 'large' ? props.size : undefined
  const labeled =
    props.label != null && props.label !== ''
      ? uiCssClass('loading', undefined, 'labeled')
      : undefined
  return [
    uiCssClass('loading'),
    size ? uiCssClass('loading', undefined, size) : undefined,
    labeled,
    props.class,
  ]
}

export const LOADING_WIDTH_SMALL = 24
export const LOADING_WIDTH_MEDIUM = 48
export const LOADING_WIDTH_LARGE = 64

export function loadingLabelOf(props: UiLoadingProps = {}): string | undefined {
  if (props.label == null || props.label === '') return undefined
  return String(props.label)
}

export function loadingSizeOf(
  props: UiLoadingProps = {},
): UiLoadingSize | undefined {
  if (props.size === 'small' || props.size === 'large') return props.size
  return undefined
}

export function loadingWidthOf(props: UiLoadingProps = {}): number {
  const size = loadingSizeOf(props)
  if (size === 'small') return LOADING_WIDTH_SMALL
  if (size === 'large') return LOADING_WIDTH_LARGE
  return LOADING_WIDTH_MEDIUM
}

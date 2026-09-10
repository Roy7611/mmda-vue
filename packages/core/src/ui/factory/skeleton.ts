import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiSkeletonShape = 'text' | 'circle' | 'square' | 'rectangle'
export type UiSkeletonShimmer = 'wave' | 'pulse' | 'fade' | 'none'

export interface UiSkeletonProps extends UiProps {
  /** 缺省 text */
  shape?: UiSkeletonShape
  width?: string | number
  height?: string | number
  /** 缺省 wave。对应 EJ2 shimmerEffect */
  shimmer?: UiSkeletonShimmer
  visible?: boolean
}

export function skeletonModifierClasses(
  props: UiSkeletonProps = {},
): unknown[] {
  const shape = props.shape ?? 'text'
  const shimmer = props.shimmer ?? 'wave'
  return [
    uiCssClass('skeleton'),
    uiCssClass('skeleton', undefined, shape),
    uiCssClass('skeleton', undefined, shimmer),
    props.class,
  ]
}

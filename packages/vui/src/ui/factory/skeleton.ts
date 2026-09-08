/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/skeleton/vue-3-getting-started
 *
 * chrome 占位走 factory.skeleton。vui 名是 skeleton / shimmer，
 * 不要 SkeletonComponent / shimmerEffect 当公开名。
 * 不是字段展示，没有 fldFactory.skeleton。整页忙碌仍是 factory.loading。
 */
import type { PropData } from '../layout/layout'

export type UiSkeletonShape = 'text' | 'circle' | 'square' | 'rectangle'
export type UiSkeletonShimmer = 'wave' | 'pulse' | 'fade' | 'none'

export interface UiSkeletonProps extends PropData {
  /** 缺省 text */
  shape?: UiSkeletonShape
  width?: string | number
  height?: string | number
  /** 缺省 wave。对应 EJ2 shimmerEffect */
  shimmer?: UiSkeletonShimmer
  visible?: boolean
}

export function skeletonModifierClasses(props: UiSkeletonProps = {}): unknown[] {
  const shape = props.shape ?? 'text'
  const shimmer = props.shimmer ?? 'wave'
  return [
    'mmda-skeleton',
    `mmda-skeleton--${shape}`,
    `mmda-skeleton--${shimmer}`,
    props.class,
  ]
}

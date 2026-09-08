import { h } from 'vue'
import { NSkeleton } from 'naive-ui'
import type { UiSkeletonProps } from '@mmda/vui'
import { skeletonModifierClasses } from '@mmda/vui'

export function createSkeleton(props: UiSkeletonProps = {}) {
  const {
    shape,
    width,
    height,
    shimmer,
    visible,
    class: _className,
    htmlAttributes,
    ...rest
  } = props

  if (visible === false) {
    return h('span', {
      class: skeletonModifierClasses(props),
      style: { display: 'none' },
    })
  }

  return h(NSkeleton, {
    ...rest,
    ...htmlAttributes,
    text: (shape ?? 'text') === 'text',
    avatar: shape === 'circle',
    width,
    height,
    animated: shimmer !== 'none',
    class: skeletonModifierClasses(props),
  })
}

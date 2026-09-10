import { h } from 'vue'
import { NSpin } from 'naive-ui'
import type { UiLoadingProps } from '@mmda/vui'
import {
  htmlAttributesOf,
  loadingLabelOf,
  loadingModifierClasses,
  loadingSizeOf,
} from '@mmda/vui'

/** Naive 尺寸词 */
export function loadingNaiveSizeOf(
  props: UiLoadingProps = {},
): 'small' | 'medium' | 'large' {
  return loadingSizeOf(props) ?? 'medium'
}

export function createLoading(props: UiLoadingProps = {}) {
  const {
    label: _label,
    size: _size,
    class: _className,
    htmlAttributes,
    ...rest
  } = props

  const label = loadingLabelOf(props)

  return h(NSpin, {
    ...rest,
    ...htmlAttributesOf(props),
    size: loadingNaiveSizeOf(props),
    description: label,
    class: loadingModifierClasses(props).flat(),
  })
}

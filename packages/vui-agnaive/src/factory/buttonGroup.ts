import { h, type VNode } from 'vue'
import { NButtonGroup } from 'naive-ui'
import type { UiButtonGroupProps } from '@mmda/vui'

export function createButtonGroup(
  children: () => VNode[],
  props: UiButtonGroupProps = {},
) {
  const {
    htmlAttributes,
    class: className,
    orientation,
    ...rest
  } = props
  return h(
    NButtonGroup,
    {
      ...rest,
      ...htmlAttributes,
      vertical: orientation === 'vertical',
      class: [
        'mmda-button-group',
        'mmda-agnaive-button-group',
        className,
      ].filter(Boolean),
    },
    {
      default: () => children().filter(Boolean),
    },
  )
}

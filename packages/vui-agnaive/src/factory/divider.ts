import { h } from 'vue'
import { NDivider } from 'naive-ui'
import type { UiDividerProps } from '@mmda/vui'
import { dividerModifierClasses } from '@mmda/vui'

export function createDivider(props: UiDividerProps = {}) {
  const {
    orientation,
    label,
    class: _className,
    htmlAttributes,
    ...rest
  } = props
  return h(
    NDivider,
    {
      ...rest,
      ...htmlAttributes,
      vertical: orientation === 'vertical',
      class: dividerModifierClasses(props),
    },
    label ? { default: () => label } : undefined,
  )
}

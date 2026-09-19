import { h } from 'vue'
import { uiCssClass, uiRenderProps } from '@mmda/core'
import type { UiToolbarProps, UiToolbarSlotName, UiToolbarSlots } from '@mmda/vui'
import { toolbarModifierClasses, toolbarRegionsOf } from '@mmda/vui'

export function createToolbar(props: UiToolbarProps = {}, slots?: UiToolbarSlots) {
  const { overflow: _overflow, disabled, htmlAttributes, class: _className, ...rest } = props
  const named =
    typeof slots?.start === 'function' ||
    typeof slots?.center === 'function' ||
    typeof slots?.end === 'function'
  const attrs = {
    ...rest,
    ...uiRenderProps(props).attributes,
    ...(disabled ? { 'aria-disabled': 'true' } : {}),
    class: toolbarModifierClasses(props),
    role: 'toolbar',
  }
  if (!named) {
    return h('div', attrs, slots?.default?.() as any)
  }
  const regions = toolbarRegionsOf(slots)
  const names: UiToolbarSlotName[] = ['start', 'center', 'end']
  return h(
    'div',
    attrs,
    names.flatMap((name) => {
      const content = regions[name]
      if (typeof content !== 'function') return []
      return [h('div', { class: uiCssClass('toolbar', name) }, content() as any)]
    }),
  )
}

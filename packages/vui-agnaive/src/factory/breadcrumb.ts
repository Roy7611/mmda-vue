import { h } from 'vue'
import { RouterLink } from 'vue-router'
import type { IconResolver, UiBreadcrumbProps } from '@mmda/vui'
import { htmlAttributesOf } from '@mmda/vui'

export function createBreadcrumb(
  props: UiBreadcrumbProps,
  resolveIcon?: IconResolver,
) {
  const {
    items = [],
    separator = '/',
    class: className,
    htmlAttributes,
    ...rest
  } = props

  return h(
    'nav',
    {
      ...rest,
      ...htmlAttributesOf(props),
      class: ['mmda-breadcrumb', className],
      'aria-label': 'breadcrumb',
    },
    items.map((item, index) =>
      h('span', { key: item.key ?? `bc-${index}`, class: 'mmda-breadcrumb__item' }, [
        index > 0 ? h('span', { class: 'mmda-breadcrumb__sep' }, separator) : null,
        item.icon
          ? h('i', {
              class: [
                resolveIcon ? resolveIcon(item.icon) : item.icon,
                'mmda-breadcrumb__icon',
              ],
              'aria-hidden': 'true',
            })
          : null,
        item.to
          ? h(RouterLink as any, { to: item.to, class: 'mmda-breadcrumb__link' }, () => item.label)
          : h('span', item.label),
      ]),
    ),
  )
}

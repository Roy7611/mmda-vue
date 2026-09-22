/*
 * chrome 时间轴走 factory.timeline。vui 名是 timeline。
 * Prime Timeline：value / layout / align；对侧走 #opposite。
 *
 * 本工厂只消费列表侧入参（core `UiTimelineProps`）；事件、控制器、可见范围
 * 归 Tempis 契约（`buildTempisTimeline`），这里一个都不透传。
 */
import { h } from 'vue'
import Timeline from 'primevue/timeline'
import type { UiTimelineAlign, UiTimelineProps } from '@mmda/core'
import type { IconResolver } from '@mmda/vui'
import { timelineAlignOf, timelineItemsOf, timelineListContentOf, timelineListOppositeOf, timelineModifierClasses, timelineOrientationOf } from '@mmda/vui'
import { uiRenderProps } from '@mmda/core'

function primeAlignOf(
  orientation: 'horizontal' | 'vertical',
  align: UiTimelineAlign,
): string {
  if (align === 'alternate' || align === 'alternateReverse') return 'alternate'
  if (orientation === 'horizontal') {
    return align === 'before' ? 'top' : 'bottom'
  }
  return align === 'before' ? 'right' : 'left'
}

export function createTimeline(
  props: UiTimelineProps,
  resolveIcon?: IconResolver,
) {
  const orientation = timelineOrientationOf(props)
  let items = timelineItemsOf(props)
  if (props.reverse) items = [...items].reverse()

  return h(
    Timeline,
    {
      ...uiRenderProps(props).attributes,
      value: items,
      layout: orientation,
      align: primeAlignOf(orientation, timelineAlignOf(props)),
      class: timelineModifierClasses(props),
    },
    {
      opposite: ({ item, index }: { item: (typeof items)[number]; index: number }) =>
        timelineListOppositeOf(item) ?? '',
      content: ({ item, index }: { item: (typeof items)[number]; index: number }) =>
        timelineListContentOf(item, index),
      marker: ({ item }: { item: (typeof items)[number] }) =>
        item.icon
          ? h('i', {
              class: resolveIcon ? resolveIcon(item.icon) : item.icon,
              'aria-hidden': 'true',
            })
          : undefined,
    },
  )
}

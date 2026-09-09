/*
 * chrome 时间轴走 factory.timeline。vui 名是 timeline。
 * Prime Timeline：value / layout / align；对侧走 #opposite。
 */
import { h } from 'vue'
import Timeline from 'primevue/timeline'
import type { UiTimelineAlign, UiTimelineProps } from '@mmda/core'
import type { IconResolver } from '@mmda/vui'
import { htmlAttributesOf, noopTimelineController, timelineAlignOf, timelineItemsOf, timelineListContentOf, timelineListOppositeOf, timelineModifierClasses, timelineOrientationOf } from '@mmda/vui'

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
  const {
    items: _items,
    keyField: _keyField,
    labelField: _labelField,
    contentField: _contentField,
    oppositeContentField: _oppositeContentField,
    iconField: _iconField,
    disabledField: _disabledField,
    cssClassField: _cssClassField,
    timeField: _timeField,
    startField: _startField,
    endField: _endField,
    groupingField: _groupingField,
    categoryField: _categoryField,
    progressField: _progressField,
    orientation: _orientation,
    align: _align,
    reverse,
    timeDisplay: _timeDisplay,
    timeFormat: _timeFormat,
    locale: _locale,
    rtl: _rtl,
    persist: _persist,
    height: _height,
    range: _range,
    template: _template,
    onItemClick: _onItemClick,
    onSelectionChange: _onSelectionChange,
    onRangeChange: _onRangeChange,
    onReady,
    class: _className,
    htmlAttributes,
    ...rest
  } = props

  onReady?.(noopTimelineController)

  const orientation = timelineOrientationOf(props)
  let items = timelineItemsOf(props)
  if (reverse) items = [...items].reverse()

  return h(
    Timeline,
    {
      ...rest,
      ...htmlAttributesOf(props),
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

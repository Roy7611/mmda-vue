import { h } from 'vue'
import { NCarousel } from 'naive-ui'
import type { UiCarouselProps } from '@mmda/vui'
import {
  carouselBoundIndex,
  carouselModifierClasses,
  carouselSlideContent,
  emitCarouselChange,
  htmlAttributesOf,
} from '@mmda/vui'

export function createCarousel(props: UiCarouselProps) {
  const {
    items = [],
    selectedIndex: _selectedIndex,
    modelValue: _modelValue,
    autoPlay,
    interval,
    loop,
    animation,
    itemRenderer,
    onChange: _onChange,
    htmlAttributes,
    ...rest
  } = props

  return h(
    NCarousel,
    {
      ...rest,
      ...htmlAttributesOf(props),
      defaultIndex: carouselBoundIndex(props),
      autoplay: autoPlay ?? false,
      ...(interval != null ? { interval } : {}),
      ...(loop != null ? { loop } : {}),
      ...(animation ? { effect: animation } : {}),
      'onUpdate:currentIndex': (index: number) => emitCarouselChange(props, index),
      class: [...carouselModifierClasses(props)].flat(),
    },
    {
      default: () =>
        items.map((item, index) =>
          h(
            'div',
            { key: item.key ?? item.src ?? index },
            [carouselSlideContent(item, index, itemRenderer)],
          ),
        ),
    },
  )
}

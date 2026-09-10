/*
 * chrome 轮播走 factory.carousel。图库 SfImageGallery 仍自管，不要在这里改。
 * 契约在 @mmda/core ui/chrome.ts。
 */
import { h, type VNodeChild } from 'vue'
import { uiCssClass, type UiCarouselItem, type UiCarouselProps } from '@mmda/core'

export type { UiCarouselAnimation, UiCarouselItem, UiCarouselProps } from '@mmda/core'
export { carouselBoundIndex, carouselModifierClasses } from '@mmda/core'

export function emitCarouselChange(props: UiCarouselProps, index: number): void {
  props.onChange?.(index)
  ;(props as { 'onUpdate:modelValue'?: (value: number) => void })[
    'onUpdate:modelValue'
  ]?.(index)
}

export function carouselSlideContent(
  item: UiCarouselItem,
  index: number,
  renderer?: UiCarouselProps['itemRenderer'],
): VNodeChild {
  if (renderer) return renderer(item, index) as VNodeChild
  if (item.content != null) return item.content as VNodeChild
  if (!item.src) return item.title ?? item.description ?? null
  return h('figure', { class: uiCssClass('carousel-slide') }, [
    h('img', {
      class: uiCssClass('carousel-slide__img'),
      src: item.src,
      alt: item.alt ?? item.title ?? '',
    }),
    item.title || item.description
      ? h(
          'figcaption',
          { class: uiCssClass('carousel-slide__caption') },
          item.description ?? item.title,
        )
      : null,
  ])
}

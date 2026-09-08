/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/api/carousel/index-default
 *
 * chrome 轮播走 factory.carousel。图库 SfImageGallery 仍自管，不要在这里改。
 */
import { h, type VNodeChild } from 'vue'
import type { PropData } from '../layout/layout'

export type UiCarouselAnimation = 'slide' | 'fade'

export interface UiCarouselItem {
  key?: string
  src?: string
  alt?: string
  title?: string
  description?: string
  content?: VNodeChild
}

export interface UiCarouselProps extends PropData {
  items: UiCarouselItem[]
  selectedIndex?: number
  autoPlay?: boolean
  interval?: number
  loop?: boolean
  animation?: UiCarouselAnimation
  itemRenderer?: (item: UiCarouselItem, index: number) => VNodeChild
  onChange?: (index: number) => void
}

export function carouselModifierClasses(props: UiCarouselProps): unknown[] {
  const animation = props.animation
    ? `mmda-carousel--${props.animation}`
    : undefined
  return ['mmda-carousel', animation, props.class]
}

export function carouselBoundIndex(props: UiCarouselProps): number {
  const raw =
    props.selectedIndex !== undefined ? props.selectedIndex : props.modelValue
  const index = typeof raw === 'number' ? raw : 0
  return index < 0 ? 0 : index
}

export function emitCarouselChange(props: UiCarouselProps, index: number): void {
  props.onChange?.(index)
  props['onUpdate:modelValue']?.(index)
}

export function carouselEj2Effect(
  animation?: UiCarouselAnimation,
): 'Slide' | 'Fade' | undefined {
  if (!animation) return undefined
  return animation === 'fade' ? 'Fade' : 'Slide'
}

export function carouselSlideContent(
  item: UiCarouselItem,
  index: number,
  renderer?: UiCarouselProps['itemRenderer'],
): VNodeChild {
  if (renderer) return renderer(item, index)
  if (item.content != null) return item.content
  if (!item.src) return item.title ?? item.description ?? null
  return h('figure', { class: 'mmda-carousel-slide' }, [
    h('img', {
      class: 'mmda-carousel-slide__img',
      src: item.src,
      alt: item.alt ?? item.title ?? '',
    }),
    item.title || item.description
      ? h(
          'figcaption',
          { class: 'mmda-carousel-slide__caption' },
          item.description ?? item.title,
        )
      : null,
  ])
}

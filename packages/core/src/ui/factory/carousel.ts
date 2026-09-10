import type { UiProps } from '../props'
import { uiCssClass } from '../css'

export type UiCarouselAnimation = 'slide' | 'fade'

export interface UiCarouselItem<TNode = any> {
  key?: string
  src?: string
  alt?: string
  title?: string
  description?: string
  content?: TNode
}

export interface UiCarouselProps<TNode = any> extends UiProps {
  items: UiCarouselItem<TNode>[]
  selectedIndex?: number
  autoPlay?: boolean
  interval?: number
  loop?: boolean
  animation?: UiCarouselAnimation
  itemRenderer?: (item: UiCarouselItem<TNode>, index: number) => TNode
  onChange?: (index: number) => void
}

export function carouselModifierClasses(props: {
  animation?: UiCarouselAnimation
  class?: unknown
}): unknown[] {
  const animation = props.animation
    ? uiCssClass('carousel', props.animation)
    : undefined
  return [uiCssClass('carousel'), animation, props.class]
}

export function carouselBoundIndex(props: UiCarouselProps): number {
  const raw =
    props.selectedIndex !== undefined ? props.selectedIndex : props.modelValue
  const index = typeof raw === 'number' ? raw : 0
  return index < 0 ? 0 : index
}

export interface UiImageGalleryItem {
  src: string
  thumbnail?: string
  alt?: string
  title?: string
  description?: string
  data?: unknown
}

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
    ? uiCssClass('carousel', undefined, props.animation)
    : undefined
  return [uiCssClass('carousel'), animation, props.class]
}

export function carouselBoundIndex(props: UiCarouselProps): number {
  const raw =
    props.selectedIndex
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

/** 图片墙（`factory.imageGallery`）属性。 */
export interface UiImageGalleryProps extends UiProps {
  items: UiImageGalleryItem[]
  /** 缩略图网格列数。 */
  columns?: number
  emptyText?: string
  dialogTitle?: string
  loop?: boolean
  onItemClick?: (item: UiImageGalleryItem, index: number) => void
  onItemDblclick?: (item: UiImageGalleryItem, index: number) => void
}

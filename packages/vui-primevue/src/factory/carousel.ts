import { h } from "vue";
import Carousel from "primevue/carousel";
import type { UiCarouselProps } from '@mmda/core';
import { carouselBoundIndex, carouselModifierClasses, carouselSlideContent, emitCarouselChange, htmlAttributesOf } from "@mmda/vui"

export function createCarousel(props: UiCarouselProps) {
  const {
    items = [],
    selectedIndex: _selectedIndex,
    modelValue: _modelValue,
    autoPlay,
    interval,
    loop,
    animation: _animation,
    itemRenderer,
    onChange: _onChange,
    htmlAttributes,
    ...rest
  } = props;

  return h(
    Carousel,
    {
      ...rest,
      ...htmlAttributesOf(props),
      value: items,
      page: carouselBoundIndex(props),
      "onUpdate:page": (page: number) => emitCarouselChange(props, page),
      numVisible: 1,
      numScroll: 1,
      circular: loop ?? false,
      autoplayInterval: autoPlay ? (interval ?? 5000) : 0,
      class: [...carouselModifierClasses(props)].flat(),
    },
    {
      item: (slot: { data: any; index?: number }) => {
        const item = slot.data ?? {};
        const index =
          typeof slot.index === "number" ? slot.index : items.indexOf(item);
        return carouselSlideContent(item, index < 0 ? 0 : index, itemRenderer);
      },
    },
  );
}

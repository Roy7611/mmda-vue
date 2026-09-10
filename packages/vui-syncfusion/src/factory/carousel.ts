import { h } from "vue";
import { CarouselComponent } from "@syncfusion/ej2-vue-navigations";
import type { UiCarouselProps } from '@mmda/core';
import { carouselBoundIndex, carouselModifierClasses, carouselSlideContent, emitCarouselChange, htmlAttributesOf } from "@mmda/vui"

export function carouselEj2Effect(
  animation?: UiCarouselProps["animation"],
): "Slide" | "Fade" | undefined {
  if (!animation) return undefined
  return animation === "fade" ? "Fade" : "Slide"
}

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
  } = props;

  const cssClass = carouselModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");
  const effect = carouselEj2Effect(animation);

  return h(
    CarouselComponent as any,
    {
      ...rest,
      ...htmlAttributesOf(props),
      dataSource: items,
      selectedIndex: carouselBoundIndex(props),
      ...(autoPlay != null ? { autoPlay } : {}),
      ...(interval != null ? { interval } : {}),
      ...(loop != null ? { infinite: loop } : {}),
      ...(effect ? { animationEffect: effect } : {}),
      cssClass,
      slideChanged: (args: { currentIndex?: number }) => {
        if (typeof args?.currentIndex === "number") {
          emitCarouselChange(props, args.currentIndex);
        }
      },
    },
    {
      itemTemplate: (slot: { data?: any; index?: number }) => {
        const item = slot.data ?? {};
        const index =
          typeof slot.index === "number" ? slot.index : items.indexOf(item);
        return carouselSlideContent(item, index < 0 ? 0 : index, itemRenderer);
      },
    },
  );
}

import { h } from "vue";
import Card from "primevue/card";
import type { UiCardProps, UiCardSlots } from "@mmda/vui";
import { cardModifierClasses } from "@mmda/vui";
import { createDivider } from "./divider";

const cover = (props: UiCardProps, slots?: UiCardSlots) => {
  const custom = slots?.image?.();
  if (custom?.length) {
    return [
      ...custom,
      props.imageTitle
        ? h("div", { class: "mmda-card-image-title" }, props.imageTitle)
        : null,
    ];
  }
  if (!props.image) return null;
  return [
    h("img", {
      src: props.image,
      alt: props.imageAlt,
      class: "mmda-card-image",
    }),
    props.imageTitle
      ? h("div", { class: "mmda-card-image-title" }, props.imageTitle)
      : null,
  ];
};

const titleRow = (props: UiCardProps, slots?: UiCardSlots) => {
  if (slots?.header) {
    return [
      ...slots.header(),
      slots.actions
        ? h("div", { class: "mmda-card-actions" }, slots.actions())
        : null,
    ];
  }
  if (!props.title && !props.headerImage && !slots?.actions) return null;
  return h("div", { class: "mmda-card-title-row" }, [
    props.headerImage
      ? h("img", {
          src: props.headerImage,
          alt: "",
          class: "mmda-card-header-image",
        })
      : null,
    props.title ? h("span", { class: "mmda-card-title" }, props.title) : null,
    slots?.actions
      ? h("div", { class: "mmda-card-actions" }, slots.actions())
      : null,
  ]);
};

export function createCard(props: UiCardProps, slots?: UiCardSlots) {
  const {
    title,
    subtitle,
    colorRole: _colorRole,
    surface: _surface,
    image: _image,
    imageAlt: _imageAlt,
    imageTitle: _imageTitle,
    headerImage: _headerImage,
    divider,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;
  const headerCover = cover(props, slots);
  const titleNodes = titleRow(props, slots);
  return h(
    Card,
    {
      ...rest,
      ...htmlAttributes,
      class: cardModifierClasses(props),
    },
    {
      header: headerCover ? () => headerCover : undefined,
      title: titleNodes ? () => titleNodes : title ? () => title : undefined,
      subtitle: subtitle ? () => subtitle : undefined,
      content: () => [
        divider ? createDivider() : null,
        slots?.default?.(),
      ],
      footer: slots?.footer ? () => slots.footer!() : undefined,
    },
  );
}

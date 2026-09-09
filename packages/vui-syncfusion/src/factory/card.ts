import { h } from "vue";
import type { UiCardProps, UiCardSlots } from "@mmda/core"
import { cardModifierClasses } from "@mmda/core"
const coverNode = (props: UiCardProps, slots?: UiCardSlots) => {
  const custom = slots?.image?.();
  if (custom?.length) {
    return h(
      "div",
      {
        class: "e-card-image",
        "aria-label": props.imageAlt,
      },
      [
        ...custom,
        props.imageTitle
          ? h("div", { class: "e-card-title" }, props.imageTitle)
          : null,
      ],
    );
  }
  if (!props.image) return null;
  return h(
    "div",
    {
      class: "e-card-image",
      role: "img",
      "aria-label": props.imageAlt,
      style: {
        backgroundImage: `url(${props.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      },
    },
    props.imageTitle
      ? h("div", { class: "e-card-title" }, props.imageTitle)
      : undefined,
  );
};

const titleBlock = (props: UiCardProps, slots?: UiCardSlots) => {
  if (slots?.header) {
    return h("div", { class: "e-card-header" }, [
      slots.header(),
      slots.actions
        ? h("div", { class: "e-card-actions" }, slots.actions())
        : null,
    ]);
  }
  if (!props.title && !props.subtitle && !props.headerImage && !slots?.actions) {
    return null;
  }
  return h("div", { class: "e-card-header" }, [
    props.headerImage
      ? h("div", {
          class: "e-card-header-image",
          role: "img",
          style: {
            backgroundImage: `url(${props.headerImage})`,
            backgroundSize: "cover",
          },
        })
      : null,
    h("div", { class: "e-card-header-caption" }, [
      props.title
        ? h("div", { class: "e-card-header-title" }, props.title)
        : null,
      props.subtitle
        ? h("div", { class: "e-card-sub-title" }, props.subtitle)
        : null,
    ]),
    slots?.actions
      ? h("div", { class: "e-card-actions" }, slots.actions())
      : null,
  ]);
};

export function createCard(props: UiCardProps, slots?: UiCardSlots) {
  const {
    title: _title,
    subtitle: _subtitle,
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
  return h(
    "div",
    {
      ...rest,
      ...htmlAttributes,
      class: ["e-card", cardModifierClasses(props)],
    },
    [
      coverNode(props, slots),
      titleBlock(props, slots),
      divider ? h("div", { class: "e-card-separator" }) : null,
      slots?.default
        ? h("div", { class: "e-card-content" }, slots.default())
        : null,
      slots?.footer
        ? h("div", { class: "e-card-footer" }, slots.footer())
        : null,
    ],
  );
}

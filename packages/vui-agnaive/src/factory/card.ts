import { h } from 'vue'
import { NCard } from 'naive-ui'
import type { UiCardProps, UiCardSlots } from '@mmda/vui'
import { cardModifierClasses } from '@mmda/vui'
import { createDivider } from './divider'

const cover = (props: UiCardProps, slots?: UiCardSlots) => {
  const custom = slots?.image?.()
  if (custom?.length) {
    return [
      ...custom,
      props.imageTitle
        ? h('div', { class: 'mmda-card-image-title' }, props.imageTitle)
        : null,
    ]
  }
  if (!props.image) return null
  return [
    h('img', {
      src: props.image,
      alt: props.imageAlt,
      class: 'mmda-card-image',
    }),
    props.imageTitle
      ? h('div', { class: 'mmda-card-image-title' }, props.imageTitle)
      : null,
  ]
}

const headerRow = (props: UiCardProps, slots?: UiCardSlots) => {
  if (slots?.header) return slots.header()
  if (!props.headerImage && !props.title && !props.subtitle) return null
  return h('div', { class: 'mmda-card-title-row' }, [
    props.headerImage
      ? h('img', {
          src: props.headerImage,
          alt: '',
          class: 'mmda-card-header-image',
        })
      : null,
    h('div', [
      props.title ? h('span', { class: 'mmda-card-title' }, props.title) : null,
      props.subtitle
        ? h('div', { class: 'mmda-card-subtitle' }, props.subtitle)
        : null,
    ]),
  ])
}

export function createCard(props: UiCardProps, slots?: UiCardSlots) {
  const {
    title,
    subtitle,
    colorRole: _colorRole,
    surface,
    image: _image,
    imageAlt: _imageAlt,
    imageTitle: _imageTitle,
    headerImage,
    divider,
    class: _className,
    htmlAttributes,
    ...rest
  } = props
  const coverNodes = cover(props, slots)
  const headerNodes = headerRow(props, slots)
  const useHeaderSlot = Boolean(slots?.header || headerImage || subtitle)
  return h(
    NCard,
    {
      ...rest,
      ...htmlAttributes,
      title: useHeaderSlot ? undefined : title,
      bordered: surface === 'outlined',
      class: cardModifierClasses(props),
    },
    {
      cover: coverNodes ? () => coverNodes : undefined,
      header: useHeaderSlot && headerNodes ? () => headerNodes : undefined,
      'header-extra': slots?.actions ? () => slots.actions!() : undefined,
      default: () => [divider ? createDivider() : null, slots?.default?.()],
      footer: slots?.footer ? () => slots.footer!() : undefined,
    },
  )
}

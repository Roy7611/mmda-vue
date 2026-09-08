import { h } from 'vue'
import { NTag } from 'naive-ui'
import type { IconResolver, UiChipsProps } from '@mmda/vui'
import {
  chipIsSelected,
  chipItemModifierClasses,
  chipsItemsOf,
  chipsKindOf,
  chipsModifierClasses,
  createIconVNode,
  emitChipsChange,
  htmlAttributesOf,
  isChipsRemovable,
  naiveChipType,
  toggleChipSelection,
} from '@mmda/vui'

export function createChips(
  props: UiChipsProps,
  resolveIcon?: IconResolver,
) {
  const items = chipsItemsOf(props)
  const kind = chipsKindOf(props)
  const removable = isChipsRemovable(props)
  const checkable = kind === 'choice' || kind === 'filter'
  const iconClass = (name?: string) =>
    name ? (resolveIcon ? resolveIcon(name) : name) : undefined

  return h(
    'div',
    {
      ...htmlAttributesOf(props),
      class: [...chipsModifierClasses(props)].flat(),
    },
    items.map((item, index) => {
      const trailing = item.trailingIcon
        ? createIconVNode(iconClass(item.trailingIcon) ?? item.trailingIcon)
        : null
      const slots: Record<string, () => unknown> = {
        default: () => [item.label, trailing].filter(Boolean),
      }
      if (item.avatarSrc) {
        slots.avatar = () =>
          h('img', { src: item.avatarSrc, alt: item.label })
      } else if (item.avatarLabel && !item.icon) {
        slots.avatar = () => item.avatarLabel
      }
      if (item.icon && !item.avatarSrc) {
        slots.icon = () =>
          createIconVNode(iconClass(item.icon) ?? item.icon!)
      }

      return h(
        NTag,
        {
          key: String(item.value ?? index),
          type: naiveChipType(item.colorRole),
          bordered: item.outlined === true,
          disabled: item.disabled,
          closable: removable && !item.disabled,
          checkable,
          checked: chipIsSelected(props, item, index),
          class: [...chipItemModifierClasses(item)].flat(),
          onClick: () => {
            if (item.disabled) return
            props.onClick?.(item, index)
          },
          'onUpdate:checked': () => {
            if (!checkable || item.disabled) return
            emitChipsChange(props, toggleChipSelection(props, item, index))
          },
          onClose: () => props.onRemove?.(item, index),
        },
        slots,
      )
    }),
  )
}

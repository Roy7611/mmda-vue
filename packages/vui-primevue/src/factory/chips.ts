import { h } from "vue";
import Chip from "primevue/chip";
import type { IconResolver, UiChipsProps } from "@mmda/vui";
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
  toggleChipSelection,
} from "@mmda/vui";

export function createChips(
  props: UiChipsProps,
  resolveIcon?: IconResolver,
) {
  const items = chipsItemsOf(props);
  const kind = chipsKindOf(props);
  const removable = isChipsRemovable(props);
  const clickable = kind === "choice" || kind === "filter";
  const iconClass = (name?: string) =>
    name ? (resolveIcon ? resolveIcon(name) : name) : undefined;

  return h(
    "div",
    {
      ...htmlAttributesOf(props),
      class: [...chipsModifierClasses(props)].flat(),
    },
    items.map((item, index) => {
      const selected = chipIsSelected(props, item, index);
      const leadingIcon = !item.avatarSrc ? iconClass(item.icon) : undefined;
      const trailing = item.trailingIcon
        ? createIconVNode(iconClass(item.trailingIcon) ?? item.trailingIcon)
        : null;
      const letter =
        !item.avatarSrc && !item.icon && item.avatarLabel
          ? h("span", { class: "mmda-chips__avatar" }, item.avatarLabel)
          : null;
      const children =
        letter || trailing
          ? [letter, item.label, trailing].filter(Boolean)
          : undefined;

      return h(
        Chip,
        {
          key: String(item.value ?? index),
          label: children ? undefined : item.label,
          image: item.avatarSrc,
          icon: leadingIcon,
          removable: removable && !item.disabled,
          disabled: item.disabled,
          class: [
            ...chipItemModifierClasses(item),
            selected ? "mmda-chips__item--selected" : undefined,
          ],
          onClick: () => {
            if (item.disabled) return;
            props.onClick?.(item, index);
            if (clickable) {
              emitChipsChange(props, toggleChipSelection(props, item, index));
            }
          },
          onRemove: () => props.onRemove?.(item, index),
        },
        children ? { default: () => children } : undefined,
      );
    }),
  );
}

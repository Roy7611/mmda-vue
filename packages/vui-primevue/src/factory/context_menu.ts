import { h } from "vue";
import ContextMenu from "primevue/contextmenu";
import type { UiContextMenuProps, UiMenuItem } from '@mmda/core'
import type { IconResolver } from '@mmda/vui'
import { contextMenuItemsOf, contextMenuModifierClasses, htmlAttributesOf, invokeContextMenuItem } from "@mmda/vui"

function mapPrimeItem(
  item: UiMenuItem,
  props: UiContextMenuProps,
  resolveIcon?: IconResolver,
): Record<string, unknown> {
  if (item.divider) return { separator: true };
  const icon = item.icon
    ? resolveIcon
      ? resolveIcon(item.icon)
      : item.icon
    : undefined;
  return {
    key: item.name ?? item.id ?? item.label,
    label: item.label,
    icon,
    disabled: item.disabled === true,
    command: () => invokeContextMenuItem(props, item),
    items: item.items?.map((child) => mapPrimeItem(child, props, resolveIcon)),
  };
}

export function createContextMenu(
  props: UiContextMenuProps,
  resolveIcon?: IconResolver,
) {
  const {
    items: _items,
    target,
    disabled,
    onSelect: _onSelect,
    onBeforeOpen: _onBeforeOpen,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const items = contextMenuItemsOf(props);

  return h(ContextMenu, {
    ...rest,
    ...htmlAttributesOf(props),
    model: items.map((item) => mapPrimeItem(item, props, resolveIcon)),
    target: disabled ? undefined : target,
    class: [...contextMenuModifierClasses(props)].flat(),
    onBeforeShow: (event: Event) => {
      const result = props.onBeforeOpen?.({ event });
      if (result === false || disabled) {
        (event as { preventDefault?: () => void }).preventDefault?.();
      }
    },
  });
}

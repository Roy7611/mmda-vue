import { h } from "vue";
import { ContextMenuComponent } from "@syncfusion/ej2-vue-navigations";
import type {
  IconResolver,
  UiContextMenuProps,
  UiMenuItem,
} from "@mmda/vui";
import {
  contextMenuItemsOf,
  contextMenuModifierClasses,
  findContextMenuItem,
  htmlAttributesOf,
  invokeContextMenuItem,
} from "@mmda/vui";

function mapSyncfusionItem(
  item: UiMenuItem,
  resolveIcon?: IconResolver,
): Record<string, unknown> {
  if (item.divider) return { separator: true };
  const iconCss = item.icon
    ? resolveIcon
      ? resolveIcon(item.icon)
      : item.icon
    : undefined;
  return {
    id: item.name ?? item.id ?? item.label,
    text: item.label,
    iconCss,
    disabled: item.disabled === true,
    items: item.items?.map((child) => mapSyncfusionItem(child, resolveIcon)),
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
  const cssClass = contextMenuModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(ContextMenuComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    items: items.map((item) => mapSyncfusionItem(item, resolveIcon)),
    target: disabled ? undefined : target,
    cssClass,
    select: (args: { item?: { id?: string; text?: string } }) => {
      const id = String(args?.item?.id ?? "");
      const text = String(args?.item?.text ?? "");
      const item = findContextMenuItem(
        items,
        (entry) =>
          entry.name === id ||
          entry.id === id ||
          entry.label === text,
      );
      if (item) invokeContextMenuItem(props, item);
    },
    beforeOpen: (args: { event?: Event; cancel?: boolean }) => {
      const result = props.onBeforeOpen?.({ event: args?.event });
      if (result === false || disabled) args.cancel = true;
    },
  });
}

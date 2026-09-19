import { h } from "vue";
import { ContextMenuComponent } from "@syncfusion/ej2-vue-navigations";
import type { UiContextMenuProps, UiMenuItem } from '@mmda/core'
import type { IconResolver } from '@mmda/vui'
import { contextMenuItemsOf, contextMenuModifierClasses, findContextMenuItem, invokeContextMenuItem } from "@mmda/vui"
import { uiRenderProps } from "@mmda/core"

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
    resolveItems: _resolveItems,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  let liveItems = contextMenuItemsOf(props);
  const cssClass = contextMenuModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(ContextMenuComponent as any, {
    ...rest,
    ...uiRenderProps(props).attributes,
    items: liveItems.map((item) => mapSyncfusionItem(item, resolveIcon)),
    target: disabled ? undefined : target,
    cssClass,
    select: (args: { item?: { id?: string; text?: string } }) => {
      const id = String(args?.item?.id ?? "");
      const text = String(args?.item?.text ?? "");
      const item = findContextMenuItem(
        liveItems,
        (entry) =>
          entry.name === id ||
          entry.id === id ||
          entry.label === text,
      );
      if (item) invokeContextMenuItem(props, item);
    },
    beforeOpen: (args: {
      event?: Event;
      cancel?: boolean;
      items?: unknown[];
    }) => {
      if (props.resolveItems) {
        const next = props.resolveItems({ event: args?.event });
        if (next === false || !next.length) {
          args.cancel = true;
          return;
        }
        liveItems = contextMenuItemsOf({ ...props, items: next });
        args.items = liveItems.map((item) =>
          mapSyncfusionItem(item, resolveIcon),
        );
      }
      const result = props.onBeforeOpen?.({ event: args?.event });
      if (result === false || disabled) args.cancel = true;
    },
  });
}

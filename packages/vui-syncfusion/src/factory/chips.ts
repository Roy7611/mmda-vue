import { h } from "vue";
import { ChipListComponent } from "@syncfusion/ej2-vue-buttons";
import type { IconResolver, UiChipItem, UiChipsProps } from "@mmda/vui"
import { chipValueOf, chipsItemsOf, chipsKindOf, chipsModifierClasses, chipsSelectedOf, emitChipsChange, htmlAttributesOf, isChipsRemovable, syncfusionChipCssClass, toggleChipSelection } from "@mmda/vui"

export function createChips(
  props: UiChipsProps,
  resolveIcon?: IconResolver,
) {
  const {
    items: _items,
    kind: _kind,
    selected: _selected,
    removable: _removable,
    disabled,
    colorRole: _colorRole,
    outlined: _outlined,
    onChange: _onChange,
    onClick: _onClick,
    onRemove: _onRemove,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;

  const items = chipsItemsOf(props);
  const kind = chipsKindOf(props);
  const iconCss = (name?: string) =>
    name ? (resolveIcon ? resolveIcon(name) : name) : undefined;

  const chips = items.map((item, index) => {
    const cssClass = syncfusionChipCssClass(item);
    const model: Record<string, unknown> = {
      text: item.label,
      value: chipValueOf(item, index),
      enabled: item.disabled ? false : true,
    };
    if (cssClass) model.cssClass = cssClass;
    if (item.avatarSrc) {
      model.leadingIconUrl = item.avatarSrc;
    } else if (item.icon) {
      model.leadingIconCss = iconCss(item.icon);
    } else if (item.avatarLabel) {
      model.avatarText = item.avatarLabel;
    }
    if (item.trailingIcon) model.trailingIconCss = iconCss(item.trailingIcon);
    return model;
  });

  const cssClass = chipsModifierClasses(props).flat().filter(Boolean).join(" ");
  const selected = chipsSelectedOf(props);
  const clickable = kind === "choice" || kind === "filter";

  return h(ChipListComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    chips,
    enabled: disabled ? false : true,
    cssClass,
    ...(kind === "choice" ? { selection: "Single" } : {}),
    ...(kind === "filter" ? { selection: "Multiple" } : {}),
    ...(selected != null ? { selectedChips: selected } : {}),
    ...(isChipsRemovable(props) ? { enableDelete: true } : {}),
    click: (args: { index?: number; text?: string }) => {
      const index = args?.index ?? 0;
      const item = items[index] as UiChipItem | undefined;
      if (!item) return;
      props.onClick?.(item, index);
      if (clickable) {
        emitChipsChange(props, toggleChipSelection(props, item, index));
      }
    },
    delete: (args: { index?: number }) => {
      const index = args?.index ?? 0;
      const item = items[index];
      if (item) props.onRemove?.(item, index);
    },
  });
}

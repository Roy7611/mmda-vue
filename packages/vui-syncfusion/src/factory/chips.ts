import { h } from "vue";
import { ChipListComponent } from "@syncfusion/ej2-vue-buttons";
import type { IconResolver, UiChipItem, UiChipsProps } from "@mmda/vui"
import {
  chipIsSelected,
  chipItemModifierClasses,
  chipsItemsOf,
  chipsKindOf,
  chipsModifierClasses,
  chipsSelectedOf,
  emitChipsChange,
  isChipsRemovable,
  toggleChipSelection
} from "@mmda/vui"
import { uiRenderProps } from "@mmda/core"

/** EJ2 click 的 index 会错位（点已启用却写成新）。先对文案，再对 cN，最后才信 index。 */
function chipIndexFromEvent(
  items: { label: string }[],
  args?: {
    index?: number;
    text?: string;
    data?: { text?: string; value?: unknown };
    value?: unknown;
  },
): number {
  const text = args?.text ?? args?.data?.text;
  if (text != null && String(text).length) {
    const byLabel = items.findIndex((item) => item.label === String(text));
    if (byLabel >= 0) return byLabel;
  }
  const raw = args?.data?.value ?? args?.value;
  if (typeof raw === "string" && /^c\d+$/.test(raw)) {
    const index = Number(raw.slice(1));
    if (items[index]) return index;
  }
  if (typeof args?.index === "number" && items[args.index]) return args.index;
  return -1;
}

/** EJ2 Chip cssClass：secondary 不加 e-。列表级 e-outline 挂在 ChipList 上，不写到单枚。 */
export function syncfusionChipCssClass(
  item: UiChipItem,
  listOutlined = false,
): string {
  const role =
    item.colorRole && item.colorRole !== "secondary"
      ? `e-${item.colorRole}`
      : undefined
  const outline = item.outlined && !listOutlined ? "e-outline" : undefined
  return [role, outline, ...chipItemModifierClasses(item)]
    .filter(Boolean)
    .join(" ")
}

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
    const cssClass = syncfusionChipCssClass(item, Boolean(props.outlined));
    const model: Record<string, unknown> = {
      text: item.label,
      value: `c${index}`,
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

  const cssClass = (
    props.outlined
      ? ["mmda-chips", "e-outline", props.class]
      : chipsModifierClasses(props).flat()
  )
    .filter(Boolean)
    .join(" ");
  const selected = chipsSelectedOf(props);
  const selectedChips = items
    .map((item, index) => (chipIsSelected(props, item, index) ? index : -1))
    .filter((index) => index >= 0);
  const clickable = kind === "choice" || kind === "filter";
  const selectable = selected != null || clickable;

  return h(ChipListComponent as any, {
    ...rest,
    ...uiRenderProps(props).attributes,
    key: selectable ? selectedChips.join(",") : undefined,
    chips,
    enabled: disabled ? false : true,
    cssClass,
    ...(kind === "choice" ? { selection: "Single" } : {}),
    ...(kind === "filter" || (selected != null && kind !== "choice")
      ? { selection: "Multiple" }
      : {}),
    ...(selected != null ? { selectedChips } : {}),
    ...(isChipsRemovable(props) ? { enableDelete: true } : {}),
    click: (args: {
      index?: number;
      text?: string;
      data?: { text?: string; value?: unknown };
      value?: unknown;
    }) => {
      const index = chipIndexFromEvent(items, args);
      const item = items[index] as UiChipItem | undefined;
      if (!item) return;
      props.onClick?.(item, index);
      if (clickable) {
        emitChipsChange(props, toggleChipSelection(props, item, index));
      }
    },
    delete: (args: { index?: number; text?: string }) => {
      const index = chipIndexFromEvent(items, args);
      const item = items[index];
      if (item) props.onRemove?.(item, index);
    },
  });
}

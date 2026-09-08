import { h } from "vue";
import Toolbar from "primevue/toolbar";
import type { UiToolbarProps, UiToolbarSlots, UiToolbarSlotName } from "@mmda/vui";
import {
  htmlAttributesOf,
  toolbarHasCenter,
  toolbarModifierClasses,
  toolbarSlotModifierClasses,
  toolbarSlotStyle,
  toolbarSlotContent,
} from "@mmda/vui";

function wrap(
  props: UiToolbarProps,
  slots: UiToolbarSlots | undefined,
  slot: UiToolbarSlotName,
) {
  return h(
    "div",
    {
      class: toolbarSlotModifierClasses(props, slot),
      style: toolbarSlotStyle(props, slot),
    },
    toolbarSlotContent(slots, slot) as any,
  );
}

export function createToolbar(props: UiToolbarProps, slots?: UiToolbarSlots) {
  const {
    align: _align,
    layout: _layout,
    htmlAttributes,
    class: _className,
    ...rest
  } = props;
  return h(
    Toolbar,
    {
      ...rest,
      ...htmlAttributesOf(props),
      class: toolbarModifierClasses(props, slots),
    },
    {
      start: () => wrap(props, slots, "start"),
      center: toolbarHasCenter(slots)
        ? () => wrap(props, slots, "center")
        : undefined,
      end: () => wrap(props, slots, "end"),
    },
  );
}

import { h } from "vue";
import {
  ItemDirective,
  ItemsDirective,
  ToolbarComponent,
} from "@syncfusion/ej2-vue-navigations";
import type { UiToolbarProps, UiToolbarSlotName, UiToolbarSlots } from "@mmda/vui"
import { toolbarModifierClasses, toolbarRegionsOf } from "@mmda/vui"
import { uiRenderProps, uiClassName } from "@mmda/core"

const ALIGN: Record<UiToolbarSlotName, "Left" | "Center" | "Right"> = {
  start: "Left",
  center: "Center",
  end: "Right",
}

function overflowModeOf(overflow?: UiToolbarProps["overflow"]): string {
  if (overflow === "scroll") return "Scrollable";
  if (overflow === "none") return "Extended";
  if (overflow === "multirow") return "MultiRow";
  return "Popup";
}

export function createToolbar(props: UiToolbarProps = {}, slots?: UiToolbarSlots) {
  const { overflow, disabled, htmlAttributes, class: _className, ...rest } = props;
  const regions = toolbarRegionsOf(slots);
  const names: UiToolbarSlotName[] = ["start", "center", "end"];
  const items = names.flatMap((name) => {
    const content = regions[name];
    if (typeof content !== "function") return [];
    return [
      h(
        ItemDirective as any,
        { type: "Input", align: ALIGN[name] },
        { template: () => content() },
      ),
    ];
  });
  return h(
    ToolbarComponent as any,
    {
      ...rest,
      ...uiRenderProps(props).attributes,
      ...(disabled ? { "aria-disabled": "true" } : {}),
      width: "100%",
      overflowMode: overflowModeOf(overflow),
      cssClass: uiClassName(toolbarModifierClasses(props)),
    },
    {
      default: () =>
        h(ItemsDirective as any, null, {
          default: () => items,
        }),
    },
  );
}

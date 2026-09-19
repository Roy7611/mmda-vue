import { h } from "vue";
import Toolbar from "primevue/toolbar";
import type { UiToolbarProps, UiToolbarSlots } from "@mmda/vui"
import { toolbarModifierClasses, toolbarRegionsOf } from "@mmda/vui"
import { uiRenderProps } from "@mmda/core"

export function createToolbar(props: UiToolbarProps = {}, slots?: UiToolbarSlots) {
  const { overflow: _overflow, disabled, htmlAttributes, class: _className, ...rest } = props;
  const regions = toolbarRegionsOf(slots);
  const children: Record<string, () => unknown> = {};
  if (regions.start) children.start = regions.start;
  if (regions.center) children.center = regions.center;
  if (regions.end) children.end = regions.end;
  return h(
    Toolbar,
    {
      ...rest,
      ...uiRenderProps(props).attributes,
      ...(disabled ? { "aria-disabled": "true" } : {}),
      class: toolbarModifierClasses(props),
    },
    children,
  );
}

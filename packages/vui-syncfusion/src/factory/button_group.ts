import { h, type VNode } from "vue";
import type { UiButtonGroupProps } from "@mmda/core"
export function createButtonGroup(
  children: () => VNode[],
  props: UiButtonGroupProps = {},
) {
  const {
    htmlAttributes,
    class: className,
    orientation,
    ...rest
  } = props;
  return h(
    "div",
    {
      ...rest,
      ...htmlAttributes,
      class: [
        "e-btn-group",
        orientation === "vertical" ? "e-vertical" : "",
        "mmda-button-group",
        "mmda-sf-button-group",
        className,
      ].filter(Boolean),
    },
    children().filter(Boolean),
  );
}

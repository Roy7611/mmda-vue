import { h, type VNode } from "vue";
import ButtonGroup from "primevue/buttongroup";
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
    ButtonGroup,
    {
      ...rest,
      ...htmlAttributes,
      class: [
        "mmda-button-group",
        "mmda-button-group",
        orientation === "vertical" ? "mmda-button-group--vertical" : "",
        className,
      ].filter(Boolean),
    },
    {
      default: () => children().filter(Boolean),
    },
  );
}

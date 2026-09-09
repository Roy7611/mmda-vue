import { h } from "vue";
import Divider from "primevue/divider";
import type { UiDividerProps } from "@mmda/vui"
import { dividerModifierClasses } from "@mmda/vui"

export function createDivider(props: UiDividerProps = {}) {
  const {
    orientation,
    label,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;
  return h(
    Divider,
    {
      ...rest,
      ...htmlAttributes,
      layout: orientation === "vertical" ? "vertical" : "horizontal",
      class: dividerModifierClasses(props),
    },
    label ? { default: () => label } : undefined,
  );
}

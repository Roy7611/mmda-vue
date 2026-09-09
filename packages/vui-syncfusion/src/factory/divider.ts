import { h } from "vue";
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
  const vertical = orientation === "vertical";
  return h(
    "div",
    {
      ...rest,
      ...htmlAttributes,
      role: "separator",
      "aria-orientation": vertical ? "vertical" : "horizontal",
      class: ["e-separator", dividerModifierClasses(props)],
    },
    label ? h("span", { class: "mmda-divider__label" }, label) : undefined,
  );
}

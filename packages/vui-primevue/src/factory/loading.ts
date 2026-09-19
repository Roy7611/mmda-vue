import { h } from "vue";
import ProgressSpinner from "primevue/progressspinner";
import type { UiLoadingProps } from "@mmda/vui"
import { loadingLabelOf, loadingModifierClasses, loadingWidthOf } from "@mmda/vui"
import { uiRenderProps } from "@mmda/core"

export function createLoading(props: UiLoadingProps = {}) {
  const {
    label: _label,
    size: _size,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  const width = loadingWidthOf(props);
  const label = loadingLabelOf(props);

  return h(
    "div",
    {
      ...rest,
      ...uiRenderProps(props).attributes,
      class: loadingModifierClasses(props).flat(),
      role: "status",
      "aria-busy": "true",
    },
    [
      h(ProgressSpinner as any, {
        strokeWidth: "4",
        style: { width: `${width}px`, height: `${width}px` },
      }),
      label ? h("span", { class: "mmda-loading__label" }, label) : null,
    ],
  );
}

import { h } from "vue";
import { SfLoadingHost } from "../components/SfLoadingHost";
import type { UiLoadingProps } from "@mmda/vui"
import { loadingLabelOf, loadingModifierClasses, loadingSizeOf } from "@mmda/vui"
import { uiRenderProps } from "@mmda/core"

export function createLoading(props: UiLoadingProps = {}) {
  const {
    label: _label,
    size: _size,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  return h(SfLoadingHost as any, {
    ...rest,
    ...uiRenderProps(props).attributes,
    class: loadingModifierClasses(props),
    loading: true,
    label: loadingLabelOf(props),
    size: loadingSizeOf(props),
  });
}

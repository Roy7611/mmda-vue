import { h } from "vue";
import { SfLoadingHost } from "../components/SfLoadingHost";
import type { UiLoadingProps } from "@mmda/vui";
import {
  htmlAttributesOf,
  loadingLabelOf,
  loadingModifierClasses,
  loadingSizeOf,
} from "@mmda/vui";

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
    ...htmlAttributesOf(props),
    class: loadingModifierClasses(props),
    loading: true,
    label: loadingLabelOf(props),
    size: loadingSizeOf(props),
  });
}

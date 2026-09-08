import { h } from "vue";
import Skeleton from "primevue/skeleton";
import type { UiSkeletonProps } from "@mmda/vui";
import { skeletonModifierClasses } from "@mmda/vui";

export function createSkeleton(props: UiSkeletonProps = {}) {
  const {
    shape,
    width,
    height,
    shimmer,
    visible,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  if (visible === false) {
    return h("span", {
      class: skeletonModifierClasses(props),
      style: { display: "none" },
    });
  }

  return h(Skeleton, {
    ...rest,
    ...htmlAttributes,
    shape: shape === "circle" ? "circle" : "rectangle",
    width,
    height,
    animation: shimmer === "none" ? "none" : "wave",
    class: skeletonModifierClasses(props),
  });
}

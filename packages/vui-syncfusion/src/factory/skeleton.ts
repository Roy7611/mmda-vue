import { h } from "vue";
import { SkeletonComponent } from "@syncfusion/ej2-vue-notifications";
import type { UiSkeletonProps, UiSkeletonShape, UiSkeletonShimmer } from "@mmda/vui";
import { htmlAttributesOf, skeletonModifierClasses } from "@mmda/vui";

const ej2Shape = (shape?: UiSkeletonShape) => {
  if (shape === "circle") return "Circle";
  if (shape === "square") return "Square";
  if (shape === "rectangle") return "Rectangle";
  return "Text";
};

const ej2Shimmer = (shimmer?: UiSkeletonShimmer) => {
  if (shimmer === "pulse") return "Pulse";
  if (shimmer === "fade") return "Fade";
  if (shimmer === "none") return "None";
  return "Wave";
};

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

  const cssClass = skeletonModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(SkeletonComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    shape: ej2Shape(shape),
    width,
    height,
    shimmerEffect: ej2Shimmer(shimmer),
    visible: visible !== false,
    cssClass,
    htmlAttributes,
  });
}

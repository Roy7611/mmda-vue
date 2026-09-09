import { h } from "vue";
import type { UiBadgeColor, UiBadgeProps, UiBadgeShape } from "@mmda/vui"
import { badgeModifierClasses } from "@mmda/vui"

const COLOR_CLASS: Record<UiBadgeColor, string> = {
  primary: "e-badge-primary",
  secondary: "e-badge-secondary",
  success: "e-badge-success",
  info: "e-badge-info",
  warning: "e-badge-warning",
  danger: "e-badge-danger",
  light: "e-badge-light",
  dark: "e-badge-dark",
};

const SHAPE_CLASS: Record<UiBadgeShape, string> = {
  default: "",
  circle: "e-badge-circle",
  pill: "e-badge-pill",
  dot: "e-badge-dot",
};

export function createBadge(props: UiBadgeProps) {
  const {
    value,
    colorRole,
    shape = "default",
    overlay,
    position,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;
  const overlayish = overlay === true;
  return h(
    "span",
    {
      ...rest,
      ...htmlAttributes,
      class: [
        "e-badge",
        colorRole ? COLOR_CLASS[colorRole] : "",
        SHAPE_CLASS[shape],
        overlayish ? "e-badge-notification e-badge-overlap" : "",
        overlayish && (position === "bottomRight" || position === "bottomLeft")
          ? "e-badge-bottom"
          : "",
        "mmda-badge",
        badgeModifierClasses(props),
      ],
    },
    shape === "dot" || value == null ? undefined : String(value),
  );
}

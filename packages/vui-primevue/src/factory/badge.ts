import { h } from "vue";
import Badge from "primevue/badge";
import type { UiBadgeProps } from "@mmda/vui";
import { badgeModifierClasses } from "@mmda/vui";

const primeSeverity = (role?: string) => {
  const roles: Record<string, string | undefined> = {
    primary: undefined,
    secondary: "secondary",
    success: "success",
    info: "info",
    warning: "warn",
    danger: "danger",
    light: "secondary",
    dark: "contrast",
  };
  return role ? roles[role] : undefined;
};

export function createBadge(props: UiBadgeProps) {
  const {
    value,
    colorRole,
    shape,
    overlay: _overlay,
    position: _position,
    class: _class,
    htmlAttributes,
    ...rest
  } = props;
  return h(Badge, {
    ...rest,
    ...htmlAttributes,
    value: shape === "dot" ? undefined : value,
    severity: primeSeverity(colorRole),
    class: ["mmda-badge", badgeModifierClasses(props)],
  });
}

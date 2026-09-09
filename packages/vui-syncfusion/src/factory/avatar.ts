import { h } from "vue";
import type { IconResolver, UiAvatarProps, UiAvatarSize } from "@mmda/vui"
import { avatarModifierClasses, createIconVNode, uiCssClass } from "@mmda/vui"

const SIZE_CLASS: Record<UiAvatarSize, string> = {
  xsmall: "e-avatar-xsmall",
  small: "e-avatar-small",
  medium: "",
  large: "e-avatar-large",
  xlarge: "e-avatar-xlarge",
};

export function createAvatar(props: UiAvatarProps, resolveIcon: IconResolver) {
  const {
    src,
    icon,
    label,
    shape = "circle",
    size = "medium",
    colorRole: _colorRole,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;
  const child = src
    ? h("img", { src, alt: label ?? "" })
    : icon
      ? createIconVNode(resolveIcon(icon))
      : label;
  return h(
    "span",
    {
      ...rest,
      ...htmlAttributes,
      class: [
        "e-avatar",
        uiCssClass("avatar"),
        shape === "circle" ? "e-avatar-circle" : "",
        SIZE_CLASS[size],
        avatarModifierClasses(props),
      ],
    },
    child,
  );
}

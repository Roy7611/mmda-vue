import { h } from "vue";
import Avatar from "primevue/avatar";
import type { IconResolver, UiAvatarProps, UiAvatarSize } from "@mmda/vui"
import { avatarModifierClasses, uiCssClass } from "@mmda/vui"

const primeSize = (size?: UiAvatarSize) => {
  if (size === "large" || size === "xlarge") return size;
  return undefined;
};

export function createAvatar(props: UiAvatarProps, resolveIcon: IconResolver) {
  const {
    src,
    icon,
    label,
    shape = "circle",
    size = "medium",
    colorRole: _colorRole,
    class: _class,
    htmlAttributes,
    ...rest
  } = props;
  return h(Avatar, {
    ...rest,
    ...htmlAttributes,
    image: src,
    icon: !src && icon ? resolveIcon(icon) : undefined,
    label: !src && !icon ? label : undefined,
    shape: shape === "circle" ? "circle" : "square",
    size: primeSize(size),
    class: [uiCssClass("avatar"), avatarModifierClasses(props)],
  });
}

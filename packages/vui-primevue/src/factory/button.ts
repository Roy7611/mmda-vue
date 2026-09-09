import { h } from "vue";
import Button from "primevue/button";
import type { UiButtonProps, UiButtonSlots } from "@mmda/core"
import { buttonModifierClasses } from "@mmda/core"
const severity = (role?: string) => {
  const roles: Record<string, string> = {
    primary: "primary",
    secondary: "secondary",
    success: "success",
    info: "info",
    warning: "warn",
    warn: "warn",
    danger: "danger",
    error: "danger",
    contrast: "contrast",
  };
  return role ? roles[role] : undefined;
};

export function createButton(props: UiButtonProps = {}, slots?: UiButtonSlots) {
  const {
    htmlAttributes,
    class: className,
    label,
    icon,
    tooltip,
    buttonType,
    shape,
    colorRole,
    disabled,
    type,
    size,
    loading,
    onClick,
    onAction,
    command,
    ...rest
  } = props;
  return h(
    Button as any,
    {
      ...rest,
      ...htmlAttributes,
      type: type ?? "button",
      label,
      icon,
      severity: severity(
        colorRole ??
          (props as { severity?: string }).severity ??
          (buttonType === "tonal" ? "secondary" : undefined),
      ),
      variant:
        buttonType === "outlined"
          ? "outlined"
          : buttonType === "text" || buttonType === "link"
            ? "text"
            : undefined,
      rounded: shape === "round" || shape === "circle",
      disabled: disabled === true,
      loading,
      title: tooltip ?? htmlAttributes?.title,
      size,
      class: buttonModifierClasses(props),
      onClick: onClick ?? onAction ?? command,
    },
    slots,
  );
}

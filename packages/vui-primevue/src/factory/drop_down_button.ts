import { h } from "vue";
import SplitButton from "primevue/splitbutton";
import type { UiAction, UiDropDownButtonProps, UiSlots } from "@mmda/vui"

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

const menuModel = (action: UiAction): Record<string, unknown> => {
  if (action.divider) return { separator: true };
  return {
    label: action.label ?? action.name,
    icon: action.icon,
    disabled: action.disabled === true,
    command: action.onAction,
    items: action.items?.map((child) => menuModel(child)),
  };
};

export function createDropDownButton(
  props: UiDropDownButtonProps,
  actions: UiAction[],
  slots?: UiSlots,
) {
  const hideCaret =
    props.hideCaret === true ||
    props.shape === "circle" ||
    (!props.label && Boolean(props.icon));
  const isText = hideCaret || props.buttonType === "text";
  return h(
    SplitButton as any,
    {
      ...props,
      label: hideCaret ? undefined : props.label,
      icon: hideCaret ? undefined : props.icon,
      dropdownIcon: hideCaret ? props.icon : props.dropdownIcon,
      rounded:
        hideCaret || props.shape === "circle" || props.shape === "round",
      text: isText,
      outlined: props.buttonType === "outlined",
      severity: severity(
        props.colorRole ??
          (props as { severity?: string }).severity ??
          (props.buttonType === "tonal" ? "secondary" : undefined),
      ),
      class: [
        props.class,
        hideCaret ? "mmda-menu-button--icon-only" : "",
        props.buttonType === "tonal" ? "mmda-btn-tonal" : "",
      ]
        .flat()
        .filter(Boolean)
        .join(" "),
      model: actions.map((action) => menuModel(action)),
      onClick: props.onAction,
    },
    slots,
  );
}

export function createMoreMenuButton(
  props: UiDropDownButtonProps,
  actions: UiAction[],
  slots?: UiSlots,
) {
  return createDropDownButton(
    {
      ...props,
      class: ["mmda-more-menu-button", props.class],
    },
    actions,
    slots,
  );
}

import { h } from "vue";
import { ButtonComponent } from "@syncfusion/ej2-vue-buttons";
import type { UiButtonProps, UiButtonSlots } from "@mmda/core"
import { buttonModifierClasses } from "@mmda/core"
import {
  buttonRoleClass,
  buttonSurfaceClass,
  flushAllInplaceEdits,
} from "./utils";

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
    id,
    onClick,
    onAction,
    command,
    ...rest
  } = props;
  const handleClick = onClick ?? onAction ?? command;
  return h(
    ButtonComponent as any,
    {
      ...rest,
      id: id ?? htmlAttributes?.id,
      content:
        label ??
        (typeof slots?.default === "function" ? undefined : (rest as { content?: string }).content),
      iconCss: icon,
      cssClass: [
        buttonRoleClass(props),
        buttonSurfaceClass(buttonType),
        shape === "round" || shape === "circle" ? "e-round" : "",
        buttonModifierClasses(props),
      ]
        .flat()
        .filter(Boolean)
        .join(" "),
      disabled: disabled === true,
      isPrimary: (colorRole ?? (props as { severity?: string }).severity) === "primary",
      title: tooltip ?? htmlAttributes?.title,
      type: type ?? htmlAttributes?.type ?? "button",
      htmlAttributes,
      "aria-label":
        htmlAttributes?.["aria-label"] ?? tooltip,
      onClick: (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        flushAllInplaceEdits();
        handleClick?.(event as never);
      },
    },
    slots,
  );
}

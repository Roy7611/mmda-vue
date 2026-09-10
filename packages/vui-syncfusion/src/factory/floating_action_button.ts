import { h } from "vue";
import { FabComponent } from "@syncfusion/ej2-vue-buttons";
import { buttonModifierClasses, type UiButtonSlots } from "@mmda/core"
import {
  fabModifierClasses,
  type UiFabPosition,
  type UiFloatingActionButtonProps,
} from "@mmda/vui"
import { buttonRoleClass, buttonSurfaceClass } from "./utils";

const EJ2_POSITION: Record<UiFabPosition, string> = {
  topLeft: "TopLeft",
  topCenter: "TopCenter",
  topRight: "TopRight",
  middleLeft: "MiddleLeft",
  middleCenter: "MiddleCenter",
  middleRight: "MiddleRight",
  bottomLeft: "BottomLeft",
  bottomCenter: "BottomCenter",
  bottomRight: "BottomRight",
};

export function createFloatingActionButton(
  props: UiFloatingActionButtonProps = {},
  slots?: UiButtonSlots,
) {
  const {
    htmlAttributes,
    class: className,
    label,
    icon,
    tooltip,
    buttonType,
    colorRole,
    disabled,
    position,
    target,
    iconPosition,
    onClick,
    onAction,
    command,
    size,
    ...rest
  } = props;
  const pos = position ?? "bottomRight";
  const role = colorRole ?? "primary";
  return h(
    FabComponent as any,
    {
      ...rest,
      ...htmlAttributes,
      content: label,
      iconCss: icon,
      iconPosition: iconPosition === "right" ? "Right" : "Left",
      position: EJ2_POSITION[pos],
      target,
      cssClass: [
        buttonRoleClass({ ...props, colorRole: role }),
        buttonSurfaceClass(buttonType),
        size === "small" ? "e-small" : "",
        buttonModifierClasses({ ...props, colorRole: role }),
        fabModifierClasses({ ...props, position: pos, colorRole: role }),
      ]
        .flat()
        .filter(Boolean)
        .join(" "),
      disabled: disabled === true,
      title: tooltip ?? htmlAttributes?.title,
      htmlAttributes,
      onClick: onClick ?? onAction ?? command,
    },
    slots,
  );
}

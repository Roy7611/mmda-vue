import { h } from "vue";
import type {
  UiButtonSlots,
  UiFloatingActionButtonProps,
} from "@mmda/vui";
import { fabModifierClasses } from "@mmda/vui";
import { createButton } from "./button";

export function createFloatingActionButton(
  props: UiFloatingActionButtonProps = {},
  slots?: UiButtonSlots,
) {
  const { position, target, iconPosition, class: className, ...buttonProps } =
    props;
  const pos = position ?? "bottomRight";
  return createButton(
    {
      ...buttonProps,
      colorRole: buttonProps.colorRole ?? "primary",
      shape: "circle",
      class: [
        "mmda-prime-fab",
        fabModifierClasses({ ...props, position: pos }),
      ],
      htmlAttributes: {
        ...buttonProps.htmlAttributes,
        "data-mmda-fab-target": target,
        "data-mmda-fab-icon-position": iconPosition,
      },
    },
    slots,
  );
}

import type { VNode } from "vue";
import type { UiButtonSlots } from "@mmda/core"
import type { UiFloatingActionButtonProps } from "@mmda/vui"
import { fabModifierClasses } from "@mmda/vui"
import { createButton } from "./button";

export function createFloatingActionButton(
  props: UiFloatingActionButtonProps = {},
  slots?: UiButtonSlots & { icon?: () => VNode },
  resolveIcon: (icon: string) => string = (icon) => icon,
) {
  const { position, target, iconPosition, ...buttonProps } = props;
  const pos = position ?? "bottomRight";
  return createButton(
    {
      ...buttonProps,
      colorRole: buttonProps.colorRole ?? "primary",
      shape: "circle",
      class: [
        "mmda-agnaive-fab",
        fabModifierClasses({ ...props, position: pos }),
      ],
      htmlAttributes: {
        ...buttonProps.htmlAttributes,
        ...(target ? { "data-mmda-fab-target": target } : {}),
        ...(iconPosition
          ? { "data-mmda-fab-icon-position": iconPosition }
          : {}),
      },
    },
    slots,
    resolveIcon,
  );
}

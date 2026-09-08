import { h } from "vue";
import { DropDownButtonComponent } from "@syncfusion/ej2-vue-splitbuttons";
import type {
  UiAction,
  UiDropDownButtonProps,
  UiSlots,
} from "@mmda/vui";
import { SfDropupMenuButton } from "../components/SfDropupMenuButton";
import {
  buttonRoleClass,
  buttonSurfaceClass,
  findAction,
  normalizeAction,
} from "./utils";

export function createDropDownButton(
  props: UiDropDownButtonProps,
  actions: UiAction[],
  slots?: UiSlots,
) {
  const hideCaret =
    props.hideCaret === true ||
    props.shape === "circle" ||
    (!props.label && Boolean(props.icon));
  const placement = String(props.popupPlacement ?? "");
  const openUp = placement === "top" || placement === "top-end";
  const cssClass = [
    buttonRoleClass(props),
    buttonSurfaceClass(props.buttonType),
    props.shape === "round" || props.shape === "circle" ? "e-round" : "",
    hideCaret ? "e-caret-hide" : "",
    props.class,
  ]
    .flat()
    .filter(Boolean)
    .join(" ");

  if (openUp) {
    return h(SfDropupMenuButton, {
      label: props.label,
      icon: props.icon,
      cssClass,
      title: props.tooltip,
      ariaLabel: props["aria-label"] ?? props.tooltip,
      hideCaret,
      placement: placement === "top" ? "top" : "top-end",
      items: actions.map((action) => ({
        id: action.name,
        label: action.label ?? action.name,
        icon: action.icon,
        disabled: action.disabled === true || action.disabled === "true",
        divider: action.divider === true,
        onAction: action.onAction,
        command: action.command,
      })),
    });
  }

  return h(
    DropDownButtonComponent as any,
    {
      content: props.label,
      iconCss: props.icon,
      cssClass,
      title: props.tooltip,
      items: actions.map((action) => normalizeAction(action)),
      select: (args: any) => {
        const found = findAction(actions, args.item?.id ?? args.item?.text);
        found?.onAction?.();
        found?.command?.();
        if (!found && args.item?.text) {
          const byLabel = actions
            .flatMap((a) => [a, ...(a.items ?? [])])
            .find((a) => a.label === args.item.text);
          byLabel?.onAction?.();
          byLabel?.command?.();
        }
      },
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

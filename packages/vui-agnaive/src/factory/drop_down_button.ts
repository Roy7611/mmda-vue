import { h } from "vue";
import { NDropdown } from "naive-ui";
import type { UiAction, UiDropDownButtonProps, UiSlots } from "@mmda/vui"
import { createIconVNode } from "@mmda/vui"
import { createButton } from "./button";

const dropdownOptions = (actions: UiAction[]): unknown[] =>
  actions.map((action) => {
    if (action.divider)
      return { type: "divider" as const, key: `div-${action.name}` };
    return {
      label: action.label ?? action.name,
      key: String(action.name ?? action.label),
      disabled: action.disabled === true,
      icon: action.icon
        ? () => createIconVNode(action.icon as string)
        : undefined,
      children: action.items?.length
        ? dropdownOptions(action.items)
        : undefined,
    };
  });

const findAction = (actions: UiAction[], key: string): UiAction | undefined => {
  for (const action of actions) {
    if ((action.name ?? action.label) === key) return action;
    if (action.items?.length) {
      const nested = findAction(action.items, key);
      if (nested) return nested;
    }
  }
  return undefined;
};

export function createDropDownButton(
  props: UiDropDownButtonProps,
  actions: UiAction[],
  slots?: UiSlots,
  button: typeof createButton = createButton,
) {
  const hideCaret =
    props.hideCaret === true ||
    props.shape === "circle" ||
    (!props.label && Boolean(props.icon));
  return h(
    NDropdown as any,
    {
      trigger: "click",
      options: dropdownOptions(actions),
      label: props.label,
      class: props.class,
      onSelect: (key: string) => {
        const action = findAction(actions, key);
        action?.onAction?.();
      },
    },
    {
      default: () =>
        button(
          {
            ...props,
            label: hideCaret ? undefined : props.label,
            shape: hideCaret ? "circle" : props.shape,
            buttonType: props.buttonType ?? (hideCaret ? "text" : undefined),
            colorRole:
              props.colorRole ??
              (props.buttonType === "tonal" ? "secondary" : undefined),
            class: [
              props.class,
              hideCaret ? "mmda-menu-button--icon-only" : "",
              props.buttonType === "tonal" ? "mmda-btn-tonal" : "",
            ]
              .flat()
              .filter(Boolean)
              .join(" "),
          },
          slots as any,
        ),
    },
  );
}

export function createMoreMenuButton(
  props: UiDropDownButtonProps,
  actions: UiAction[],
  slots?: UiSlots,
  button: typeof createButton = createButton,
) {
  return createDropDownButton(
    {
      ...props,
      class: ["mmda-more-menu-button", props.class],
    },
    actions,
    slots,
    button,
  );
}

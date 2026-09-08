import { h } from "vue";
import SplitButton from "primevue/splitbutton";
import type { UiAction, UiSlots, UiSplitButtonProps } from "@mmda/vui";

const menuModel = (action: UiAction): Record<string, unknown> => {
  if (action.divider) return { separator: true };
  return {
    label: action.label ?? action.name,
    icon: action.icon,
    disabled: action.disabled === true || action.disabled === "true",
    command: action.onAction ?? action.command,
    items: action.items?.map((child) => menuModel(child)),
  };
};

export function createSplitButton(
  props: UiSplitButtonProps,
  slots?: UiSlots,
) {
  return h(
    SplitButton as any,
    {
      ...props,
      model: (props.actions ?? []).map((action) => menuModel(action)),
      onClick: props.onAction ?? props.command,
    },
    slots,
  );
}

import type { UiSlots, UiSplitButtonProps } from "@mmda/vui"
import { createButton } from "./button";
import { createDropDownButton } from "./drop_down_button";

/** Naive 无原生 SplitButton，降级为整钮下拉。 */
export function createSplitButton(
  props: UiSplitButtonProps,
  slots?: UiSlots,
  button: typeof createButton = createButton,
) {
  return createDropDownButton(
    { ...props, label: props.label, icon: props.icon },
    props.actions ?? [],
    slots,
    button,
  );
}

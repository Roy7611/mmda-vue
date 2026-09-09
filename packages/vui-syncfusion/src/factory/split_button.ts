import { h } from "vue";
import { SplitButtonComponent } from "@syncfusion/ej2-vue-splitbuttons";
import type { UiSlots, UiSplitButtonProps } from "@mmda/vui"
import {
  findAction,
  normalizeAction,
  splitButtonRoleClass,
  splitButtonSurfaceClass,
} from "./utils";

export function createSplitButton(
  props: UiSplitButtonProps,
  slots?: UiSlots,
) {
  return h(
    SplitButtonComponent as any,
    {
      content: props.label,
      iconCss: props.icon,
      disabled: props.disabled === true,
      cssClass: [
        splitButtonRoleClass(props),
        splitButtonSurfaceClass(props.buttonType),
        props.class,
      ]
        .filter(Boolean)
        .join(" "),
      items: (props.actions ?? []).map((action) => normalizeAction(action)),
      select: (args: any) => {
        const found = findAction(
          props.actions ?? [],
          args.item?.id ?? args.item?.text,
        );
        found?.onAction?.();
      },
      onClick: props.onAction,
    },
    slots,
  );
}

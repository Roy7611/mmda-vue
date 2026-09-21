import { normalizeAction } from "./utils";
import { createButton } from "./button";
import { createButtonGroup } from "./button_group";
import { createSelectButtonGroup } from "./select_button_group";
import {
  createDropDownButton,
  createMoreMenuButton,
} from "./drop_down_button";
import { createSplitButton } from "./split_button";
import { createFloatingActionButton } from "./floating_action_button";
import { resolveActionButtonIcon } from "@mmda/vui";

export { createButton } from "./button";

export function buttonRenderers(
  factory: {
    resolveIcon: (icon: string) => string
    actionIcons?: Record<string, string>
  },
  button = createButton,
) {
  return {
    button,
    buttonGroup: (props: any = {}, slots: any) =>
      createButtonGroup(slots?.default ?? (() => []), props),
    selectButtonGroup: (props: any) =>
      createSelectButtonGroup(props.modelValue, props, factory.resolveIcon),
    splitButton: createSplitButton,
    dropDownButton: (props: any, slots: any) =>
      createDropDownButton(props, props.actions ?? [], slots),
    moreMenuButton: (props: any, slots: any) =>
      createMoreMenuButton(props, props.actions ?? [], slots),
    floatingActionButton: createFloatingActionButton,
    actionButton: (action: any, t: any, _resolve: any, props: any) =>
      button({
        ...action,
        ...normalizeAction(action, t),
        label: normalizeAction(action, t).text,
        ...props,
        colorRole: props?.colorRole ?? action.colorRole,
        icon: resolveActionButtonIcon(
          factory.resolveIcon,
          factory.actionIcons,
          action,
        ),
        onClick: action.onAction,
      }),
  };
}

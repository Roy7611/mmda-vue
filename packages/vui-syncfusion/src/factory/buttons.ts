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

export { createButton } from "./button";

export function buttonRenderers(
  factory: { resolveIcon: (icon: string) => string },
  button = createButton,
) {
  return {
    button,
    buttonGroup: createButtonGroup,
    selectButtonGroup: createSelectButtonGroup,
    splitButton: createSplitButton,
    dropDownButton: createDropDownButton,
    moreMenuButton: createMoreMenuButton,
    floatingActionButton: createFloatingActionButton,
    actionButton: (action: any, t: any, _resolve: any, props: any) =>
      button({
        ...action,
        ...normalizeAction(action, t),
        label: normalizeAction(action, t).text,
        ...props,
        icon: factory.resolveIcon(action.icon ?? action.name ?? ""),
        onClick: action.onAction,
      }),
  };
}

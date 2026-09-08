import { normalizeAction } from "./utils";
import { createButton } from "./button";
import { createButtonGroup } from "./buttonGroup";
import { createSelectButtonGroup } from "./selectButtonGroup";
import {
  createDropDownButton,
  createMoreMenuButton,
} from "./dropDownButton";
import { createSplitButton } from "./splitButton";
import { createFloatingActionButton } from "./floatingActionButton";

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
        onClick: action.onAction ?? action.command,
      }),
  };
}

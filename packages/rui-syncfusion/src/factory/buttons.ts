import { createElement, type ReactElement, type ReactNode } from "react";
import { ButtonComponent, FabComponent } from "@syncfusion/ej2-react-buttons";
import {
  DropDownButtonComponent,
  SplitButtonComponent,
} from "@syncfusion/ej2-react-splitbuttons";
import {
  buttonModifierClasses,
  fabModifierClasses,
  selectButtonGroupSelected,
  selectButtonOptionLabel,
  selectButtonOptionValue,
  toggleSelectButtonGroupValue,
  type UiAction,
  type UiButtonGroupProps,
  type UiButtonProps,
  type UiButtonSlots,
  type UiDropDownButtonProps,
  type UiDropDownButtonSlots,
  type UiFloatingActionButtonProps,
  type UiSelectButtonGroupProps,
  type UiSplitButtonProps,
  type UiSplitButtonSlots,
  type TranslateFn,
} from "@mmda/core";
import {
  joinClass,
  nativeDomProps,
  sfCssClass,
  sfHtmlAttributes,
  el,
} from "./utils";

export function createButton(
  props: UiButtonProps = {},
  slots?: UiButtonSlots<ReactNode>,
): ReactElement {
  const label = slots?.default ? slots.default() : props.label;
  const cssClass = sfCssClass(props, buttonModifierClasses(props));

  return createElement(ButtonComponent as any, {
    id: props.id ?? (props.htmlAttributes as any)?.id,
    content: label,
    iconCss: (props as any).icon,
    cssClass,
    disabled: props.disabled === true,
    isPrimary: props.colorRole === "primary",
    isToggle: false,
    type: props.type ?? "button",
    title: props.tooltip ?? (props.htmlAttributes as any)?.title,
    onClick: (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      props.onClick?.(event as never);
    },
    htmlAttributes: sfHtmlAttributes(props),
  });
}

export function createButtonGroup(
  props: UiButtonGroupProps = {},
  slots?: UiButtonSlots<ReactNode>,
): ReactElement {
  const children = slots?.default?.() ?? [];
  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass("e-btn-group", props.class),
      role: "group",
    },
    ...children,
  );
}

export function createSelectButtonGroup(
  props: UiSelectButtonGroupProps,
): ReactElement {
  const options = (props.options ?? []) as unknown[];
  const multiple = props.selectionMode === "multiple";

  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass("e-btn-group", props.class),
      role: "group",
    },
    ...options.map((option, index) => {
      const value = selectButtonOptionValue(option, props.optionValue);
      const selected = selectButtonGroupSelected(
        props.modelValue,
        value,
        props.selectionMode,
      );
      return el(
        "button",
        {
          key: String(value ?? index),
          type: "button",
          className: selected ? "e-btn e-primary" : "e-btn e-flat",
          "aria-pressed": selected,
          onClick: () =>
            props.onUpdate?.(
              toggleSelectButtonGroupValue(
                props.modelValue,
                value,
                props.selectionMode,
              ),
            ),
        },
        selectButtonOptionLabel(option, props.optionLabel),
      );
    }),
  );
}

function dropdownItems(
  props: UiDropDownButtonProps,
): Record<string, unknown>[] {
  const actions = props.actions ?? [];
  return actions.map((action) => ({
    text: action.label ?? action.name ?? "",
    iconCss: action.icon,
    disabled: action.disabled,
    separator: action.divider,
  }));
}

export function createDropDownButton(
  props: UiDropDownButtonProps,
  slots?: UiDropDownButtonSlots<ReactNode>,
): ReactElement {
  return createElement(DropDownButtonComponent as any, {
    content: slots?.default ? slots.default() : props.label,
    iconCss: props.icon,
    cssClass: sfCssClass(props, buttonModifierClasses(props)),
    items: dropdownItems(props),
    disabled: props.disabled === true,
    select: (args: { item?: { text?: string } }) => {
      const action = (props.actions ?? []).find(
        (item: UiAction) => (item.label ?? item.name ?? "") === args.item?.text,
      );
      action?.onAction?.();
    },
    htmlAttributes: sfHtmlAttributes(props),
  });
}

export function createMoreMenuButton(
  props: UiDropDownButtonProps,
  slots?: UiDropDownButtonSlots<ReactNode>,
): ReactElement {
  return createDropDownButton(
    {
      ...props,
      label: props.label ?? "\u200B",
      icon: props.icon ?? "e-icons e-more-vertical-1",
    },
    slots,
  );
}

export function createSplitButton(
  props: UiSplitButtonProps,
  slots?: UiSplitButtonSlots<ReactNode>,
): ReactElement {
  return createElement(SplitButtonComponent as any, {
    content: slots?.default ? slots.default() : props.label,
    iconCss: props.icon,
    cssClass: sfCssClass(props, buttonModifierClasses(props)),
    items: dropdownItems(props),
    disabled: props.disabled === true,
    select: (args: { item?: { text?: string } }) => {
      const action = props.actions.find(
        (item: UiAction) => (item.label ?? item.name ?? "") === args.item?.text,
      );
      action?.onAction?.();
    },
    htmlAttributes: sfHtmlAttributes(props),
  });
}

const FAB_POSITIONS: Record<string, string> = {
  topLeft: "TopLeft",
  topCenter: "TopCenter",
  topRight: "TopRight",
  middleLeft: "MiddleLeft",
  middleCenter: "MiddleCenter",
  middleRight: "MiddleRight",
  bottomLeft: "BottomLeft",
  bottomCenter: "BottomCenter",
  bottomRight: "BottomRight",
};

export function createFloatingActionButton(
  props: UiFloatingActionButtonProps,
): ReactElement {
  const iconPosition = props.iconPosition === "right" ? "Right" : "Left";
  return createElement(FabComponent as any, {
    content: props.label,
    iconCss: props.icon,
    iconPosition,
    position: FAB_POSITIONS[props.position ?? "bottomRight"] ?? "BottomRight",
    target: props.target,
    cssClass: sfCssClass(props, fabModifierClasses(props)),
    disabled: props.disabled === true,
    onClick: (event: Event) => {
      event.preventDefault();
      props.onClick?.(event as never);
    },
    htmlAttributes: sfHtmlAttributes(props),
  });
}

/** 动作按钮：把 `UiAction` 归到标准按钮形状。 */
export function createActionButton(
  action: UiAction,
  t: TranslateFn,
  resolveIcon: (icon: string) => string | undefined,
  props?: UiButtonProps,
): ReactElement {
  const label = action.label ?? (action.name ? t(action.name) : undefined);
  return createButton({
    ...action,
    ...props,
    label,
    icon: resolveIcon(action.icon ?? "") ?? action.icon,
    colorRole: props?.colorRole ?? action.colorRole,
    disabled: props?.disabled ?? action.disabled,
    tooltip: props?.tooltip ?? action.tooltip,
    onClick: action.onAction,
  });
}

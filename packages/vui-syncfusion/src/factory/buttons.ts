import { h } from "vue";
import { ButtonComponent } from "@syncfusion/ej2-vue-buttons";
import {
  DropDownButtonComponent,
  SplitButtonComponent,
} from "@syncfusion/ej2-vue-splitbuttons";
import { SfDropupMenuButton } from "../components/SfDropupMenuButton";
import {
  buttonRoleClass,
  buttonSurfaceClass,
  findAction,
  flushAllInplaceEdits,
  normalizeAction,
  splitButtonRoleClass,
  splitButtonSurfaceClass,
} from "./utils";

export function createButton(props: any, slots?: any) {
  const onClick = props.onClick ?? props.onAction ?? props.command;
  const htmlAttributes =
    props.htmlAttributes && typeof props.htmlAttributes === "object"
      ? props.htmlAttributes
      : {};
  return h(
    ButtonComponent as any,
    {
      id: props.id ?? htmlAttributes.id,
      content:
        props.label ??
        (typeof slots?.default === "function" ? undefined : props.content),
      iconCss: props.icon,
      cssClass: [
        buttonRoleClass(props),
        buttonSurfaceClass(props.buttonType),
        props.shape === "round" || props.shape === "circle" ? "e-round" : "",
        props.class,
      ]
        .filter(Boolean)
        .join(" "),
      disabled: props.disabled === true || props.disabled === "true",
      isPrimary: (props.colorRole ?? props.severity) === "primary",
      title: props.tooltip ?? htmlAttributes.title,
      type: props.type ?? htmlAttributes.type ?? "button",
      "aria-label":
        props["aria-label"] ?? htmlAttributes["aria-label"] ?? props.tooltip,
      onClick: (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        flushAllInplaceEdits();
        onClick?.(event);
      },
    },
    slots,
  );
}

export function attachButtonRenderers(
  factory: any,
  button = createButton,
) {
  factory.button = button;
  factory.buttonGroup = (buttons: any, props: any) => {
    const { class: className, ...rest } = props ?? {};
    return h(
      "div",
      {
        ...rest,
        class: ["e-btn-group", "mmda-sf-button-group", className].filter(
          Boolean,
        ),
      },
      buttons().filter(Boolean),
    );
  };
  factory.splitButton = (props: any, slots: any) =>
    h(
      SplitButtonComponent as any,
      {
        content: props.label,
        iconCss: props.icon,
        disabled: props.disabled === true || props.disabled === "true",
        cssClass: [
          splitButtonRoleClass(props),
          splitButtonSurfaceClass(props.buttonType),
          props.class,
        ]
          .filter(Boolean)
          .join(" "),
        items: (props.actions ?? []).map((action: any) =>
          normalizeAction(action),
        ),
        select: (args: any) => {
          const found = findAction(
            props.actions ?? [],
            args.item?.id ?? args.item?.text,
          );
          found?.onAction?.();
          found?.command?.();
        },
        onClick: props.onAction ?? props.command,
      },
      slots,
    );
  factory.menuButton = (props: any, actions: any[], slots: any) => {
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
  };
  factory.floatingActionButton = (props: any) =>
    button({
      ...props,
      cssClass: ["e-round mmda-sf-fab", props.class].filter(Boolean).join(" "),
    });
  factory.selectButton = (value: any, props: any, _slots?: any) =>
    h(
      "div",
      { class: "e-btn-group mmda-sf-select-button" },
      (props.options ?? []).map((option: any) =>
        h(ButtonComponent as any, {
          content: option.label ?? option,
          cssClass:
            (props.modelValue ?? value) === (option.value ?? option)
              ? "e-active"
              : "",
          onClick: () =>
            (props["onUpdate:modelValue"] ?? props.onUpdate)?.(
              option.value ?? option,
            ),
        }),
      ),
    );
  factory.actionButton = (action: any, t: any, _resolve: any, props: any) =>
    button({
      ...action,
      ...normalizeAction(action, t),
      label: normalizeAction(action, t).text,
      ...props,
      icon: factory.resolveIcon(action.icon ?? action.name ?? ""),
      onClick: action.onAction ?? action.command,
    });
}

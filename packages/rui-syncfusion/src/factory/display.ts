import { createElement, type ReactElement, type ReactNode } from "react";
import {
  BreadcrumbComponent,
  TabComponent,
} from "@syncfusion/ej2-react-navigations";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { ProgressBarComponent } from "@syncfusion/ej2-react-progressbar";
import {
  avatarModifierClasses,
  badgeModifierClasses,
  cardModifierClasses,
  dividerModifierClasses,
  errorDisplayOf,
  errorModifierClasses,
  loadingLabelOf,
  loadingModifierClasses,
  loadingWidthOf,
  messageSeverityOf,
  messageShowCloseIconOf,
  messageShowIconOf,
  messageVariantOf,
  progressBarModifierClasses,
  skeletonModifierClasses,
  tabsModifierClasses,
  toolbarModifierClasses,
  toolbarRegionsOf,
  tooltipModifierClasses,
  type UiAvatarProps,
  type UiBadgeProps,
  type UiBreadcrumbProps,
  type UiCardProps,
  type UiCardSlots,
  type UiDividerProps,
  type UiErrorProps,
  type UiLoadingProps,
  type UiMessageProps,
  type UiProgressBarProps,
  type UiSkeletonProps,
  type UiTabsProps,
  type UiToolbarProps,
  type UiToolbarSlots,
  type UiTooltipProps,
  type UiTooltipSlots,
} from "@mmda/core";
import {
  el,
  joinClass,
  nativeDomProps,
  sfCssClass,
  sfHtmlAttributes,
} from "./utils";

export function createBadge(props: UiBadgeProps): ReactElement {
  const shape =
    props.shape === "dot"
      ? "e-badge-dot"
      : props.shape === "circle"
        ? "e-badge-circle"
        : props.shape === "pill"
          ? "e-badge-pill"
          : "e-badge";
  return el(
    "span",
    {
      ...nativeDomProps(props),
      className: joinClass(shape, badgeModifierClasses(props)),
    },
    props.overlay ? null : String(props.value ?? ""),
  );
}

export function createAvatar(props: UiAvatarProps): ReactElement {
  const cls = joinClass(
    "e-avatar",
    (props.shape ?? "circle") === "circle" ? "e-avatar-circle" : "",
    avatarModifierClasses(props),
  );
  if (props.src) {
    return el(
      "span",
      { ...nativeDomProps(props), className: cls },
      el("img", { src: props.src, alt: props.label }),
    );
  }
  return el(
    "span",
    { ...nativeDomProps(props), className: cls },
    props.icon ? el("i", { className: props.icon }) : null,
    props.label,
  );
}

export function createBreadcrumb(props: UiBreadcrumbProps): ReactElement {
  return createElement(BreadcrumbComponent as any, {
    items: props.items.map((item) => ({
      text: item.label,
      iconCss: item.icon,
      url: item.to,
    })),
    cssClass: sfCssClass(props, "mmda-breadcrumb"),
    htmlAttributes: sfHtmlAttributes(props),
    itemClick: (args: { item?: { url?: string; text?: string } }) => {
      const item = props.items.find((it) => it.label === args.item?.text);
      if (item?.to) return;
    },
  });
}

export function createCard(
  props: UiCardProps,
  slots?: UiCardSlots<ReactNode>,
): ReactElement {
  const header =
    slots?.header?.() ??
    (props.title || props.subtitle
      ? [
          el(
            "div",
            { className: "e-card-header" },
            el(
              "div",
              { className: "e-card-header-caption" },
              props.title
                ? el("div", { className: "e-card-header-title" }, props.title)
                : null,
              props.subtitle
                ? el("div", { className: "e-card-sub-title" }, props.subtitle)
                : null,
            ),
          ),
        ]
      : null);
  const image =
    slots?.image?.() ??
    (props.image
      ? [
          el(
            "div",
            { className: "e-card-image" },
            el("img", { src: props.image, alt: props.imageAlt }),
          ),
        ]
      : null);

  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass("e-card", cardModifierClasses(props)),
    },
    image,
    header,
    el("div", { className: "e-card-content" }, slots?.default?.() ?? null),
    slots?.actions
      ? el("div", { className: "e-card-actions" }, slots.actions())
      : null,
    slots?.footer
      ? el("div", { className: "e-card-footer" }, slots.footer())
      : null,
  );
}

export function createDivider(props: UiDividerProps = {}): ReactElement {
  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass("e-divider", dividerModifierClasses(props)),
      role: "separator",
    },
    props.label
      ? el("span", { className: "mmda-divider__label" }, props.label)
      : null,
  );
}

export function createTooltip(
  props: UiTooltipProps = {},
  slots?: UiTooltipSlots<ReactNode>,
): ReactElement {
  const content = slots?.content?.() ?? props.content;
  return createElement(
    TooltipComponent as any,
    {
      content,
      position:
        props.position === "bottom" ||
        props.position === "left" ||
        props.position === "right"
          ? props.position
          : "top",
      showTipPointer: props.showPointer !== false,
      openDelay: props.openDelay,
      closeDelay: props.closeDelay,
      disabled: props.disabled === true,
      cssClass: sfCssClass(props, tooltipModifierClasses(props)),
      htmlAttributes: sfHtmlAttributes(props),
      beforeRender: (args: { element?: HTMLElement }) =>
        props.onReady?.({
          open: () => args.element?.click(),
          close: () => {},
          refresh: () => {},
        }),
    },
    slots?.default?.() ?? null,
  );
}

export function createTabs(props: UiTabsProps<ReactNode>): ReactElement {
  const items = (props.items ?? []).map((item) => ({
    header:
      typeof item.header === "string" ? { text: item.header } : item.header,
    content: typeof item.content === "function" ? item.content() : item.content,
  }));
  return createElement(TabComponent as any, {
    items,
    selectedItem: props.value ?? 0,
    headerPlacement: props.headerPlacement,
    heightAdjustMode: props.heightAdjustMode ?? "Fill",
    cssClass: sfCssClass(props, tabsModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    selected: (args: { selectedIndex?: number }) =>
      props.onChange?.(args?.selectedIndex ?? 0),
  });
}

export function createToolbar(
  props: UiToolbarProps = {},
  slots?: UiToolbarSlots<ReactNode>,
): ReactElement {
  const regions = toolbarRegionsOf(slots);
  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass("mmda-toolbar", toolbarModifierClasses(props)),
      role: "toolbar",
    },
    regions.start
      ? el("div", { className: "mmda-toolbar__start" }, regions.start())
      : null,
    regions.center
      ? el("div", { className: "mmda-toolbar__center" }, regions.center())
      : null,
    regions.end
      ? el("div", { className: "mmda-toolbar__end" }, regions.end())
      : null,
  );
}

export function createProgressBar(props: UiProgressBarProps): ReactElement {
  const value = Math.max(
    props.min ?? 0,
    Math.min(props.max ?? 100, props.value ?? 0),
  );
  return createElement(ProgressBarComponent as any, {
    value,
    min: props.min ?? 0,
    max: props.max ?? 100,
    isIndeterminate: props.indeterminate === true,
    showProgressValue: props.showValue === true,
    type: props.kind === "circular" ? "Circular" : "Linear",
    cssClass: sfCssClass(props, progressBarModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
  });
}

export function createSkeleton(props: UiSkeletonProps = {}): ReactElement {
  const style =
    typeof props.style === "object" && props.style ? props.style : {};
  return el("div", {
    ...nativeDomProps(props),
    className: joinClass("mmda-skeleton", skeletonModifierClasses(props)),
    style: { width: props.width, height: props.height, ...style },
  });
}

export function createLoading(props: UiLoadingProps = {}): ReactElement {
  const width = loadingWidthOf(props);
  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass("mmda-loading", loadingModifierClasses(props)),
    },
    el("span", {
      className: "e-spinner mmda-loading__spinner",
      style: { width, height: width },
    }),
    loadingLabelOf(props)
      ? el("span", { className: "mmda-loading__label" }, loadingLabelOf(props))
      : null,
  );
}

export function createError(props: UiErrorProps = {}): ReactElement {
  const display = errorDisplayOf(props);
  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass("mmda-error-retry", errorModifierClasses(props)),
    },
    display.title
      ? el("div", { className: "mmda-error-retry__title" }, display.title)
      : null,
    display.description
      ? el(
          "div",
          { className: "mmda-error-retry__description" },
          display.description,
        )
      : null,
    props.onRetry
      ? el(
          "button",
          {
            className: "e-btn e-primary",
            type: "button",
            onClick: props.onRetry,
          },
          props.retryLabel ?? "Retry",
        )
      : null,
  );
}

export function createMessage(props: UiMessageProps): ReactElement {
  const severity = messageSeverityOf(props.severity);
  const variant = messageVariantOf(props.variant);
  const icon =
    severity === "error"
      ? "e-circle-close"
      : severity === "warning"
        ? "e-circle-warning"
        : severity === "success"
          ? "e-circle-check"
          : "e-circle-info";
  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass(
        "mmda-message",
        `mmda-message--${severity}`,
        `mmda-message--${variant}`,
        props.cssClass,
      ),
      role: "alert",
    },
    messageShowIconOf(props.showIcon)
      ? el("i", { className: `e-icons ${icon}` })
      : null,
    el("span", { className: "mmda-message__content" }, props.content),
    messageShowCloseIconOf(props.showCloseIcon)
      ? el(
          "button",
          {
            className: "e-btn e-flat mmda-message__close",
            type: "button",
            onClick: props.onClose,
          },
          "×",
        )
      : null,
  );
}

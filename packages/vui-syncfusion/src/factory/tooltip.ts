/*
 * chrome 提示气泡走 factory.tooltip。vui 名是 tooltip。
 * https://ej2.syncfusion.com/vue/documentation/tooltip/vue-3-getting-started
 */
import { h, type VNode } from "vue";
import { TooltipComponent } from "@syncfusion/ej2-vue-popups";
import type {
  UiPosition,
  UiTooltipController,
  UiTooltipOpensOn,
  UiTooltipProps,
  UiTooltipSlots,
} from "@mmda/vui"
import {
  htmlAttributesOf,
  noopTooltipController,
  tooltipContentOf,
  tooltipDisabledOf,
  tooltipModifierClasses,
  tooltipOpensOnOf,
  tooltipPositionOf,
  tooltipShowPointerOf,
} from "@mmda/vui"

function ej2Of(el: any) {
  return el?.ej2Instances ?? el;
}

/** EJ2 四边中点 */
export function tooltipPositionToEj2(
  position: UiPosition,
): "TopCenter" | "BottomCenter" | "LeftCenter" | "RightCenter" {
  if (position === "bottom") return "BottomCenter";
  if (position === "left") return "LeftCenter";
  if (position === "right") return "RightCenter";
  return "TopCenter";
}

export function tooltipOpensOnToEj2(
  opensOn: UiTooltipOpensOn,
): "Auto" | "Hover" | "Click" | "Focus" | "Custom" {
  if (opensOn === "hover") return "Hover";
  if (opensOn === "click") return "Click";
  if (opensOn === "focus") return "Focus";
  if (opensOn === "custom") return "Custom";
  return "Auto";
}

export function createTooltip(props: UiTooltipProps, slots?: UiTooltipSlots) {
  const {
    content: _content,
    position: _position,
    opensOn: _opensOn,
    showPointer: _showPointer,
    openDelay,
    closeDelay,
    disabled: _disabled,
    onReady,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  const children = slots?.default?.() ?? [];
  if (tooltipDisabledOf(props)) {
    onReady?.(noopTooltipController);
    return h(
      "span",
      {
        class: tooltipModifierClasses(props),
        ...htmlAttributesOf(props),
      },
      children,
    );
  }

  const content =
    tooltipContentOf(props, slots) ??
    (slots?.content ? () => slots.content!() : undefined);

  let host: any;

  const controller = (): UiTooltipController => {
    const inst = () => ej2Of(host);
    return {
      open: (element?: HTMLElement) => inst()?.open?.(element),
      close: () => inst()?.close?.(),
      refresh: () => inst()?.refresh?.(),
    };
  };

  const cssClass = tooltipModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(
    TooltipComponent as any,
    {
      ...rest,
      ...htmlAttributesOf(props),
      ref: (el: any) => {
        host = el;
      },
      content,
      position: tooltipPositionToEj2(tooltipPositionOf(props)),
      opensOn: tooltipOpensOnToEj2(tooltipOpensOnOf(props)),
      showTipPointer: tooltipShowPointerOf(props),
      openDelay,
      closeDelay,
      cssClass,
      created: () => onReady?.(controller()),
    },
    () => children as VNode[],
  );
}

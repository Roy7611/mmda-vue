import { createElement, useRef, type ReactElement } from "react";
import { StepperComponent } from "@syncfusion/ej2-react-navigations";
import { SignatureComponent } from "@syncfusion/ej2-react-inputs";
import {
  signaturePadModifierClasses,
  signaturePadValueOf,
  stepperDisplayToEj2,
  stepperItemsOf,
  stepperLabelPositionToEj2,
  stepperModifierClasses,
  stepperOrientationToEj2,
  stepperStatusToEj2,
  stepperValueOf,
  type UiSearchRefProps,
  type UiSignaturePadProps,
  type UiStepperProps,
} from "@mmda/core";
import {
  el,
  joinClass,
  nativeDomProps,
  sfCssClass,
  sfHtmlAttributes,
} from "./utils";

function displayLabel(
  value: unknown,
  optionLabel?: string | ((value: unknown) => string),
): string {
  if (value == null) return "";
  if (typeof optionLabel === "function") return optionLabel(value);
  if (typeof value === "object" && value != null) {
    const rec = value as Record<string, unknown>;
    const key = optionLabel && optionLabel in rec ? optionLabel : undefined;
    const raw = key ? rec[key] : (rec.label ?? rec.name ?? rec.text ?? rec.id);
    return raw == null ? "" : String(raw);
  }
  return String(value);
}

export function createSearchRelative(props: UiSearchRefProps): ReactElement {
  return el(
    "div",
    {
      ...nativeDomProps(props),
      className: joinClass("mmda-search-relative", props.class),
    },
    el(
      "button",
      {
        className: "e-input mmda-search-relative__value",
        type: "button",
        title: props.placeholder,
        onClick: (event: Event) => {
          event.preventDefault();
          void props.toSearch(event);
        },
      },
      displayLabel(props.modelValue, props.optionLabel) ||
        props.placeholder ||
        "\u200B",
    ),
  );
}

export function createStepper(props: UiStepperProps): ReactElement {
  const items = stepperItemsOf(props).map((item) => ({
    label: item.label,
    text: item.text,
    iconCss: item.icon,
    optional: item.optional,
    disabled: item.disabled,
    cssClass: item.cssClass,
    status: stepperStatusToEj2(item.status),
  }));

  return createElement(StepperComponent as any, {
    steps: items,
    activeStep: stepperValueOf(props),
    orientation: stepperOrientationToEj2(props.orientation ?? "horizontal"),
    labelPosition: stepperLabelPositionToEj2(props.labelPosition ?? "bottom"),
    stepType: stepperDisplayToEj2(props.display ?? "default"),
    linear: props.linear === true,
    cssClass: sfCssClass(props, stepperModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    created: (args: { element?: HTMLElement }) =>
      props.onReady?.({
        next: () => {},
        previous: () => {},
        reset: () => {},
        refresh: () => {},
      }),
    stepChanged: (args: { activeStep?: number }) =>
      props.onChange?.(args?.activeStep ?? 0),
  });
}

function SignatureElement(props: UiSignaturePadProps): ReactElement {
  const ref = useRef<any>(null);
  const emit = (): void => {
    const value = ref.current?.getSignature?.() ?? "";
    props.onChange?.(value);
  };

  return createElement(SignatureComponent as any, {
    ref,
    backgroundColor: props.backgroundColor,
    strokeColor: props.strokeColor,
    backgroundImage: props.backgroundImage,
    minStrokeWidth: props.minStrokeWidth,
    maxStrokeWidth: props.maxStrokeWidth,
    velocity: props.velocity,
    disabled: props.disabled === true,
    isReadOnly: props.readOnly === true,
    cssClass: sfCssClass(props, signaturePadModifierClasses(props)),
    htmlAttributes: sfHtmlAttributes(props),
    change: () => {
      props.onAction?.("mouseUp");
      emit();
    },
  });
}

export function createSignaturePad(props: UiSignaturePadProps): ReactElement {
  return createElement(SignatureElement, props);
}

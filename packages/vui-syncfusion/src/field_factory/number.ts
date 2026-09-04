import { h } from "vue";
import type { MetaUiField } from "@mmda/core";
import type { PropData } from "@mmda/vui";
import { NumericTextBoxComponent } from "@syncfusion/ej2-vue-inputs";
import { resolveFieldUnit } from "../factory/utils";
import { control, invalidOf, type UiContext } from "./utils";

const numericStepOf = (field: MetaUiField, props: PropData = {}) => {
  if (props.step != null && props.step !== "") return Number(props.step);
  const scale = (field as any).scale ?? field.numericScale;
  if (scale != null && scale !== "" && Number(scale) > 0) {
    return 1 / 10 ** Number(scale);
  }
  return 1;
};

const numericSuffixAdornment = (unit: string) =>
  h("span", { class: "mmda-numeric-suffix", "aria-hidden": "true" }, unit);

const injectNumericUnitSuffix = (field: MetaUiField, unit: string) => () => {
  if (!unit) return;
  queueMicrotask(() => {
    const input = document.getElementById(field.fieldName);
    const container = input?.closest(".e-input-group");
    if (!container || container.querySelector(".mmda-numeric-suffix")) return;

    const suffix = document.createElement("span");
    suffix.className = "e-input-group-icon mmda-numeric-suffix";
    suffix.textContent = unit;
    suffix.setAttribute("aria-hidden", "true");

    const spinDown = container.querySelector(".e-spin-down");
    if (spinDown) container.insertBefore(suffix, spinDown);
    else container.appendChild(suffix);
  });
};

export const numberInput = (
  field: MetaUiField,
  context: UiContext,
  props: PropData = {},
) => {
  const unit = resolveFieldUnit(field);
  const scale = (field as any).scale ?? field.numericScale;
  const decimals =
    scale != null && scale !== "" && !Number.isNaN(Number(scale))
      ? Number(scale)
      : undefined;
  const invalid = invalidOf(field, context);
  const useSuffix = Boolean(unit) && props.appendTemplate == null;
  const { created: userCreated, cssClass: userCssClass, ...controlProps } =
    props;
  const slots = useSuffix
    ? { appendTemplate: () => numericSuffixAdornment(unit) }
    : undefined;
  const extra: PropData = {
    format: "n",
    step: numericStepOf(field, props),
    showSpinButton: props.showSpinButton ?? true,
    ...(decimals != null ? { decimals } : {}),
    ...(useSuffix || userCreated
      ? {
          ...(useSuffix ? { appendTemplate: "appendTemplate" } : {}),
          ...(useSuffix
            ? {
                cssClass:
                  [
                    "mmda-numeric-with-unit",
                    invalid ? "e-error" : "",
                    userCssClass,
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined,
              }
            : {}),
          created: () => {
            if (useSuffix) injectNumericUnitSuffix(field, unit)();
            userCreated?.();
          },
        }
      : {}),
  };
  return control(
    NumericTextBoxComponent as any,
    field,
    context,
    controlProps,
    extra,
    slots,
  );
};

export const percentInput = (
  field: MetaUiField,
  context: UiContext,
  props?: PropData,
) =>
  control(NumericTextBoxComponent as any, field, context, props, {
    format: "p",
    min: 0,
    max: 1,
  });

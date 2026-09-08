import { h } from "vue";
import { NumericTextBoxComponent } from "@syncfusion/ej2-vue-inputs";
import type { UiNumberInputProps } from "@mmda/vui";
import {
  emitNumberInputChange,
  htmlAttributesOf,
  numberInputDecimalsOf,
  numberInputFormatOf,
  numberInputModifierClasses,
  numberInputStepOf,
} from "@mmda/vui";

const suffixAdornment = (unit: string) =>
  h("span", { class: "mmda-numeric-suffix", "aria-hidden": "true" }, unit);

const injectNumericUnitSuffix = (id: string | undefined, unit: string) => () => {
  if (!unit || !id) return;
  queueMicrotask(() => {
    const input = document.getElementById(id);
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

export function createNumberInput(props: UiNumberInputProps) {
  const {
    value,
    modelValue,
    min,
    max,
    step: _step,
    decimals: _decimals,
    format,
    placeholder,
    disabled,
    showSpinButton,
    suffix,
    kind,
    onChange: _onChange,
    htmlAttributes,
    class: _className,
    maxFractionDigits: _maxFractionDigits,
    ...rest
  } = props;

  const cssClass = numberInputModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");
  const unit = suffix?.trim() ?? "";
  const decimals = numberInputDecimalsOf(props);
  const id =
    (htmlAttributes as { id?: string } | undefined)?.id ??
    (rest as { id?: string }).id;

  const emit = (args: { value?: number | null } | number | null) => {
    emitNumberInputChange(props, args);
  };

  const slots = unit
    ? { appendTemplate: () => suffixAdornment(unit) }
    : undefined;

  return h(
    NumericTextBoxComponent as any,
    {
      ...rest,
      ...htmlAttributesOf(props),
      value: value ?? modelValue ?? null,
      min: min ?? (kind === "percent" ? 0 : undefined),
      max: max ?? (kind === "percent" ? 1 : undefined),
      step: numberInputStepOf(props),
      format: numberInputFormatOf({ format, kind }),
      placeholder,
      decimals,
      showSpinButton: showSpinButton !== false,
      enabled: disabled !== true && disabled !== "true",
      cssClass,
      htmlAttributes,
      ...(unit ? { appendTemplate: "appendTemplate" } : {}),
      created: unit ? injectNumericUnitSuffix(id, unit) : undefined,
      change: emit,
      input: emit,
    },
    slots,
  );
}

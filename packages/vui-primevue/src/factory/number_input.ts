import { h } from "vue";
import InputNumber from "primevue/inputnumber";
import type { UiNumberInputProps } from "@mmda/core"
import { numberInputDecimalsOf, numberInputFormatOf, numberInputModifierClasses, numberInputStepOf } from "@mmda/core"
import { emitNumberInputChange } from "@mmda/vui"
import { htmlAttributesOf } from "@mmda/vui"

const standardFormatKind = (format: string): string | undefined => {
  const ch = format.trim()[0]?.toLowerCase();
  if (ch === "n" || ch === "p" || ch === "c") return ch;
  return undefined;
};

const fractionDigitsOfFormat = (format: string): number | undefined => {
  const rest = format.trim().slice(1);
  if (!rest) return undefined;
  const n = Number(rest);
  return Number.isFinite(n) ? n : undefined;
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
    maxFractionDigits: _maxFractionDigits,
    ...rest
  } = props;

  const resolvedFormat = numberInputFormatOf({ format, kind });
  const formatKind = standardFormatKind(resolvedFormat);
  const formatDigits = fractionDigitsOfFormat(resolvedFormat);
  const decimals = numberInputDecimalsOf(props) ?? formatDigits;
  const percent = kind === "percent" || formatKind === "p";
  const currency = formatKind === "c";

  return h(InputNumber, {
    ...rest,
    ...htmlAttributesOf(props),
    modelValue: (value ?? modelValue ?? null) as number | null,
    min: min ?? (percent ? 0 : undefined),
    max: max ?? (percent ? 100 : undefined),
    step: numberInputStepOf(props),
    minFractionDigits: decimals,
    maxFractionDigits: decimals,
    mode: currency ? "currency" : "decimal",
    suffix: suffix ?? (percent ? "%" : undefined),
    placeholder,
    showButtons: showSpinButton !== false,
    useGrouping: false,
    disabled: disabled === true,
    class: [...numberInputModifierClasses(props)].flat(),
    "onUpdate:modelValue": (next: number | null | undefined) =>
      emitNumberInputChange(props, next ?? null),
  });
}

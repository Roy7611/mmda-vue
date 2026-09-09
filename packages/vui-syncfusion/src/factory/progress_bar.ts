import { h } from "vue";
import { ProgressBarComponent } from "@syncfusion/ej2-vue-progressbar";
import type { UiProgressBarProps } from "@mmda/core"
import { progressBarModifierClasses } from "@mmda/core"
import { htmlAttributesOf } from "@mmda/vui"

const numberOf = (raw: unknown): number => {
  if (raw == null || raw === "") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

export function createProgressBar(props: UiProgressBarProps) {
  const {
    value,
    modelValue,
    min,
    max,
    kind,
    size: _size,
    indeterminate,
    showValue,
    colorRole: _colorRole,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  const cssClass = progressBarModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  return h(ProgressBarComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    value: numberOf(value ?? modelValue),
    minimum: min ?? 0,
    maximum: max ?? 100,
    type: kind === "circular" ? "Circular" : "Linear",
    isIndeterminate: Boolean(indeterminate),
    showProgressValue: Boolean(showValue),
    cssClass,
    htmlAttributes,
  });
}

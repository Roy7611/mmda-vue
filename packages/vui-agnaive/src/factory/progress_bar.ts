import { h } from "vue";
import { NProgress } from "naive-ui";
import type { UiProgressBarProps } from "@mmda/core"
import type { UiColorRole } from "@mmda/vui"
import { progressBarModifierClasses } from "@mmda/core"
const percentOf = (props: UiProgressBarProps): number => {
  const n = Number(props.value ?? props.modelValue ?? 0);
  const v = Number.isFinite(n) ? n : 0;
  return Math.min(100, Math.max(0, v));
};

const naiveStatus = (role?: UiColorRole) => {
  if (role === "success") return "success";
  if (role === "info") return "info";
  if (role === "warning") return "warning";
  if (role === "danger") return "error";
  return undefined;
};

export function createProgressBar(props: UiProgressBarProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    min: _min,
    max: _max,
    kind,
    size,
    indeterminate,
    showValue,
    colorRole,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  return h(NProgress, {
    ...rest,
    ...htmlAttributes,
    percentage: percentOf(props),
    type: kind === "circular" ? "circle" : "line",
    showIndicator: Boolean(showValue),
    processing: Boolean(indeterminate),
    status: naiveStatus(colorRole),
    size: size === "small" || size === "large" ? size : undefined,
    class: progressBarModifierClasses(props),
  });
}

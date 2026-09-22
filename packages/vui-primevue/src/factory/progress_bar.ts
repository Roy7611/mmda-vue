import { h } from "vue";
import ProgressBar from "primevue/progressbar";
import type { UiProgressBarProps } from "@mmda/core"
import { progressBarModifierClasses } from "@mmda/core"
import type { VuiModelProps } from "@mmda/vui"
const percentOf = (props: VuiModelProps<UiProgressBarProps>): number => {
  const n = Number(props.value ?? props.modelValue ?? 0);
  const v = Number.isFinite(n) ? n : 0;
  return Math.min(100, Math.max(0, v));
};

export function createProgressBar(props: VuiModelProps<UiProgressBarProps>) {
  const {
    value: _value,
    modelValue: _modelValue,
    min: _min,
    max: _max,
    kind: _kind,
    size: _size,
    indeterminate,
    showValue,
    colorRole: _colorRole,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  return h(ProgressBar, {
    ...rest,
    ...htmlAttributes,
    value: percentOf(props),
    showValue: Boolean(showValue),
    mode: indeterminate ? "indeterminate" : "determinate",
    class: progressBarModifierClasses(props),
  });
}

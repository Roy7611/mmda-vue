/*
 * chrome 步骤条走 factory.stepper。vui 名是 stepper。
 * Naive NSteps：current / vertical；其余 no-op。
 */
import { h } from "vue";
import { NStep, NSteps } from "naive-ui";
import type {
  IconResolver,
  UiStepperController,
  UiStepperProps,
} from "@mmda/vui";
import {
  emitStepperChange,
  htmlAttributesOf,
  noopStepperController,
  stepperItemsOf,
  stepperModifierClasses,
  stepperOrientationOf,
  stepperValueOf,
} from "@mmda/vui";

export function createStepper(
  props: UiStepperProps,
  resolveIcon?: IconResolver,
) {
  const {
    items: _items,
    value: _value,
    modelValue: _modelValue,
    orientation: _orientation,
    display: _display,
    labelPosition: _labelPosition,
    keyField: _keyField,
    labelField: _labelField,
    textField: _textField,
    iconField: _iconField,
    optionalField: _optionalField,
    disabledField: _disabledField,
    validField: _validField,
    statusField: _statusField,
    cssClassField: _cssClassField,
    linear: _linear,
    readOnly,
    showTooltip: _showTooltip,
    persist: _persist,
    locale: _locale,
    rtl: _rtl,
    animation: _animation,
    template: _template,
    tooltipTemplate: _tooltipTemplate,
    sanitize: _sanitize,
    onChange: _onChange,
    onChanging: _onChanging,
    onBeforeStepRender: _onBeforeStepRender,
    onReady,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  const items = stepperItemsOf(props);
  const current = stepperValueOf(props);

  const controller: UiStepperController = {
    next: () => {
      const next = Math.min(current + 1, Math.max(items.length - 1, 0));
      emitStepperChange(props, next);
    },
    previous: () => emitStepperChange(props, Math.max(current - 1, 0)),
    reset: () => emitStepperChange(props, 0),
    refresh: noopStepperController.refresh,
  };

  onReady?.(controller);

  return h(
    NSteps,
    {
      ...rest,
      ...htmlAttributesOf(props),
      current,
      vertical: stepperOrientationOf(props) === "vertical",
      class: stepperModifierClasses(props),
      style: readOnly ? { pointerEvents: "none" } : undefined,
    },
    {
      default: () =>
        items.map((item, index) =>
          h(
            NStep,
            {
              key: item.key ?? `step-${index}`,
              title: item.label ?? item.text ?? String(index + 1),
              description: item.text && item.label ? item.text : undefined,
              disabled: item.disabled,
              status:
                item.status === "completed"
                  ? "finish"
                  : item.status === "inProgress"
                    ? "process"
                    : item.status === "notStarted"
                      ? "wait"
                      : undefined,
            },
            item.icon
              ? {
                  icon: () =>
                    h("i", {
                      class: resolveIcon ? resolveIcon(item.icon!) : item.icon,
                      "aria-hidden": "true",
                    }),
                }
              : undefined,
          ),
        ),
    },
  );
}

/*
 * chrome 步骤条走 factory.stepper。vui 名是 stepper。
 * https://ej2.syncfusion.com/vue/documentation/stepper/vue-3-getting-started
 */
import { h } from "vue";
import { StepperComponent } from "@syncfusion/ej2-vue-navigations";
import type { UiStepperChanging, UiStepperController, UiStepperItem, UiStepperProps } from '@mmda/core'
import type { IconResolver } from '@mmda/vui'
import { emitStepperChange, stepperDisplayOf, stepperDisplayToEj2, stepperItemsOf, stepperLabelPositionOf, stepperLabelPositionToEj2, stepperModifierClasses, stepperOrientationOf, stepperOrientationToEj2, stepperStatusToEj2, stepperValueOf } from "@mmda/core"
import { htmlAttributesOf } from "@mmda/vui"

function ej2Of(el: any) {
  return el?.ej2Instances ?? el;
}

function stepsOf(items: UiStepperItem[], resolveIcon?: IconResolver) {
  return items.map((item, index) => ({
    id: item.key ?? `step-${index}`,
    label: item.label,
    text: item.text,
    iconCss: item.icon
      ? resolveIcon
        ? resolveIcon(item.icon)
        : item.icon
      : undefined,
    optional: item.optional,
    disabled: item.disabled,
    isValid: item.valid,
    status: stepperStatusToEj2(item.status),
    cssClass: item.cssClass,
  }));
}

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
    linear,
    readOnly,
    showTooltip,
    persist,
    locale,
    rtl,
    animation,
    template,
    tooltipTemplate,
    sanitize,
    onChange: _onChange,
    onChanging,
    onBeforeStepRender,
    onReady,
    class: _className,
    htmlAttributes,
    ...rest
  } = props;

  const cssClass = stepperModifierClasses(props)
    .flat()
    .filter(Boolean)
    .join(" ");

  let host: any;

  const controller = (): UiStepperController => {
    const inst = () => ej2Of(host);
    return {
      next: () => inst()?.nextStep?.(),
      previous: () => inst()?.previousStep?.(),
      reset: () => inst()?.reset?.(),
      refresh: () => inst()?.refreshProgressbar?.(),
    };
  };

  return h(StepperComponent as any, {
    ...rest,
    ...htmlAttributesOf(props),
    ref: (el: any) => {
      host = el;
    },
    steps: stepsOf(stepperItemsOf(props), resolveIcon),
    activeStep: stepperValueOf(props),
    orientation: stepperOrientationToEj2(stepperOrientationOf(props)),
    stepType: stepperDisplayToEj2(stepperDisplayOf(props)),
    labelPosition: stepperLabelPositionToEj2(stepperLabelPositionOf(props)),
    linear: Boolean(linear),
    readOnly: Boolean(readOnly),
    showTooltip: Boolean(showTooltip),
    enablePersistence: Boolean(persist),
    locale,
    enableRtl: Boolean(rtl),
    animation,
    template,
    tooltipTemplate,
    enableHtmlSanitizer: sanitize,
    cssClass,
    created: () => onReady?.(controller()),
    stepChanged: (args?: { activeStep?: number; selectedStep?: number }) => {
      emitStepperChange(
        props,
        Number(args?.activeStep ?? args?.selectedStep ?? stepperValueOf(props)),
      );
    },
    stepChanging: (args?: {
      activeStep?: number;
      previousStep?: number;
      cancel?: boolean;
    }) => {
      const mapped: UiStepperChanging = {
        from: Number(args?.previousStep ?? 0),
        to: Number(args?.activeStep ?? 0),
        cancel: Boolean(args?.cancel),
      };
      onChanging?.(mapped);
      if (args) args.cancel = mapped.cancel;
    },
    beforeStepRender: onBeforeStepRender,
  });
}

/*
 * chrome 步骤条走 factory.stepper。vui 名是 stepper。
 * Prime Steps：value / items / readOnly / linear；orientation 等忽略。
 */
import { h } from 'vue'
import Steps from 'primevue/steps'
import type { IconResolver, UiStepperController, UiStepperProps } from '@mmda/vui'
import {
  emitStepperChange,
  htmlAttributesOf,
  noopStepperController,
  stepperItemsOf,
  stepperModifierClasses,
  stepperValueOf,
} from '@mmda/vui'

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
  } = props

  const items = stepperItemsOf(props)
  const current = stepperValueOf(props)
  const locked = Boolean(readOnly || linear)

  const model = items.map((item, index) => ({
    key: item.key ?? `step-${index}`,
    label: item.label ?? item.text ?? String(index + 1),
    icon: item.icon
      ? resolveIcon
        ? resolveIcon(item.icon)
        : item.icon
      : undefined,
    disabled: Boolean(item.disabled) || (linear && index > current),
  }))

  const controller: UiStepperController = {
    next: () => {
      const next = Math.min(current + 1, Math.max(items.length - 1, 0))
      emitStepperChange(props, next)
    },
    previous: () => emitStepperChange(props, Math.max(current - 1, 0)),
    reset: () => emitStepperChange(props, 0),
    refresh: noopStepperController.refresh,
  }

  onReady?.(controller)

  return h(Steps, {
    ...rest,
    ...htmlAttributesOf(props),
    model,
    activeStep: current,
    readonly: locked,
    class: stepperModifierClasses(props),
  })
}

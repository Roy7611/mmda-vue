import { h } from 'vue'
import { NInputNumber } from 'naive-ui'
import type { UiNumberInputProps } from '@mmda/core'
import { emitNumberInputChange, numberInputDecimalsOf, numberInputFormatOf, numberInputModifierClasses, numberInputStepOf } from '@mmda/core'
import { htmlAttributesOf } from '@mmda/vui'

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
    suffix: _suffix,
    kind,
    onChange: _onChange,
    htmlAttributes,
    maxFractionDigits: _maxFractionDigits,
    ...rest
  } = props

  const resolvedFormat = numberInputFormatOf({ format, kind })
  const percent =
    kind === 'percent' || resolvedFormat.trim().toLowerCase().startsWith('p')

  return h(NInputNumber, {
    ...rest,
    ...htmlAttributesOf(props),
    value: (value ?? modelValue ?? null) as number | null,
    min: min ?? (percent ? 0 : undefined),
    max: max ?? (percent ? 100 : undefined),
    step: numberInputStepOf(props),
    precision: numberInputDecimalsOf(props),
    placeholder: placeholder ?? (percent ? '%' : undefined),
    showButton: showSpinButton !== false,
    disabled: disabled === true,
    class: [...numberInputModifierClasses(props)].flat(),
    'onUpdate:value': (next: number | null) =>
      emitNumberInputChange(props, next),
  })
}

import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import { callUiPropFn, type UiProps } from '../props'

export type UiNumberInputKind = 'number' | 'percent'

export interface UiNumberInputProps extends UiProps {
  value?: number | null
  min?: number
  max?: number
  step?: number
  decimals?: number
  format?: string
  placeholder?: string
  disabled?: boolean
  showSpinButton?: boolean
  suffix?: string
  kind?: UiNumberInputKind
  onChange?: (value: number | null) => void
}

export function numberInputModifierClasses(props: UiNumberInputProps): unknown[] {
  return [
    uiCssClass('numberinput'),
    props.kind === 'percent'
      ? uiCssClass('numberinput', 'percent')
      : undefined,
    props.suffix ? uiCssClass('numeric-with-unit') : undefined,
    props.class,
  ]
}

export function numberInputStepOf(
  props: Pick<UiNumberInputProps, 'step' | 'kind'>,
): number {
  if (props.step != null) return Number(props.step)
  return props.kind === 'percent' ? 0.01 : 1
}

export function numberInputFormatOf(
  props: Pick<UiNumberInputProps, 'format' | 'kind'>,
): string {
  if (props.format != null && String(props.format) !== '') {
    return String(props.format)
  }
  return props.kind === 'percent' ? 'p' : 'n'
}

export function numberInputDecimalsOf(
  props: UiNumberInputProps,
): number | undefined {
  const raw = props.decimals ?? props.maxFractionDigits
  if (raw == null || raw === '') return undefined
  const n = Number(raw)
  return Number.isNaN(n) ? undefined : n
}

export function emitNumberInputChange(
  props: UiNumberInputProps,
  value: unknown,
): void {
  let next: number | null = null
  if (value != null && value !== '') {
    if (typeof value === 'object' && 'value' in (value as object)) {
      emitNumberInputChange(props, (value as { value?: unknown }).value)
      return
    }
    const n = Number(value)
    next = Number.isFinite(n) ? n : null
  }
  props.onChange?.(next)
  callUiPropFn(props, 'onUpdate:modelValue', next)
  callUiPropFn(props, 'onUpdate', next)
}

function fieldNumberOf(raw: unknown): number | null {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function numberInputPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiNumberInputProps {
  const kind = (extra.kind as UiNumberInputKind | undefined) ?? 'number'
  const decimalsRaw =
    extra.decimals ??
    extra.maxFractionDigits ??
    (field as { scale?: unknown }).scale ??
    field.numericScale
  const decimals =
    decimalsRaw == null || decimalsRaw === ''
      ? undefined
      : Number(decimalsRaw)
  const draft: UiNumberInputProps = {
    kind,
    min: extra.min as number | undefined,
    max: extra.max as number | undefined,
    step: extra.step as number | undefined,
    format: extra.format as string | undefined,
  }
  return {
    value: fieldNumberOf(context.getFieldValue(field)),
    kind,
    min: draft.min,
    max: draft.max,
    step: numberInputStepOf(draft),
    decimals: decimals != null && !Number.isNaN(decimals) ? decimals : undefined,
    format: numberInputFormatOf(draft),
    placeholder: (extra.placeholder as string | undefined) ?? field.placeholder,
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
    showSpinButton: extra.showSpinButton as boolean | undefined,
    suffix: extra.suffix as string | undefined,
    onChange: (value) => {
      context.setFieldValue(field, value)
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}

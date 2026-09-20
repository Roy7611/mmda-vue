import type { MetaUiField } from '../../metaui/metaui_field'
import { uiCssClass } from '../css'
import type { UiFieldBindContext } from '../field_factory'
import type { UiProps } from '../props'
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
  /** 通用别名：小数位数上限（与 `decimals` 同义，各家数值控件通用）。 */
  maxFractionDigits?: number
}

export function numberInputModifierClasses(props: UiNumberInputProps): unknown[] {
  return [
    uiCssClass('numberinput'),
    props.kind === 'percent'
      ? uiCssClass('numberinput', undefined, 'percent')
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
  // `decimals` 与 `maxFractionDigits` 同义：后者是各家数值控件的通用名。
  const raw = props.decimals ?? props.maxFractionDigits
  if (raw == null) return undefined
  const n = Number(raw)
  return Number.isNaN(n) ? undefined : n
}

function fieldNumberOf(raw: unknown): number | null {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function numberInputPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext
): UiNumberInputProps {
  const kind = 'number'
  const decimalsRaw =
    (field as { scale?: unknown }).scale ??
    field.numericScale
  const decimals =
    decimalsRaw == null || decimalsRaw === ''
      ? undefined
      : Number(decimalsRaw)
  const draft: UiNumberInputProps = {
    kind,
  }
  return {
    value: fieldNumberOf(context.getFieldValue(field)),
    kind,
    min: draft.min,
    max: draft.max,
    step: numberInputStepOf(draft),
    decimals: decimals != null && !Number.isNaN(decimals) ? decimals : undefined,
    format: numberInputFormatOf(draft),
    placeholder: field.placeholder,
    disabled:
      context.isFieldReadonly(field),
    onChange: (value) => {
      context.setFieldValue(field, value)
    },
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...({}),
    },
  }
}

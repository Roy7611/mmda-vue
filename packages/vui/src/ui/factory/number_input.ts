/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/numerictextbox/vue3-getting-started
 * format: https://ej2.syncfusion.com/vue/documentation/numerictextbox/formats
 *
 * chrome 数值输入走 factory.numberInput。vui 名是 numberInput，不要 NumericTextBox / InputNumber。
 * 字段 fldFactory.numberInput / percentInput / positiveNumberInput 译 MetaUiField 后再调本控件。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'

export type UiNumberInputKind = 'number' | 'percent'

export interface UiNumberInputProps extends PropData {
  value?: number | null
  min?: number
  max?: number
  step?: number
  /** 小数位。对应 EJ2 decimals；不要用 maxFractionDigits 当 vui 主名 */
  decimals?: number
  /**
   * 展示格式，语法对齐 EJ2 NumericTextBox `format`。
   * 标准：`n` / `n2`、`p` / `p2`、`c` / `c2`；也可自定义。
   * 缺省：kind percent → `p`，否则 `n`。
   */
  format?: string
  placeholder?: string
  disabled?: boolean
  /** 缺省 true。对应 EJ2 showSpinButton */
  showSpinButton?: boolean
  /** 单位/后缀纯文本（如 KG、%）。不是 htmlAttributes */
  suffix?: string
  /**
   * 展示形态。number = 普通；percent = 百分数。
   * 值语义与现网字段一致：SF percent 仍是 0–1 分数；Prime/Naive percent 仍是 0–100。
   */
  kind?: UiNumberInputKind
  onChange?: (value: number | null) => void
}

export type NumberInputFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
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

export function numberInputDecimalsOf(props: UiNumberInputProps): number | undefined {
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
  props['onUpdate:modelValue']?.(next)
  props.onUpdate?.(next)
}

export function numberInputModifierClasses(props: UiNumberInputProps): unknown[] {
  return [
    'mmda-numberinput',
    props.kind === 'percent' ? 'mmda-numberinput--percent' : undefined,
    props.suffix ? 'mmda-numeric-with-unit' : undefined,
    props.class,
  ]
}

const fieldNumberOf = (raw: unknown): number | null => {
  if (raw == null || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

export function numberInputPropsFromField(
  field: MetaUiField,
  context: NumberInputFieldContext,
  extra: PropData = {},
): UiNumberInputProps {
  const kind = (extra.kind as UiNumberInputKind) ?? 'number'
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
    placeholder: extra.placeholder ?? field.placeholder,
    disabled: extra.disabled ?? context.isFieldReadonly(field),
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
      ...extra.htmlAttributes,
    },
  }
}

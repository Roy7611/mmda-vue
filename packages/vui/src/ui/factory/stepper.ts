/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/stepper/vue-3-getting-started
 *
 * chrome 步骤条走 factory.stepper。vui 名是 stepper，不要 ejs-stepper / StepperComponent / NSteps。
 * 字段 fldFactory.stepper 译 MetaUiField 后再调本控件。值是当前步索引。
 * items 可以是任意行；label/text/icon/status 等用 *Field（字段名或函数）绑定。
 * 不要把 EJ2 StepType / StepperOrientation 类型交给 Logic。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData, UiOrientation } from '../layout/layout'

export type UiStepperDisplay = 'default' | 'indicator' | 'label'
export type UiStepperLabelPosition = 'top' | 'bottom' | 'start' | 'end'
export type UiStepperStatus = 'notStarted' | 'inProgress' | 'completed'

export type UiStepperFieldOf<T, R> =
  | string
  | ((item: T, index: number) => R)

export interface UiStepperItem {
  key?: string
  label?: string
  text?: string
  icon?: string
  optional?: boolean
  disabled?: boolean
  valid?: boolean | null
  status?: UiStepperStatus
  cssClass?: string
}

export interface UiStepperChanging {
  from: number
  to: number
  cancel: boolean
}

export interface UiStepperController {
  next: () => void
  previous: () => void
  reset: () => void
  refresh: () => void
}

export interface UiStepperAnimation {
  enable?: boolean
  duration?: number
  delay?: number
}

export interface UiStepperProps<T = any> extends PropData {
  items?: T[]
  keyField?: UiStepperFieldOf<T, string>
  labelField?: UiStepperFieldOf<T, string>
  textField?: UiStepperFieldOf<T, string>
  iconField?: UiStepperFieldOf<T, string>
  optionalField?: UiStepperFieldOf<T, boolean>
  disabledField?: UiStepperFieldOf<T, boolean>
  validField?: UiStepperFieldOf<T, boolean | null>
  statusField?: UiStepperFieldOf<T, UiStepperStatus>
  cssClassField?: UiStepperFieldOf<T, string>
  value?: number
  orientation?: UiOrientation
  display?: UiStepperDisplay
  labelPosition?: UiStepperLabelPosition
  linear?: boolean
  readOnly?: boolean
  showTooltip?: boolean
  persist?: boolean
  locale?: string
  rtl?: boolean
  animation?: UiStepperAnimation
  template?: unknown
  tooltipTemplate?: unknown
  sanitize?: boolean
  onChange?: (value: number) => void
  'onUpdate:modelValue'?: (value: number) => void
  onUpdate?: (value: number) => void
  onChanging?: (args: UiStepperChanging) => void
  onBeforeStepRender?: (args: unknown) => void
  onReady?: (controller: UiStepperController) => void
}

export type StepperFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

function readBoundField<T, R>(
  item: T,
  index: number,
  binder: UiStepperFieldOf<T, R> | undefined,
  fallbackKey: string,
): R | undefined {
  if (typeof binder === 'function') return binder(item, index)
  const key = binder ?? fallbackKey
  if (item == null || typeof item !== 'object') return undefined
  return (item as Record<string, unknown>)[key] as R | undefined
}

function stringBound<T>(
  item: T,
  index: number,
  binder: UiStepperFieldOf<T, string> | undefined,
  fallbackKey: string,
): string | undefined {
  const raw = readBoundField(item, index, binder, fallbackKey)
  if (raw == null || raw === '') return undefined
  return String(raw)
}

function boolBound<T>(
  item: T,
  index: number,
  binder: UiStepperFieldOf<T, boolean> | undefined,
  fallbackKey: string,
): boolean | undefined {
  const raw = readBoundField(item, index, binder, fallbackKey)
  if (raw == null) return undefined
  return Boolean(raw)
}

function statusBound<T>(
  item: T,
  index: number,
  binder: UiStepperFieldOf<T, UiStepperStatus> | undefined,
): UiStepperStatus | undefined {
  const raw = readBoundField(item, index, binder, 'status')
  if (raw === 'notStarted' || raw === 'inProgress' || raw === 'completed') {
    return raw
  }
  return undefined
}

export function stepperIndexOf(raw: unknown): number {
  if (raw == null || raw === '') return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function stepperValueOf(props: UiStepperProps): number {
  if (props.value !== undefined) return stepperIndexOf(props.value)
  if (props.modelValue !== undefined) return stepperIndexOf(props.modelValue)
  return 0
}

/** 把任意行（含 *Field 绑定）规范成 UiStepperItem[]。皮肤只吃这个。 */
export function stepperItemsOf(props: UiStepperProps): UiStepperItem[] {
  const rows = Array.isArray(props.items) ? props.items : []
  return rows.map((item, index) => {
    const validRaw = readBoundField(item, index, props.validField, 'valid')
    return {
      key: stringBound(item, index, props.keyField, 'key'),
      label: stringBound(item, index, props.labelField, 'label'),
      text: stringBound(item, index, props.textField, 'text'),
      icon: stringBound(item, index, props.iconField, 'icon'),
      optional: boolBound(item, index, props.optionalField, 'optional'),
      disabled: boolBound(item, index, props.disabledField, 'disabled'),
      valid:
        validRaw === undefined
          ? undefined
          : validRaw == null
            ? null
            : Boolean(validRaw),
      status: statusBound(item, index, props.statusField),
      cssClass: stringBound(item, index, props.cssClassField, 'cssClass'),
    }
  })
}

export function stepperOrientationOf(props: UiStepperProps): UiOrientation {
  return props.orientation === 'vertical' ? 'vertical' : 'horizontal'
}

export function stepperDisplayOf(props: UiStepperProps): UiStepperDisplay {
  if (props.display === 'indicator' || props.display === 'label') return props.display
  return 'default'
}

export function stepperLabelPositionOf(
  props: UiStepperProps,
): UiStepperLabelPosition {
  const pos = props.labelPosition
  if (pos === 'top' || pos === 'bottom' || pos === 'start' || pos === 'end') return pos
  return 'bottom'
}

export function stepperOrientationToEj2(
  orientation: UiOrientation,
): 'Horizontal' | 'Vertical' {
  return orientation === 'vertical' ? 'Vertical' : 'Horizontal'
}

export function stepperDisplayToEj2(display: UiStepperDisplay): 'Default' | 'Indicator' | 'Label' {
  if (display === 'indicator') return 'Indicator'
  if (display === 'label') return 'Label'
  return 'Default'
}

export function stepperLabelPositionToEj2(
  position: UiStepperLabelPosition,
): 'Top' | 'Bottom' | 'Start' | 'End' {
  if (position === 'top') return 'Top'
  if (position === 'start') return 'Start'
  if (position === 'end') return 'End'
  return 'Bottom'
}

export function stepperStatusToEj2(
  status?: UiStepperStatus,
): 'NotStarted' | 'InProgress' | 'Completed' | undefined {
  if (status === 'notStarted') return 'NotStarted'
  if (status === 'inProgress') return 'InProgress'
  if (status === 'completed') return 'Completed'
  return undefined
}

export function emitStepperChange(props: UiStepperProps, value: number): void {
  props.onChange?.(value)
  props['onUpdate:modelValue']?.(value)
  props.onUpdate?.(value)
}

export const noopStepperController: UiStepperController = {
  next: () => undefined,
  previous: () => undefined,
  reset: () => undefined,
  refresh: () => undefined,
}

export function stepperModifierClasses(props: UiStepperProps): unknown[] {
  return [
    'mmda-stepper',
    `mmda-stepper--${stepperOrientationOf(props)}`,
    props.display && props.display !== 'default'
      ? `mmda-stepper--${props.display}`
      : undefined,
    props.linear ? 'mmda-stepper--linear' : undefined,
    props.readOnly ? 'mmda-stepper--readonly' : undefined,
    props.class,
  ]
}

export function stepperPropsFromField(
  field: MetaUiField,
  context: StepperFieldContext,
  extra: PropData = {},
): UiStepperProps {
  return {
    items: extra.items,
    keyField: extra.keyField,
    labelField: extra.labelField,
    textField: extra.textField,
    iconField: extra.iconField,
    optionalField: extra.optionalField,
    disabledField: extra.disabledField,
    validField: extra.validField,
    statusField: extra.statusField,
    cssClassField: extra.cssClassField,
    value: stepperIndexOf(context.getFieldValue(field)),
    orientation: extra.orientation,
    display: extra.display,
    labelPosition: extra.labelPosition,
    linear: extra.linear,
    readOnly: extra.readOnly ?? context.isFieldReadonly(field),
    showTooltip: extra.showTooltip,
    persist: extra.persist,
    locale: extra.locale,
    rtl: extra.rtl,
    animation: extra.animation,
    template: extra.template,
    tooltipTemplate: extra.tooltipTemplate,
    sanitize: extra.sanitize,
    onChange: (value) => {
      context.setFieldValue(field, value)
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    onChanging: extra.onChanging,
    onBeforeStepRender: extra.onBeforeStepRender,
    onReady: extra.onReady,
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...extra.htmlAttributes,
    },
  }
}

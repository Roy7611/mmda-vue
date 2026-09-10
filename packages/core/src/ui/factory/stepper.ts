import type { MetaUiField } from '../../metaui/metaui_field'
import type { UiOrientation } from '../layout'
import type { UiFieldBindContext } from '../field_factory'
import { type UiProps } from '../props'
import { uiCssClass } from '../css'

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

export interface UiStepperProps<T = any> extends UiProps {
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
  onUpdate?: (value: number) => void
  onChanging?: (args: UiStepperChanging) => void
  onBeforeStepRender?: (args: unknown) => void
  onReady?: (controller: UiStepperController) => void
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

export function stepperDisplayToEj2(
  display: UiStepperDisplay,
): 'Default' | 'Indicator' | 'Label' {
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

export const noopStepperController: UiStepperController = {
  next: () => undefined,
  previous: () => undefined,
  reset: () => undefined,
  refresh: () => undefined,
}

export function stepperModifierClasses(props: UiStepperProps): unknown[] {
  return [
    uiCssClass('stepper'),
    uiCssClass('stepper', undefined, stepperOrientationOf(props)),
    props.display && props.display !== 'default'
      ? uiCssClass('stepper', undefined, props.display)
      : undefined,
    props.linear ? uiCssClass('stepper', undefined, 'linear') : undefined,
    props.readOnly ? uiCssClass('stepper', undefined, 'readonly') : undefined,
    props.class,
  ]
}


export function stepperPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiStepperProps {
  return {
    items: extra.items as UiStepperProps['items'],
    keyField: extra.keyField as UiStepperProps['keyField'],
    labelField: extra.labelField as UiStepperProps['labelField'],
    textField: extra.textField as UiStepperProps['textField'],
    iconField: extra.iconField as UiStepperProps['iconField'],
    optionalField: extra.optionalField as UiStepperProps['optionalField'],
    disabledField: extra.disabledField as UiStepperProps['disabledField'],
    validField: extra.validField as UiStepperProps['validField'],
    statusField: extra.statusField as UiStepperProps['statusField'],
    cssClassField: extra.cssClassField as UiStepperProps['cssClassField'],
    value: stepperIndexOf(context.getFieldValue(field)),
    orientation: extra.orientation as UiStepperProps['orientation'],
    display: extra.display as UiStepperProps['display'],
    labelPosition: extra.labelPosition as UiStepperProps['labelPosition'],
    linear: extra.linear as boolean | undefined,
    readOnly:
      (extra.readOnly as boolean | undefined) ?? context.isFieldReadonly(field),
    showTooltip: extra.showTooltip as boolean | undefined,
    persist: extra.persist as boolean | undefined,
    locale: extra.locale as string | undefined,
    rtl: extra.rtl as boolean | undefined,
    animation: extra.animation as UiStepperProps['animation'],
    template: extra.template as UiStepperProps['template'],
    tooltipTemplate: extra.tooltipTemplate as UiStepperProps['tooltipTemplate'],
    sanitize: extra.sanitize as boolean | undefined,
    onChange: (value) => {
      context.setFieldValue(field, value)
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
    },
    onChanging: extra.onChanging as UiStepperProps['onChanging'],
    onBeforeStepRender: extra.onBeforeStepRender as UiStepperProps['onBeforeStepRender'],
    onReady: extra.onReady as UiStepperProps['onReady'],
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}

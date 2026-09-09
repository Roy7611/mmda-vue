import { callUiPropFn, type UiProps } from '../props'

export type UiDatePrecision = 'day' | 'month'

export type UiDateShortcutValue = Date | [Date, Date] | null

export type UiDateShortcut = {
  label: string
  value: UiDateShortcutValue | (() => UiDateShortcutValue)
}

export type UiDateShortcutKind = 'day' | 'month' | 'datetime' | 'time' | 'range'

export interface UiDateInputProps extends UiProps {
  min?: Date
  max?: Date
  format?: string
  placeholder?: string
  disabled?: boolean
  allowInput?: boolean
  showClear?: boolean
  openOnFocus?: boolean
  inputFormats?: string[]
  readonly?: boolean
  showShortcuts?: boolean
  shortcuts?: UiDateShortcut[]
  firstDayOfWeek?: number
  onChange?: (value: unknown) => void
  onClear?: () => void
  onFocus?: () => void
  onBlur?: () => void
}

export const DATE_PICKER_FORMAT = 'yyyy-MM-dd'
export const MONTH_PICKER_FORMAT = 'yyyy-MM'
export const DATE_TIME_PICKER_FORMAT = 'yyyy-MM-dd HH:mm:ss'
export const TIME_PICKER_FORMAT = 'HH:mm:ss'
export const DATE_RANGE_PICKER_FORMAT = 'yyyy-MM-dd'
export const DATE_RANGE_SEPARATOR = ' ~ '
export const DATE_TIME_STEP_MINUTES = 30
export const DATE_PICKER_FIRST_DAY_OF_WEEK = 1

export function dateOf(raw: unknown): Date | null {
  if (raw == null || raw === '') return null
  if (raw instanceof Date) {
    return Number.isNaN(raw.getTime()) ? null : raw
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    const date = new Date(raw)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof raw === 'string') {
    const date = new Date(raw)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function startOfLocalMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function datePickerDateOf(props: UiProps): Date | null | undefined {
  if (props.value !== undefined) return dateOf(props.value)
  if (props.modelValue !== undefined) return dateOf(props.modelValue)
  return undefined
}

export function datePickerMinOf(props: UiProps): Date | null | undefined {
  if (props.min !== undefined) return dateOf(props.min)
  if (props.minDate !== undefined) return dateOf(props.minDate)
  return undefined
}

export function datePickerMaxOf(props: UiProps): Date | null | undefined {
  if (props.max !== undefined) return dateOf(props.max)
  if (props.maxDate !== undefined) return dateOf(props.maxDate)
  return undefined
}

export function datePickerAllowInput(props: UiProps): boolean {
  if (props.allowInput != null) return props.allowInput === true
  if (props.manualInput != null) return props.manualInput === true
  if (props.allowEdit != null) return props.allowEdit === true
  return false
}

export function datePickerFirstDayOfWeek(props: UiProps): number {
  const raw = props.firstDayOfWeek
  return typeof raw === 'number' ? raw : DATE_PICKER_FIRST_DAY_OF_WEEK
}

export function datePickerShowClear(
  props: UiProps,
  fieldNullable?: boolean,
): boolean {
  if (props.showClear != null) return props.showClear !== false
  if (fieldNullable != null) return fieldNullable !== false
  return true
}

export function datePickerFormatOf(
  props: Pick<{ format?: string; precision?: UiDatePrecision }, 'format' | 'precision'>,
  fallback = DATE_PICKER_FORMAT,
): string {
  if (props.format) return props.format
  if (props.precision === 'month') return MONTH_PICKER_FORMAT
  return fallback
}

export function emitDateChange(props: UiProps, value: unknown): void {
  callUiPropFn(props, 'onChange', value)
  callUiPropFn(props, 'onUpdate:modelValue', value)
  callUiPropFn(props, 'onUpdate', value)
  callUiPropFn(props, 'onUpdatePicker', value)
}

export function emitDateClear(props: UiProps): void {
  callUiPropFn(props, 'onClear')
}

export function emitDateFocus(props: UiProps): void {
  callUiPropFn(props, 'onFocus')
}

export function emitDateBlur(props: UiProps): void {
  callUiPropFn(props, 'onBlur')
}

export function resolveDateShortcutValue(
  item: UiDateShortcut,
): UiDateShortcutValue {
  const raw = typeof item.value === 'function' ? item.value() : item.value
  if (raw == null) return null
  if (Array.isArray(raw)) {
    const start = dateOf(raw[0])
    const end = dateOf(raw[1])
    if (!start || !end) return null
    return [start, end]
  }
  return dateOf(raw)
}

function builtinShortcuts(kind: UiDateShortcutKind): UiDateShortcut[] {
  if (kind === 'time') return []
  if (kind === 'month') {
    return [
      {
        label: '本月',
        value: () => startOfLocalMonth(new Date()),
      },
      {
        label: '上月',
        value: () => {
          const now = new Date()
          return new Date(now.getFullYear(), now.getMonth() - 1, 1)
        },
      },
    ]
  }
  if (kind === 'range') {
    return [
      {
        label: '今天',
        value: () => {
          const day = startOfLocalDay(new Date())
          return [day, day]
        },
      },
      {
        label: '昨天',
        value: () => {
          const now = new Date()
          const day = startOfLocalDay(
            new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
          )
          return [day, day]
        },
      },
    ]
  }
  return [
    {
      label: '今天',
      value: () =>
        kind === 'datetime' ? new Date() : startOfLocalDay(new Date()),
    },
    {
      label: '昨天',
      value: () => {
        const now = new Date()
        const day = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1,
        )
        return kind === 'datetime' ? day : startOfLocalDay(day)
      },
    },
  ]
}

export function resolveDateShortcuts(
  kind: UiDateShortcutKind,
  props: Pick<UiDateInputProps, 'showShortcuts' | 'shortcuts'>,
): UiDateShortcut[] {
  const custom = props.shortcuts ?? []
  const builtin = props.showShortcuts ? builtinShortcuts(kind) : []
  return [...builtin, ...custom]
}

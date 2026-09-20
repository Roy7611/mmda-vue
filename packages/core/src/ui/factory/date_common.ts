import type { UiProps } from '../props'
export type UiDatePrecision = 'day' | 'month'

export type UiDateShortcutValue = Date | [Date, Date] | null

export type UiDateShortcut = {
  label: string
  value: UiDateShortcutValue | (() => UiDateShortcutValue)
}

export type UiDateShortcutKind = 'day' | 'month' | 'datetime' | 'time' | 'range'

/**
 * 日期类控件（picker / range / datetime / time）共用的**具名事件成员**。
 * 事件出口只有 `emitDateChange` / `emitDateClear` / `emitDateFocus` / `emitDateBlur`，
 * 参数统一收这个类型——不要再靠袋键裸读（`UiProps` 已无索引签名）。
 */
export interface UiDateEmitProps extends UiProps {
  onChange?: (value: unknown) => void
  /** 产品侧回调：选中的值变化（业务 Logic 直接用，如 MES 的排产日历）。 */
  onUpdatePicker?: (value: unknown) => void
  onClear?: () => void
  onFocus?: () => void
  onBlur?: () => void
}

export interface UiDateInputProps extends UiDateEmitProps {
  min?: Date
  max?: Date
  /** 通用别名：与 `min` / `max` 同义（厂商与 MES 元数据都用这两个名字）。 */
  minDate?: Date
  maxDate?: Date
  format?: string
  placeholder?: string
  disabled?: boolean
  allowInput?: boolean
  /** 通用别名：与 `allowInput` 同义。 */
  manualInput?: boolean
  allowEdit?: boolean
  showClear?: boolean
  openOnFocus?: boolean
  inputFormats?: string[]
  readonly?: boolean
  showShortcuts?: boolean
  shortcuts?: UiDateShortcut[]
  firstDayOfWeek?: number
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

export function datePickerDateOf(props: { value?: Date | null }): Date | null | undefined {
  if (props.value !== undefined) return dateOf(props.value)
  return undefined
}

export function datePickerMinOf(props: UiDateInputProps): Date | null | undefined {
  const raw = props.minDate ?? props.min
  if (raw !== undefined) return dateOf(raw)
  return undefined
}

export function datePickerMaxOf(props: UiDateInputProps): Date | null | undefined {
  const raw = props.maxDate ?? props.max
  if (raw !== undefined) return dateOf(raw)
  return undefined
}

export function datePickerAllowInput(props: UiDateInputProps): boolean {
  const raw = props.allowInput ?? props.manualInput ?? props.allowEdit
  return raw === true
}

export function datePickerFirstDayOfWeek(props: UiDateInputProps): number {
  const raw = props.firstDayOfWeek
  return typeof raw === 'number' ? raw : DATE_PICKER_FIRST_DAY_OF_WEEK
}

export function datePickerShowClear(
  props: UiDateInputProps,
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


export function emitDateClear(props: UiDateEmitProps): void {
  props.onClear?.()
}

export function emitDateFocus(props: UiDateEmitProps): void {
  props.onFocus?.()
}

export function emitDateBlur(props: UiDateEmitProps): void {
  props.onBlur?.()
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

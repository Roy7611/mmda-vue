/*
 * Syncfusion: https://ej2.syncfusion.com/vue/documentation/api/datepicker/
 *
 * chrome 带输入框选日走 factory.datePicker。选月是 precision: 'month'（factory.monthPicker 捷径），不是独立文件。
 * 月视面板仍是 factory.calendar。字段 fldFactory.datePicker 译 MetaUiField 后再调本控件。
 */
import type { MetaUiField } from '@mmda/core'
import type { PropData } from '../layout/layout'

export const DATE_PICKER_FORMAT = 'yyyy-MM-dd'
export const MONTH_PICKER_FORMAT = 'yyyy-MM'
export const DATE_TIME_PICKER_FORMAT = 'yyyy-MM-dd HH:mm:ss'
export const TIME_PICKER_FORMAT = 'HH:mm:ss'
export const DATE_RANGE_PICKER_FORMAT = 'yyyy-MM-dd'
export const DATE_RANGE_SEPARATOR = ' ~ '
export const DATE_TIME_STEP_MINUTES = 30
export const DATE_PICKER_FIRST_DAY_OF_WEEK = 1

export type UiDatePrecision = 'day' | 'month'

export type UiDateShortcutValue = Date | [Date, Date] | null

export type UiDateShortcut = {
  label: string
  value: UiDateShortcutValue | (() => UiDateShortcutValue)
}

export type UiDateShortcutKind = 'day' | 'month' | 'datetime' | 'time' | 'range'

export interface UiDateInputProps extends PropData {
  min?: Date
  max?: Date
  format?: string
  placeholder?: string
  disabled?: boolean
  /** 允许手输。缺省 false：只从面板选 */
  allowInput?: boolean
  showClear?: boolean
  openOnFocus?: boolean
  inputFormats?: string[]
  readonly?: boolean
  /** true 时内置今天、昨天（选月：本月、上月） */
  showShortcuts?: boolean
  /** 自定义快捷，接在内置后面 */
  shortcuts?: UiDateShortcut[]
  /** `0` = 周日。缺省 `1`（周一） */
  firstDayOfWeek?: number
  onChange?: (value: unknown) => void
  onClear?: () => void
  onFocus?: () => void
  onBlur?: () => void
}

export interface UiDatePickerProps extends UiDateInputProps {
  value?: Date | null
  precision?: UiDatePrecision
}

export type DatePickerFieldContext = {
  getFieldValue: (field: MetaUiField) => unknown
  setFieldValue: (field: MetaUiField, value: unknown) => void
  isFieldReadonly: (field: MetaUiField | string) => boolean
}

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

export function datePickerDateOf(props: PropData): Date | null | undefined {
  if (props.value !== undefined) return dateOf(props.value)
  if (props.modelValue !== undefined) return dateOf(props.modelValue)
  return undefined
}

export function datePickerMinOf(props: PropData): Date | null | undefined {
  if (props.min !== undefined) return dateOf(props.min)
  if (props.minDate !== undefined) return dateOf(props.minDate)
  return undefined
}

export function datePickerMaxOf(props: PropData): Date | null | undefined {
  if (props.max !== undefined) return dateOf(props.max)
  if (props.maxDate !== undefined) return dateOf(props.maxDate)
  return undefined
}

export function datePickerAllowInput(props: PropData): boolean {
  if (props.allowInput != null) return props.allowInput === true
  if (props.manualInput != null) return props.manualInput === true
  if (props.allowEdit != null) return props.allowEdit === true
  return false
}

export function datePickerFirstDayOfWeek(props: PropData): number {
  const raw = props.firstDayOfWeek
  return typeof raw === 'number' ? raw : DATE_PICKER_FIRST_DAY_OF_WEEK
}

export function datePickerShowClear(
  props: PropData,
  fieldNullable?: boolean,
): boolean {
  if (props.showClear != null) return props.showClear !== false
  if (fieldNullable != null) return fieldNullable !== false
  return true
}

export function datePickerFormatOf(
  props: Pick<UiDatePickerProps, 'format' | 'precision'>,
  fallback = DATE_PICKER_FORMAT,
): string {
  if (props.format) return props.format
  if (props.precision === 'month') return MONTH_PICKER_FORMAT
  return fallback
}

export function datePickerModifierClasses(props: UiDatePickerProps): unknown[] {
  const month =
    props.precision === 'month' ? 'mmda-datepicker--month' : undefined
  return ['mmda-datepicker', month, props.class]
}

export function emitDateChange(props: PropData, value: unknown): void {
  props.onChange?.(value)
  props['onUpdate:modelValue']?.(value)
  props.onUpdate?.(value)
  props.onUpdatePicker?.(value)
}

export function emitDateClear(props: PropData): void {
  props.onClear?.()
}

export function emitDateFocus(props: PropData): void {
  props.onFocus?.()
}

export function emitDateBlur(props: PropData): void {
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

/** Prime `dateFormat`：`yy` 是四位年 */
export function datePickerPrimeFormat(format: string): string {
  return format.replace(/yyyy/g, 'yy').replace(/MM/g, 'mm')
}

/** Naive / dayjs：`YYYY-MM-DD` */
export function datePickerNaiveFormat(format: string): string {
  return format.replace(/yyyy/g, 'YYYY').replace(/dd/g, 'DD')
}

/** Naive `first-day-of-week`：0 是周一 */
export function datePickerNaiveFirstDayOfWeek(vuiDay: number): number {
  return (vuiDay + 6) % 7
}

function fieldDateProps(
  field: MetaUiField,
  context: DatePickerFieldContext,
  extra: PropData,
): UiDateInputProps {
  return {
    min: datePickerMinOf(extra) ?? undefined,
    max: datePickerMaxOf(extra) ?? undefined,
    format: extra.format,
    placeholder: extra.placeholder ?? field.placeholder,
    disabled: extra.disabled ?? context.isFieldReadonly(field),
    allowInput: datePickerAllowInput(extra),
    showClear: datePickerShowClear(extra, field.nullable),
    openOnFocus: extra.openOnFocus,
    inputFormats: extra.inputFormats,
    readonly: extra.readonly,
    showShortcuts: extra.showShortcuts,
    shortcuts: extra.shortcuts,
    firstDayOfWeek: extra.firstDayOfWeek,
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...extra.htmlAttributes,
    },
  }
}

export function datePickerPropsFromField(
  field: MetaUiField,
  context: DatePickerFieldContext,
  extra: PropData = {},
): UiDatePickerProps {
  const base = fieldDateProps(field, context, extra)
  return {
    ...base,
    value: dateOf(context.getFieldValue(field)),
    precision: extra.precision === 'month' ? 'month' : 'day',
    onChange: (value) => {
      context.setFieldValue(field, value)
      if (typeof extra.onChange === 'function') extra.onChange(value)
      if (typeof extra.onUpdate === 'function') extra.onUpdate(value)
      if (typeof extra.onUpdatePicker === 'function') extra.onUpdatePicker(value)
    },
    onClear: extra.onClear,
    onFocus: extra.onFocus,
    onBlur: extra.onBlur,
  }
}

export function monthPickerPropsFromField(
  field: MetaUiField,
  context: DatePickerFieldContext,
  extra: PropData = {},
): UiDatePickerProps {
  return datePickerPropsFromField(field, context, {
    ...extra,
    precision: 'month',
    format: extra.format ?? MONTH_PICKER_FORMAT,
  })
}

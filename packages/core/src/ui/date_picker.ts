import type { MetaUiField } from '../metaui/metaui_field'
import { uiCssClass } from './css'
import type { UiFieldBindContext } from './field_factory'
import { callUiBagFn, type UiProps } from './props'

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

export interface UiDatePickerProps extends UiDateInputProps {
  value?: Date | null
  precision?: UiDatePrecision
}

export function datePickerModifierClasses(props: UiDatePickerProps): unknown[] {
  const month =
    props.precision === 'month'
      ? uiCssClass('datepicker', 'month')
      : undefined
  return [uiCssClass('datepicker'), month, props.class]
}

export interface UiDateTimePickerProps extends UiDateInputProps {
  value?: Date | null
  /** 分钟步进；缺省见皮肤 */
  step?: number
}

export function dateTimePickerModifierClasses(
  props: UiDateTimePickerProps,
): unknown[] {
  return [uiCssClass('datetimepicker'), props.class]
}

export interface UiTimePickerProps extends UiProps {
  value?: Date | null
  format?: string
  placeholder?: string
  disabled?: boolean
  allowInput?: boolean
  showClear?: boolean
  step?: number
  onChange?: (value: unknown) => void
  onClear?: () => void
}

export function timePickerModifierClasses(props: UiTimePickerProps): unknown[] {
  return [uiCssClass('timepicker'), props.class]
}

export type UiDateRangeValue = [Date, Date] | null

export interface UiDateRangePickerProps extends UiDateInputProps {
  value?: UiDateRangeValue
  separator?: string
  minDays?: number
  maxDays?: number
}

export function dateRangePickerModifierClasses(
  props: UiDateRangePickerProps,
): unknown[] {
  return [uiCssClass('daterangepicker'), props.class]
}

export type UiCalendarSelection = 'single' | 'multiple'
export type UiCalendarView = 'month' | 'year' | 'decade'
export type UiCalendarValue = Date | Date[] | null

export interface UiCalendarDayCell {
  date: Date
  selected?: boolean
  disabled?: boolean
  otherMonth?: boolean
  today?: boolean
}

export interface UiCalendarProps<TNode = any> extends UiProps {
  value?: UiCalendarValue
  selectionMode?: UiCalendarSelection
  min?: Date
  max?: Date
  disabled?: boolean
  firstDayOfWeek?: number
  view?: UiCalendarView
  depth?: UiCalendarView
  showTodayButton?: boolean
  showOtherMonth?: boolean
  isDateDisabled?: (date: Date) => boolean
  dayCellRenderer?: (cell: UiCalendarDayCell) => TNode
  locale?: string
  onChange?: (value: UiCalendarValue) => void
}

export function calendarModifierClasses(props: {
  selectionMode?: UiCalendarSelection
  showOtherMonth?: boolean
  class?: unknown
}): unknown[] {
  const multiple =
    props.selectionMode === 'multiple'
      ? uiCssClass('calendar', 'multiple')
      : undefined
  const noOther =
    props.showOtherMonth === false
      ? uiCssClass('calendar', 'no-other-month')
      : undefined
  return [uiCssClass('calendar'), multiple, noOther, props.class]
}

export function calendarBoundValue(
  props: UiCalendarProps,
): UiCalendarValue | undefined {
  const raw = props.value !== undefined ? props.value : props.modelValue
  if (raw === undefined) return undefined
  if (props.selectionMode === 'multiple') {
    if (raw == null) return []
    return Array.isArray(raw) ? (raw as Date[]) : [raw as Date]
  }
  return Array.isArray(raw) ? ((raw[0] as Date) ?? null) : (raw as UiCalendarValue)
}

export function sameCalendarDay(a?: Date | null, b?: Date | null): boolean {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function calendarDaySelected(
  value: UiCalendarValue | undefined,
  date: Date,
): boolean {
  if (value == null) return false
  if (Array.isArray(value)) return value.some((item) => sameCalendarDay(item, date))
  return sameCalendarDay(value, date)
}

export function calendarEj2View(
  view?: UiCalendarView,
): 'Month' | 'Year' | 'Decade' | undefined {
  if (!view) return undefined
  if (view === 'year') return 'Year'
  if (view === 'decade') return 'Decade'
  return 'Month'
}

export function calendarPrimeView(
  view?: UiCalendarView,
): 'date' | 'month' | 'year' | undefined {
  if (!view) return undefined
  if (view === 'year') return 'month'
  if (view === 'decade') return 'year'
  return 'date'
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function isCalendarDateDisabled(
  date: Date,
  props: Pick<UiCalendarProps, 'min' | 'max' | 'isDateDisabled'>,
): boolean {
  if (props.min && startOfDay(date).getTime() < startOfDay(props.min).getTime()) {
    return true
  }
  if (props.max && startOfDay(date).getTime() > startOfDay(props.max).getTime()) {
    return true
  }
  return props.isDateDisabled?.(date) === true
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
  props: Pick<UiDatePickerProps, 'format' | 'precision'>,
  fallback = DATE_PICKER_FORMAT,
): string {
  if (props.format) return props.format
  if (props.precision === 'month') return MONTH_PICKER_FORMAT
  return fallback
}

export function emitDateChange(props: UiProps, value: unknown): void {
  callUiBagFn(props, 'onChange', value)
  callUiBagFn(props, 'onUpdate:modelValue', value)
  callUiBagFn(props, 'onUpdate', value)
  callUiBagFn(props, 'onUpdatePicker', value)
}

export function emitDateClear(props: UiProps): void {
  callUiBagFn(props, 'onClear')
}

export function emitDateFocus(props: UiProps): void {
  callUiBagFn(props, 'onFocus')
}

export function emitDateBlur(props: UiProps): void {
  callUiBagFn(props, 'onBlur')
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

function fieldDateProps(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps,
): UiDateInputProps {
  return {
    min: datePickerMinOf(extra) ?? undefined,
    max: datePickerMaxOf(extra) ?? undefined,
    format: extra.format as string | undefined,
    placeholder: (extra.placeholder as string | undefined) ?? field.placeholder,
    disabled:
      (extra.disabled as boolean | undefined) ?? context.isFieldReadonly(field),
    allowInput: datePickerAllowInput(extra),
    showClear: datePickerShowClear(extra, field.nullable),
    openOnFocus: extra.openOnFocus as boolean | undefined,
    inputFormats: extra.inputFormats as string[] | undefined,
    readonly: extra.readonly as boolean | undefined,
    showShortcuts: extra.showShortcuts as boolean | undefined,
    shortcuts: extra.shortcuts as UiDateShortcut[] | undefined,
    firstDayOfWeek: extra.firstDayOfWeek as number | undefined,
    class: extra.class,
    htmlAttributes: {
      name: field.fieldName,
      id: field.fieldName,
      ...((extra.htmlAttributes as Record<string, string> | undefined) ?? {}),
    },
  }
}

export function datePickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
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
    onClear: extra.onClear as UiDateInputProps['onClear'],
    onFocus: extra.onFocus as UiDateInputProps['onFocus'],
    onBlur: extra.onBlur as UiDateInputProps['onBlur'],
  }
}

export function monthPickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiDatePickerProps {
  return datePickerPropsFromField(field, context, {
    ...extra,
    precision: 'month',
    format: (extra.format as string | undefined) ?? MONTH_PICKER_FORMAT,
  })
}

export function dateTimePickerStepOf(props: UiProps): number {
  return typeof props.step === 'number' ? props.step : DATE_TIME_STEP_MINUTES
}

export function dateTimePickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiDateTimePickerProps {
  const { precision: _precision, ...base } = datePickerPropsFromField(
    field,
    context,
    extra,
  )
  return {
    ...base,
    value: dateOf(context.getFieldValue(field)),
    format: (extra.format as string | undefined) ?? DATE_TIME_PICKER_FORMAT,
    step: dateTimePickerStepOf(extra),
  }
}

export function timePickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiTimePickerProps {
  const { precision: _precision, ...base } = datePickerPropsFromField(
    field,
    context,
    extra,
  )
  return {
    ...base,
    value: dateOf(context.getFieldValue(field)),
    format: (extra.format as string | undefined) ?? TIME_PICKER_FORMAT,
    step: dateTimePickerStepOf(extra),
    showShortcuts: false,
    shortcuts: undefined,
  }
}

export function dateRangePickerSeparatorOf(props: UiProps): string {
  return typeof props.separator === 'string' && props.separator.length
    ? props.separator
    : DATE_RANGE_SEPARATOR
}

export function dateRangeValueOf(raw: unknown): UiDateRangeValue | undefined {
  if (raw === undefined) return undefined
  if (raw == null) return null
  if (!Array.isArray(raw) || raw.length < 2) return null
  const start = dateOf(raw[0])
  const end = dateOf(raw[1])
  if (!start || !end) return null
  return [start, end]
}

export function dateRangePickerValueOf(
  props: UiProps,
): UiDateRangeValue | undefined {
  if (props.value !== undefined) return dateRangeValueOf(props.value)
  if (props.modelValue !== undefined) return dateRangeValueOf(props.modelValue)
  return undefined
}

export function dateRangePickerPropsFromField(
  field: MetaUiField,
  context: UiFieldBindContext,
  extra: UiProps = {},
): UiDateRangePickerProps {
  const { precision: _precision, ...base } = datePickerPropsFromField(
    field,
    context,
    extra,
  )
  return {
    ...base,
    value: dateRangeValueOf(context.getFieldValue(field)) ?? null,
    format: (extra.format as string | undefined) ?? DATE_RANGE_PICKER_FORMAT,
    separator: dateRangePickerSeparatorOf(extra),
    minDays: extra.minDays as number | undefined,
    maxDays: extra.maxDays as number | undefined,
  }
}

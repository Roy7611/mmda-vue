import { h } from 'vue'
import { NDatePicker } from 'naive-ui'
import type { UiCalendarProps } from '@mmda/vui'
import {
  calendarBoundValue,
  calendarModifierClasses,
  emitCalendarChange,
  htmlAttributesOf,
  isCalendarDateDisabled,
  startOfDay,
} from '@mmda/vui'

function toTimestamp(value: Date | null | undefined): number | null {
  if (!value) return null
  return startOfDay(value).getTime()
}

function fromTimestamp(value: number | null | undefined): Date | null {
  if (value == null) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function naiveType(props: UiCalendarProps): 'date' | 'dates' | 'month' | 'year' {
  if (props.selectionMode === 'multiple') return 'dates'
  if (props.view === 'year') return 'month'
  if (props.view === 'decade') return 'year'
  return 'date'
}

export function createCalendar(props: UiCalendarProps) {
  const {
    value: _value,
    modelValue: _modelValue,
    selectionMode,
    min: _min,
    max: _max,
    disabled,
    firstDayOfWeek,
    view: _view,
    depth: _depth,
    showTodayButton: _showTodayButton,
    showOtherMonth: _showOtherMonth,
    isDateDisabled,
    dayCellRenderer: _dayCellRenderer,
    locale: _locale,
    onChange: _onChange,
    htmlAttributes,
    ...rest
  } = props

  const multiple = selectionMode === 'multiple'
  const bound = calendarBoundValue(props)
  const type = naiveType(props)

  const modelValue = multiple
    ? (Array.isArray(bound) ? bound : [])
        .map((item) => toTimestamp(item))
        .filter((item): item is number => item != null)
    : toTimestamp((bound as Date | null | undefined) ?? null)

  return h(NDatePicker, {
    ...rest,
    ...htmlAttributesOf(props),
    panel: true,
    type,
    value: modelValue,
    'onUpdate:value': (next: number | number[] | null) => {
      if (multiple) {
        const dates = Array.isArray(next)
          ? next.map(fromTimestamp).filter((item): item is Date => !!item)
          : []
        emitCalendarChange(props, dates)
        return
      }
      emitCalendarChange(props, fromTimestamp(typeof next === 'number' ? next : null))
    },
    disabled,
    ...(firstDayOfWeek != null ? { firstDayOfWeek } : {}),
    isDateDisabled: (ts: number) => isCalendarDateDisabled(new Date(ts), props),
    class: [...calendarModifierClasses(props)].flat(),
  })
}

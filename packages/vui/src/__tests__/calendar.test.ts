import { describe, expect, it } from 'vitest'
import {
  calendarBoundValue,
  calendarEj2View,
  calendarPrimeView,
  isCalendarDateDisabled,
} from '../ui/factory/calendar'

describe('calendar contract helpers', () => {
  it('coerces multiple value to an array', () => {
    const day = new Date(2020, 0, 1)
    expect(
      calendarBoundValue({ selectionMode: 'multiple', value: day }),
    ).toEqual([day])
  })

  it('maps views to EJ2 and Prime names', () => {
    expect(calendarEj2View('month')).toBe('Month')
    expect(calendarEj2View('year')).toBe('Year')
    expect(calendarEj2View('decade')).toBe('Decade')
    expect(calendarPrimeView('month')).toBe('date')
    expect(calendarPrimeView('year')).toBe('month')
    expect(calendarPrimeView('decade')).toBe('year')
  })

  it('disables dates outside min/max', () => {
    const min = new Date(2017, 4, 9)
    const max = new Date(2017, 4, 15)
    expect(isCalendarDateDisabled(new Date(2017, 4, 8), { min, max })).toBe(true)
    expect(isCalendarDateDisabled(new Date(2017, 4, 10), { min, max })).toBe(false)
  })
})

import { describe, expect, it } from 'vitest'
import {
  calendarBoundValue,
  isCalendarDateDisabled,
} from '../ui/factory/calendar'

describe('calendar contract helpers', () => {
  it('coerces multiple value to an array', () => {
    const day = new Date(2020, 0, 1)
    expect(
      calendarBoundValue({ selectionMode: 'multiple', value: day }),
    ).toEqual([day])
  })

  it('disables dates outside min/max', () => {
    const min = new Date(2017, 4, 9)
    const max = new Date(2017, 4, 15)
    expect(isCalendarDateDisabled(new Date(2017, 4, 8), { min, max })).toBe(true)
    expect(isCalendarDateDisabled(new Date(2017, 4, 10), { min, max })).toBe(false)
  })
})

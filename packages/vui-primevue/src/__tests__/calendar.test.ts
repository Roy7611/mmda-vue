import { describe, expect, it } from 'vitest'
import { calendarPrimeView } from '../factory/calendar'

describe('calendarPrimeView', () => {
  it('maps views to Prime DatePicker names', () => {
    expect(calendarPrimeView('month')).toBe('date')
    expect(calendarPrimeView('year')).toBe('month')
    expect(calendarPrimeView('decade')).toBe('year')
  })
})

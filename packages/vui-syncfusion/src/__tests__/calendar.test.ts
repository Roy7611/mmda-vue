import { describe, expect, it } from 'vitest'
import { calendarEj2View } from '../factory/calendar'

describe('calendarEj2View', () => {
  it('maps views to EJ2 names', () => {
    expect(calendarEj2View('month')).toBe('Month')
    expect(calendarEj2View('year')).toBe('Year')
    expect(calendarEj2View('decade')).toBe('Decade')
  })
})

import { describe, expect, it } from 'vitest'
import { SCHEDULER_TIMELINE_NOT_SUPPORTED, schedulerEventsToCsv } from '@mmda/vui'
import {
  createFcSchedulerPlugin,
  fcCalendarOptionsOf,
  fcInitialViewOf,
  mapUiEventToFc,
} from '../index'

describe('createFcSchedulerPlugin', () => {
  it('maps events and calendar options', () => {
    const mapped = mapUiEventToFc({
      id: 1,
      title: 'Cut',
      start: '2026-01-01T08:00:00Z',
      end: '2026-01-01T09:00:00Z',
      location: 'Line',
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
      display: 'background',
      url: 'https://example.com',
    })
    expect(mapped.title).toBe('Cut')
    expect(mapped.display).toBe('background')
    expect(mapped.rrule).toBe('FREQ=WEEKLY;BYDAY=MO')
    expect((mapped.extendedProps as any).location).toBe('Line')
    expect(fcInitialViewOf('week')).toBe('timeGridWeek')
    expect(fcInitialViewOf('year')).toBe('multiMonthYear')
    const options = fcCalendarOptionsOf({
      firstDayOfWeek: 1,
      workHours: { start: '09:00', end: '18:00' },
      startHour: '08:00',
      slotDuration: 30,
      showNowIndicator: true,
      minDate: '2026-01-01',
      maxDate: '2026-12-31',
      allowOverlap: false,
      allowSelect: true,
      allowSelectOverlap: false,
      showHeader: false,
      showWeekNumber: true,
      view: 'workWeek',
    })
    expect(options.initialView).toBe('timeGridWeek')
    expect(options.firstDay).toBe(1)
    expect(options.nowIndicator).toBe(true)
    expect(options.slotMinTime).toBe('08:00:00')
    expect(options.slotDuration).toBe('00:30:00')
    expect(options.eventOverlap).toBe(false)
    expect(options.selectOverlap).toBe(false)
    expect(options.selectable).toBe(true)
    expect(options.headerToolbar).toBe(false)
    expect(options.weekNumbers).toBe(true)
    expect(options.hiddenDays).toEqual([0, 6])
    expect(options.validRange).toEqual({
      start: '2026-01-01',
      end: '2026-12-31',
    })
  })

  it('renders host vnode and throws on timeline views', () => {
    const plugin = createFcSchedulerPlugin()
    const vnode = plugin.schedulerView({
      events: [{ id: 1, start: '2026-01-01', title: 'Cut' }],
      readonly: true,
    })
    expect(vnode.props?.readonly).toBe(true)
    expect(() => plugin.schedulerView({ view: 'timelineWeek' })).toThrow(
      SCHEDULER_TIMELINE_NOT_SUPPORTED,
    )
    const csv = schedulerEventsToCsv([
      { id: 1, title: 'Cut', start: '2026-01-01' },
    ])
    expect(csv).toContain('Cut')
  })
})

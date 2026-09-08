import { describe, expect, it } from 'vitest'
import { SCHEDULER_PLUGIN_NOT_INSTALLED } from '@mmda/vui'
import { SyncfusionUiBuilder } from '../syncfusion_builder'
import {
  createSfSchedulerPlugin,
  EJ2_SCHEDULER_VIEWS,
  mapUiEventsToEj2,
  schedulerTimeScaleOf,
} from '../factory/schedule'

describe('createSfSchedulerPlugin', () => {
  it('maps unified events onto EJ2 fields and views', () => {
    const rows = mapUiEventsToEj2([
      {
        id: 1,
        title: 'Cut',
        start: '2026-01-01T08:00:00Z',
        end: '2026-01-01T09:00:00Z',
        location: 'Line',
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO',
        display: 'background',
      },
    ])
    expect(rows[0].Subject).toBe('Cut')
    expect(rows[0].Location).toBe('Line')
    expect(rows[0].RecurrenceRule).toBe('FREQ=WEEKLY;BYDAY=MO')
    expect(rows[0].IsBlock).toBe(true)
    expect(EJ2_SCHEDULER_VIEWS.week).toBe('Week')
    expect(EJ2_SCHEDULER_VIEWS.timelineDay).toBe('TimelineDay')
    expect(schedulerTimeScaleOf(30)).toEqual({
      enable: true,
      interval: 60,
      slotCount: 2,
    })
  })

  it('renders schedulerView host with events', () => {
    const plugin = createSfSchedulerPlugin()
    const vnode = plugin.schedulerView({
      events: [{ id: 1, start: '2026-01-01', title: 'Cut' }],
      view: 'week',
      readonly: true,
      firstDayOfWeek: 1,
      workDays: [1, 2, 3, 4, 5],
      workHours: { start: '09:00', end: '18:00' },
      startHour: '08:00',
      showNowIndicator: true,
      minDate: '2026-01-01',
      allowOverlap: false,
    })
    expect(vnode.props?.events?.[0].title).toBe('Cut')
    expect(vnode.props?.view).toBe('week')
    expect(vnode.props?.readonly).toBe(true)
    expect(vnode.props?.allowOverlap).toBe(false)
  })

  it('throws until setSchedulerPlugin on the skin builder', () => {
    const builder = new SyncfusionUiBuilder()
    expect(() =>
      builder.buildSchedulerView({} as any, {
        events: [{ id: 1, start: '2026-01-01' }],
      }),
    ).toThrow(SCHEDULER_PLUGIN_NOT_INSTALLED)
    builder.setSchedulerPlugin(createSfSchedulerPlugin())
    const vnode = builder.buildSchedulerView({} as any, {
      events: [{ id: 1, start: '2026-01-01', title: 'Cut' }],
      showHeader: false,
      showQuickInfo: true,
      hideEmptyAgendaDays: true,
      showWeekNumber: true,
    })
    expect(vnode.props?.showWeekNumber).toBe(true)
  })
})

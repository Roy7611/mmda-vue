import { DateTime } from '@mmda/core'
import { describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import {
  tempisItemsOf,
  timelineAlignToEj2,
  timelineItemsOf,
  timelineOrientationOf,
  timelinePropsFromField,
  timelineTimeTextOf,
} from '../ui/factory/timeline'
import { TestUiBuilder } from './test_builder'

describe('timeline helpers', () => {
  it('defaults orientation to vertical', () => {
    expect(timelineOrientationOf({})).toBe('vertical')
    expect(timelineOrientationOf({ orientation: 'horizontal' })).toBe(
      'horizontal',
    )
    expect(timelineAlignToEj2('before')).toBe('Before')
  })

  it('formats relative time with locale', () => {
    const past = DateTime.now().minus({ hours: 2 }).toFormat('yyyy-MM-dd HH:mm:ss')
    expect(timelineTimeTextOf(past, 'en')).toMatch(/hour/i)
    expect(timelineTimeTextOf(past, 'zh')).toMatch(/小时|小时前/)
  })

  it('binds time/label from field names and functions', () => {
    const rows = [
      { occurredAt: DateTime.now().minus({ days: 1 }).toJSDate(), title: '发运' },
    ]
    const items = timelineItemsOf({
      items: rows,
      timeField: 'occurredAt',
      labelField: 'title',
      locale: 'en',
    })
    expect(items[0].label).toBe('发运')
    expect(items[0].timeText).toMatch(/day/i)
    expect(items[0].start).toBe(rows[0].occurredAt)
  })

  it('maps tempis items from start/end', () => {
    expect(
      tempisItemsOf({
        items: [
          { id: 'a', label: '设计', start: '2026-01-05', end: '2026-01-15' },
        ],
        keyField: 'id',
        startField: 'start',
        endField: 'end',
        labelField: 'label',
      }),
    ).toEqual([
      {
        id: 'a',
        label: '设计',
        start: '2026-01-05',
        end: '2026-01-15',
        grouping: undefined,
        category: undefined,
        progress: undefined,
      },
    ])
  })

  it('uses field array as items', () => {
    const field = { fieldName: 'events' } as any
    const rows = [{ label: '甲', time: '2026-01-01 00:00:00' }]
    const props = timelinePropsFromField(
      field,
      { getFieldValue: () => rows },
      { labelField: 'label', timeField: 'time' },
    )
    expect(props.items).toEqual(rows)
    expect(props.labelField).toBe('label')
  })
})

describe('setTimelinePlugin', () => {
  it('keeps the skin timeline until a plugin is set', () => {
    const ui = new TestUiBuilder()
    const node = ui.factory.timeline({ items: [{ label: '甲' }] })
    expect(node.props?.class).toContain('mmda-timeline')
    expect(node.props?.['data-items']).toBe(1)
  })

  it('routes factory.timeline to the plugin and back on null', () => {
    const ui = new TestUiBuilder()
    ui.setTimelinePlugin({
      timeline: (props) =>
        h('div', { class: 'mmda-tempis', 'data-count': props.items?.length }),
    })
    expect(ui.factory.timeline({ items: [1, 2] }).props?.class).toBe(
      'mmda-tempis',
    )
    ui.setTimelinePlugin(null)
    expect(ui.factory.timeline({ items: [] }).props?.class).toContain(
      'mmda-timeline',
    )
  })
})

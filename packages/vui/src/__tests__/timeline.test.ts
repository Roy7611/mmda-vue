import { DateTime, UiPluginName, uiPlugin } from '@mmda/core'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  tempisTimelineItemsOf,
  timelineAlignToEj2,
  timelineItemsOf,
  timelineOrientationOf,
  timelinePropsFromField,
  timelineTimeTextOf,
} from '../ui/plugins/timeline'
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
    expect(items[0].time).toBe(rows[0].occurredAt)
    // 起止归 Tempis 契约：列表行不再解析 start / end。
    expect((items[0] as Record<string, unknown>).start).toBeUndefined()
    expect((items[0] as Record<string, unknown>).end).toBeUndefined()
  })

  it('uses field array as items', () => {
    const field = { fieldName: 'events' } as any
    const rows = [{ label: '甲', time: '2026-01-01 00:00:00' }]
    const props = timelinePropsFromField(field, { getFieldValue: () => rows })
    expect(props.items).toEqual(rows)
  })
})

describe('tempis timeline items', () => {
  it('maps rows to the canvas shape and drops rows without start', () => {
    expect(
      tempisTimelineItemsOf({
        items: [
          {
            id: 'a',
            title: '设计',
            start: '2026-01-05',
            end: '2026-01-15',
            lane: 'Frontend',
            kind: 'work',
            done: 0.4,
          },
          { id: 'b', title: '无时间' },
        ],
        keyField: 'id',
        labelField: 'title',
        startField: 'start',
        endField: 'end',
        groupingField: 'lane',
        categoryField: 'kind',
        progressField: 'done',
      }),
    ).toEqual([
      {
        key: 'a',
        label: '设计',
        start: '2026-01-05',
        end: '2026-01-15',
        grouping: 'Frontend',
        category: 'work',
        progress: 0.4,
        style: undefined,
        selected: undefined,
      },
    ])
  })

  it('falls back to timeField when startField is not given', () => {
    const items = tempisTimelineItemsOf({
      items: [{ id: 1, at: '2026-02-01' }],
      keyField: 'id',
      timeField: 'at',
    })
    expect(items[0].start).toBe('2026-02-01')
  })

  it('selectedIds 给了就以它为准（受控覆盖行级 selectedField）', () => {
    const items = tempisTimelineItemsOf({
      items: [
        { id: 1, at: '2026-02-01', picked: true },
        { id: 2, at: '2026-02-02', picked: true },
      ],
      keyField: 'id',
      startField: 'at',
      selectedField: 'picked',
      selectedIds: [1],
    })
    expect(items.map((item) => item.selected)).toEqual([true, false])
  })
})

describe('tempis timeline plugin', () => {
  it('未装插件时 buildTempisTimeline 抛出（不回落列表时间轴）', () => {
    const ui = new TestUiBuilder()
    expect(() => ui.buildTempisTimeline({} as any)).toThrow(
      'tempis-timeline plugin not installed',
    )
  })

  it('装插件后走插件，factory.timeline 仍是皮肤默认', () => {
    const ui = new TestUiBuilder()
    ui.use(
      uiPlugin(UiPluginName.tempisTimeline, (_context, props) =>
        h('div', {
          class: 'mmda-tempis',
          'data-count': (props as { items?: unknown[] })?.items?.length,
        }),
      ),
    )
    expect(
      ui.buildTempisTimeline({} as any, { items: [1, 2] }).props?.class,
    ).toBe('mmda-tempis')
    // 插件不再抢 factory.timeline：皮肤默认路径原样保留
    const node = ui.factory.timeline!({ items: [{ label: '甲' }] })
    expect(node.props?.class).toContain('mmda-timeline')
    expect(node.props?.['data-items']).toBe(1)
  })
})

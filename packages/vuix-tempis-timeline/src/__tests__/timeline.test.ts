import { describe, expect, it } from 'vitest'
import { tempisItemsOf } from '@mmda/vui'
import { createTempisTimelinePlugin } from '../tempis_plugin'
import { tempisOptionsOf } from '../tempis_map'

describe('tempisOptionsOf', () => {
  it('maps vui items to Tempis start/end', () => {
    const options = tempisOptionsOf({
      items: [
        {
          id: 1,
          title: '设计',
          start: '2026-01-05',
          end: '2026-01-15',
          grouping: 'Frontend',
        },
      ],
      keyField: 'id',
      labelField: 'title',
      startField: 'start',
      endField: 'end',
      groupingField: 'grouping',
      rtl: true,
    })
    expect(options.rtl).toBe(true)
    expect(options.items).toEqual([
      {
        id: 1,
        label: '设计',
        start: '2026-01-05',
        end: '2026-01-15',
        grouping: 'Frontend',
        category: undefined,
        progress: undefined,
      },
    ])
  })

  it('drops rows without start/time', () => {
    expect(
      tempisItemsOf({
        items: [{ label: '无时间' }],
        labelField: 'label',
      }),
    ).toEqual([])
  })
})

describe('createTempisTimelinePlugin', () => {
  it('returns a timeline renderer', () => {
    const plugin = createTempisTimelinePlugin()
    const vnode = plugin.timeline({ items: [] })
    expect(vnode.type).toBeTruthy()
  })
})

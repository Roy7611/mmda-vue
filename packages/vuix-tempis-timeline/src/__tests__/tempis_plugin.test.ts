import { describe, expect, it, vi } from 'vitest'
import { UiPluginName } from '@mmda/vui'
import { createTempisTimelinePlugin } from '../tempis_plugin'
import { TempisTimelineView } from '../TempisTimelineView'

describe('createTempisTimelinePlugin', () => {
  it('registers under the tempis-timeline plugin name', () => {
    const plugin = createTempisTimelinePlugin()
    expect(plugin.name).toBe(UiPluginName.tempisTimeline)
    expect(plugin.name).toBe('tempis-timeline')
  })

  it('hands the whole props bag to the view as source（单参宿主）', () => {
    const onReady = vi.fn()
    const vnode = createTempisTimelinePlugin().buildUi({} as never, {
      items: [{ start: '2026-01-05' }],
      onReady,
      legend: { position: 'bottom' },
    })
    expect(vnode.type).toBe(TempisTimelineView)
    expect(vnode.props?.source).toMatchObject({
      onReady,
      legend: { position: 'bottom' },
    })
  })
})

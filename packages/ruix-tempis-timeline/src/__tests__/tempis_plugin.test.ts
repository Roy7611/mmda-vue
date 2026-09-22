import { describe, expect, it, vi } from 'vitest'
import { UiPluginName } from '@mmda/core'
import { createTempisTimelinePlugin } from '../tempis_plugin'
import { TempisTimelineView } from '../TempisTimelineView'

describe('createTempisTimelinePlugin（React）', () => {
  it('registers under the tempis-timeline plugin name', () => {
    const plugin = createTempisTimelinePlugin()
    expect(plugin.name).toBe(UiPluginName.tempisTimeline)
    expect(plugin.name).toBe('tempis-timeline')
  })

  it('hands the whole props bag to the view as source（单参宿主）', () => {
    const onReady = vi.fn()
    // `UiPlugin.buildUi(context, props?: UiProps)` 是既成签名，装不下具体契约类型，
    // 所以这里只把「builder 会把整袋 props 交给插件」这件事喂进去。
    const element = createTempisTimelinePlugin().buildUi(
      {} as never,
      {
        items: [{ start: '2026-01-05' }],
        onReady,
        legend: { position: 'bottom' },
      } as never,
    ) as { type: unknown; props: { source: Record<string, unknown> } }

    expect(element.type).toBe(TempisTimelineView)
    expect(element.props.source).toMatchObject({
      onReady,
      legend: { position: 'bottom' },
    })
  })
})

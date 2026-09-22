import { describe, expect, it } from 'vitest'
import { ReactPluginHost, mixPluginHost } from '../ui/plugins/host'
import type { UiContext, UiPlugin } from '@mmda/core'

function stubPlugin(name: string): UiPlugin {
  return {
    name,
    buildUi: (_ctx: UiContext) => `node-${name}`,
  }
}

describe('ReactPluginHost', () => {
  it('use 后 hasPlugin 为 true，plugin() 返回插件', () => {
    const host = new ReactPluginHost()
    const p = stubPlugin('gantt')
    host.use(p)
    expect(host.hasPlugin('gantt')).toBe(true)
    expect(host.plugin('gantt')).toBe(p)
  })

  it('未注册的插件 hasPlugin 返回 false，requirePlugin 抛出', () => {
    const host = new ReactPluginHost()
    expect(host.hasPlugin('none')).toBe(false)
    expect(() => host.requirePlugin('none')).toThrow('not installed')
  })

  it('buildGantt 委托已注册插件', () => {
    const host = new ReactPluginHost()
    host.use(stubPlugin('gantt'))
    const result = host.buildGantt({} as UiContext)
    expect(result).toBe('node-gantt')
  })

  it('buildTimeline 无插件时抛出', () => {
    const host = new ReactPluginHost()
    expect(() => host.buildTimeline({} as UiContext)).toThrow('not installed')
  })

  it('mixPluginHost 给裸对象挂上 use / build', () => {
    const obj = {} as Record<string, unknown>
    mixPluginHost(obj)
    const p = stubPlugin('kanban')
    ;(obj.use as (p: UiPlugin) => void)(p)
    expect((obj.hasPlugin as (n: string) => boolean)('kanban')).toBe(true)
  })
})
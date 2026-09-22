import { describe, expect, it } from 'vitest'
import { createApp, h } from 'vue'
import type { UiTimelineProps } from '@mmda/core'
import { createTimeline } from '../factory/timeline'

/**
 * 契约外的键（对象 / 函数）。Vue 组件会把未声明的 attrs 透传到根元素：
 * 对象被 String() 成 `[object Object]`、函数被写成一串源码文本落进 DOM。
 * 皮肤工厂必须自己收口，不能整袋 spread 给厂商组件。
 */
const UNKNOWN: Record<string, true> = {
  bands: true,
  dependencies: true,
  legend: true,
  onItemDoubleClick: true,
}

const unknownKeys = () =>
  ({
    items: [{ key: 'a', label: '设计', oppositeContent: '2026-01-05' }],
    bands: [{ start: '2026-01-01', end: '2026-02-01', style: { color: '#f00' } }],
    dependencies: [{ source: 'a', target: 'b' }],
    legend: { position: 'bottom' },
    onItemDoubleClick: () => undefined,
  }) as unknown as UiTimelineProps

function mount(props: UiTimelineProps) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const app = createApp({ render: () => h('div', [createTimeline(props)]) })
  app.mount(host)
  return { host, app }
}

describe('timeline 不整袋透传未知键', () => {
  it('vnode props 不带契约外的键', () => {
    const vnode = createTimeline(unknownKeys())
    const keys = Object.keys((vnode.props ?? {}) as Record<string, unknown>)
    expect(keys.filter((key) => key in UNKNOWN)).toEqual([])
  })

  it('渲染后的 DOM 没有对象 / 函数残渣', () => {
    const { host, app } = mount(unknownKeys())
    expect(host.innerHTML).not.toContain('[object Object]')
    expect(host.innerHTML).not.toContain('=>')
    app.unmount()
    host.remove()
  })
})

/*
 * 缺引擎（`@tempis/timeline` 没装）这条分支：宿主渲染缺失文案 + 给 noop 控制器，
 * 绝不能把整棵 UI 炸掉（契约承诺 `onReady` 一定被调到）。
 *
 * 用 `vi.mock` 把厂商模块换成空对象模拟「没装」。
 */
import { createApp, h, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import type { UiTempisTimelineController } from '@mmda/vui'
import { TEMPIS_MISSING, TempisTimelineView } from '../TempisTimelineView'

vi.mock('@tempis/timeline', () => ({}))

describe('缺引擎', () => {
  it('renders the missing message and hands out the noop controller', async () => {
    let controller: UiTempisTimelineController | undefined
    const root = document.createElement('div')
    document.body.appendChild(root)
    createApp({
      render: () =>
        h(TempisTimelineView, {
          source: {
            items: [{ start: '2026-01-05' }],
            onReady: (next: UiTempisTimelineController) => {
              controller = next
            },
          },
        }),
    }).mount(root)
    for (let i = 0; i < 6; i += 1) {
      await nextTick()
      await new Promise((resolve) => setTimeout(resolve, 0))
    }

    expect(root.textContent).toContain(TEMPIS_MISSING)
    expect(controller).toBeTruthy()
    expect(controller?.getItems()).toEqual([])
    expect(controller?.getSelection()).toEqual([])
    expect(controller?.getRange()).toBeUndefined()
    expect(() => controller?.focus()).not.toThrow()
    expect(() => controller?.setSelection([1])).not.toThrow()
    root.remove()
  })
})

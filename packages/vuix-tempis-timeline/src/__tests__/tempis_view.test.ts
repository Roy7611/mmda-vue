/*
 * 宿主接线（jsdom + canvas ctx stub，见 `canvas_stub.ts`）：
 * 真的把 Tempis 引擎构造起来，验「数据走 setter、结构走重建、卸载 destroy、控制器可用」。
 *
 * jsdom 没有布局，所以这里只验**接线**：画布尺寸、像素、命中、平移缩放必须真浏览器验。
 */
import {
  createApp,
  h,
  nextTick,
  reactive,
  type App,
} from 'vue'
import { describe, expect, it } from 'vitest'
import type { UiTempisTimelineController, UiTempisTimelineProps } from '@mmda/vui'
import { TempisTimelineView } from '../TempisTimelineView'

const flush = async (): Promise<void> => {
  for (let i = 0; i < 6; i += 1) {
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

/** 等到条件成立（首次 mount 要冷启一次动态 import，比单纯 nextTick 慢）。 */
const settle = async (ready: () => boolean): Promise<void> => {
  for (let i = 0; i < 50 && !ready(); i += 1) {
    await flush()
  }
}

type Harness = {
  root: HTMLElement
  source: UiTempisTimelineProps
  ready: () => { controller: UiTempisTimelineController | undefined; count: number }
  unmount: () => void
}

function mount(input: UiTempisTimelineProps): Harness {
  let controller: UiTempisTimelineController | undefined
  let count = 0
  // 先把契约袋摊成 Record 再 reactive：`reactive<UiTempisTimelineProps>` 的深层 Unwrap 会撞
  // TS2589（Type instantiation is excessively deep），摊平后即时类型很浅。
  const source = reactive({
    ...(input as Record<string, unknown>),
    onReady: (next: UiTempisTimelineController) => {
      controller = next
      count += 1
      input.onReady?.(next)
    },
  }) as unknown as UiTempisTimelineProps
  const root = document.createElement('div')
  document.body.appendChild(root)
  const app: App = createApp({
    render: () => h(TempisTimelineView, { source }),
  })
  app.mount(root)
  return {
    root,
    source,
    ready: () => ({ controller, count }),
    unmount: () => {
      app.unmount()
      root.remove()
    },
  }
}

describe('TempisTimelineView 接线', () => {
  it('constructs the engine, exposes the controller and maps rows back to contract shape', async () => {
    const harness = mount({
      items: [
        { key: 'design', label: '设计', start: '2026-01-05', end: '2026-01-15' },
        { key: 'build', label: '开发', start: '2026-01-12', end: '2026-01-28' },
      ],
      groupingField: 'grouping',
      selectionMode: 'multi',
    })
    await settle(() => harness.ready().controller != null)

    const { controller, count } = harness.ready()
    expect(count).toBe(1)
    expect(controller).toBeTruthy()
    // 引擎真的起来了：缺引擎时这里会是 EMPTY 文案。
    expect(harness.root.textContent).not.toContain('requires @tempis/timeline')
    expect(harness.root.querySelector('canvas')).toBeTruthy()

    expect(controller?.getItems().map((item) => item.key)).toEqual(['design', 'build'])
    expect(controller?.getItems()[0].label).toBe('设计')
    const range = controller?.getRange()
    expect(range?.start).toBeInstanceOf(Date)
    expect(range?.end).toBeInstanceOf(Date)
    expect(range && range.end.getTime() > range.start.getTime()).toBe(true)

    controller?.setSelection(['build'])
    expect(controller?.getSelection()).toEqual(['build'])
    controller?.clearSelection()
    expect(controller?.getSelection()).toEqual([])
    controller?.redraw()
    harness.unmount()
  })

  it('syncs data through setters without rebuilding the engine', async () => {
    const harness = mount({
      items: [{ key: 1, start: '2026-01-05' }],
      labelField: 'label',
    })
    await settle(() => harness.ready().controller != null)
    const first = harness.ready()
    expect(first.controller?.getItems()).toHaveLength(1)

    ;(harness.source.items as Array<Record<string, unknown>>).push({
      key: 2,
      start: '2026-01-09',
    })
    await settle(() => (first.controller?.getItems().length ?? 0) === 2)

    expect(harness.ready().count).toBe(1)
    expect(first.controller?.getItems().map((item) => item.key)).toEqual([1, 2])

    ;(harness.source.items as Array<Record<string, unknown>>)[0].label = '改名'
    await settle(() => first.controller?.getItems()[0]?.label === '改名')
    expect(first.controller?.getItems()[0].label).toBe('改名')
    harness.unmount()
  })

  it('rebuilds the engine when a construction time option changes', async () => {
    const harness = mount({
      items: [{ key: 1, start: '2026-01-05' }],
      legend: { position: 'top' },
    })
    await settle(() => harness.ready().controller != null)
    const first = harness.ready()
    expect(first.count).toBe(1)
    const firstController = first.controller

    harness.source.legend = { position: 'bottom' }
    await settle(() => harness.ready().count >= 2)

    const second = harness.ready()
    expect(second.count).toBe(2)
    expect(second.controller).not.toBe(firstController)
    // 重建后数据仍在。
    expect(second.controller?.getItems().map((item) => item.key)).toEqual([1])
    harness.unmount()
  })

  it('destroys the engine on unmount (toImage 之后拿不到图)', async () => {
    const harness = mount({ items: [{ key: 1, start: '2026-01-05' }] })
    await settle(() => harness.ready().controller != null)
    const { controller } = harness.ready()
    expect(await controller?.toImage({})).toBeInstanceOf(Blob)

    harness.unmount()
    // 引擎已 destroy → toImage 内部抛错，契约转成 undefined。
    expect(await controller?.toImage({})).toBeUndefined()
  })

  it('applies a controlled selection and keeps it after setItems', async () => {
    const harness = mount({
      items: [
        { key: 'a', start: '2026-01-05' },
        { key: 'b', start: '2026-01-06' },
      ],
      selectionMode: 'multi',
      selectedIds: ['b'],
    })
    await settle(() => harness.ready().controller != null)
    const { controller } = harness.ready()
    expect(controller?.getSelection()).toEqual(['b'])

    harness.source.selectedIds = ['a']
    await settle(() => controller?.getSelection()[0] === 'a')
    expect(controller?.getSelection()).toEqual(['a'])
    harness.unmount()
  })
})

/*
 * 宿主接线（jsdom + canvas ctx stub，见 `canvas_stub.ts`）：真的把 Tempis 引擎构造起来，
 * 验「数据走 setter、结构走重建、卸载 destroy、控制器可用、StrictMode 双跑幂等」。
 *
 * jsdom 没有布局，所以这里只验**接线**：画布尺寸、像素、命中、平移缩放必须真浏览器验。
 */
import { StrictMode, act, createElement, type ReactElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import type {
  UiTempisTimelineController,
  UiTempisTimelineProps,
} from '@mmda/core'
import { TempisTimelineView } from '../TempisTimelineView'

/** React 的 render 是异步提交的，等条件成立再断言。 */
const settle = async (done: () => boolean): Promise<void> => {
  for (let i = 0; i < 60 && !done(); i += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
  }
}

type Harness = {
  container: HTMLElement
  render: (source: UiTempisTimelineProps) => Promise<void>
  ready: () => {
    controller: UiTempisTimelineController | undefined
    count: number
  }
  unmount: () => Promise<void>
}

async function mount(
  initial: UiTempisTimelineProps,
  options: { strict?: boolean } = {},
): Promise<Harness> {
  let controller: UiTempisTimelineController | undefined
  let count = 0
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root: Root = createRoot(container)

  const view = (source: UiTempisTimelineProps): ReactElement =>
    createElement(TempisTimelineView, { source })

  const withReady = (source: UiTempisTimelineProps): UiTempisTimelineProps => ({
    ...source,
    onReady: (next: UiTempisTimelineController) => {
      controller = next
      count += 1
      source.onReady?.(next)
    },
  })

  const render = async (source: UiTempisTimelineProps): Promise<void> => {
    const element = view(withReady(source))
    await act(async () => {
      root.render(
        options.strict
          ? createElement(StrictMode, null, element)
          : element,
      )
    })
  }

  await render(initial)
  return {
    container,
    render,
    ready: () => ({ controller, count }),
    unmount: async () => {
      await act(async () => {
        root.unmount()
      })
      container.remove()
    },
  }
}

describe('TempisTimelineView 接线（React）', () => {
  it('constructs the engine, exposes the controller and maps rows back to contract shape', async () => {
    const harness = await mount({
      items: [
        { key: 'design', label: '设计', start: '2026-01-05', end: '2026-01-15' },
        { key: 'build', label: '开发', start: '2026-01-12', end: '2026-01-28' },
      ],
      selectionMode: 'multi',
    })
    await settle(() => harness.ready().controller != null)

    const { controller, count } = harness.ready()
    expect(count).toBe(1)
    expect(harness.container.textContent).not.toContain(
      'requires @tempis/timeline',
    )
    expect(harness.container.querySelector('canvas')).toBeTruthy()

    expect(controller?.getItems().map((item) => item.key)).toEqual([
      'design',
      'build',
    ])
    expect(controller?.getItems()[0].label).toBe('设计')
    const range = controller?.getRange()
    expect(range?.start).toBeInstanceOf(Date)
    expect(range && range.end.getTime() > range.start.getTime()).toBe(true)

    controller?.setSelection(['build'])
    expect(controller?.getSelection()).toEqual(['build'])
    controller?.clearSelection()
    expect(controller?.getSelection()).toEqual([])
    controller?.redraw()
    await harness.unmount()
  })

  it('syncs data through setters without rebuilding the engine', async () => {
    let source: UiTempisTimelineProps = {
      items: [{ key: 1, start: '2026-01-05' }],
      labelField: 'label',
    }
    const harness = await mount(source)
    await settle(() => harness.ready().controller != null)
    const first = harness.ready()
    expect(first.controller?.getItems()).toHaveLength(1)

    source = {
      ...source,
      items: [
        { key: 1, start: '2026-01-05' },
        { key: 2, start: '2026-01-09' },
      ],
    }
    await harness.render(source)
    await settle(() => first.controller?.getItems().length === 2)

    expect(harness.ready().count).toBe(1)
    expect(first.controller?.getItems().map((item) => item.key)).toEqual([1, 2])
    await harness.unmount()
  })

  it('rebuilds the engine when a construction time option changes', async () => {
    let source: UiTempisTimelineProps = {
      items: [{ key: 1, start: '2026-01-05' }],
      legend: { position: 'top' },
    }
    const harness = await mount(source)
    await settle(() => harness.ready().controller != null)
    const first = harness.ready()
    expect(first.count).toBe(1)
    const firstController = first.controller

    source = { ...source, legend: { position: 'bottom' } }
    await harness.render(source)
    await settle(() => harness.ready().count >= 2)

    const second = harness.ready()
    expect(second.count).toBe(2)
    // 第二次 createEngine 真跑了（没跑的话 count 会停在 1）→ 说明先 destroy 再重建。
    // React 侧控制器**引用稳定**（业务拿一次就够），与 Vue 侧每次重建换新对象是刻意差异。
    expect(second.controller).toBe(firstController)
    expect(second.controller?.getItems().map((item) => item.key)).toEqual([1])
    await harness.unmount()
  })

  it('destroys the engine on unmount (toImage 之后拿不到图)', async () => {
    const harness = await mount({ items: [{ key: 1, start: '2026-01-05' }] })
    await settle(() => harness.ready().controller != null)
    const { controller } = harness.ready()
    expect(await controller?.toImage({})).toBeInstanceOf(Blob)

    await harness.unmount()
    // 引擎已 destroy → toImage 内部抛错，契约转成 undefined。
    expect(await controller?.toImage({})).toBeUndefined()
  })

  it('applies a controlled selection and keeps it after new props', async () => {
    let source: UiTempisTimelineProps = {
      items: [
        { key: 'a', start: '2026-01-05' },
        { key: 'b', start: '2026-01-06' },
      ],
      selectionMode: 'multi',
      selectedIds: ['b'],
    }
    const harness = await mount(source)
    await settle(() => harness.ready().controller != null)
    const { controller } = harness.ready()
    expect(controller?.getSelection()).toEqual(['b'])

    source = { ...source, selectedIds: ['a'] }
    await harness.render(source)
    await settle(() => controller?.getSelection()[0] === 'a')
    expect(controller?.getSelection()).toEqual(['a'])
    await harness.unmount()
  })

  it('survives StrictMode double effect（挂载→清理→再挂载，引擎只活一个）', async () => {
    const harness = await mount(
      {
        items: [
          { key: 'x', start: '2026-01-05', end: '2026-01-09' },
          { key: 'y', start: '2026-01-10' },
        ],
      },
      { strict: true },
    )
    await settle(() => harness.ready().controller != null)

    const { controller } = harness.ready()
    expect(controller?.getItems().map((item) => item.key)).toEqual(['x', 'y'])
    // 双跑里若把实例弄死了，这里会拿到 undefined。
    expect(await controller?.toImage({})).toBeInstanceOf(Blob)
    expect(harness.container.querySelector('canvas')).toBeTruthy()
    await harness.unmount()
  })
})

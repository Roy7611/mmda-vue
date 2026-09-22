/*
 * React 侧独立一份：rui / ruix 不 import vui / vuix。
 * jsdom 下的 canvas 兜底（**只给测试用**：`vitest.setup.ts` 会装上）。
 *
 * 本机实测的事实：jsdom 里 `canvas.getContext('2d')` 返回 `null`，而
 * `new TempisTimeline()` 在构造函数里就做 DPR 缩放 → 直接抛
 * `Cannot read properties of null (reading 'scale')`。这就是「插件测试只测纯函数、
 * 从不挂载宿主」的原因。补一个 2D ctx 桩之后，引擎的全量 API 在 jsdom 里跑得通。
 *
 * 桩的三个必须项：
 * 1. `ctx.canvas` 必须是**真实 canvas 元素**（图例/小地图要读它的尺寸）
 * 2. `measureText` 要返回 `{ width }`
 * 3. `responsive: true` 构造时会 new `ResizeObserver` → 垫桩
 *
 * 另外 jsdom 没有布局：这里把 canvas 的 client/offset 尺寸钉成 800×300，
 * 好让「按容器尺寸缩放」这类代码有非零输入。**像素、命中、平移、缩放这些必须真浏览器验**。
 */
export const CANVAS_CONTEXT_METHODS = [
  'beginPath',
  'clearRect',
  'clip',
  'drawImage',
  'fill',
  'fillRect',
  'fillText',
  'lineTo',
  'moveTo',
  'rect',
  'restore',
  'roundRect',
  'save',
  'scale',
  'setLineDash',
  'stroke',
] as const

type StubContext = Record<string, unknown>

const X = 800
const Y = 300

function createStubContext(canvas: HTMLCanvasElement): StubContext {
  const ctx: StubContext = {
    canvas,
    measureText: (text: unknown) => ({ width: String(text ?? '').length * 6 }),
    createLinearGradient: () => ({ addColorStop: () => undefined }),
    getImageData: () => ({ data: [] }),
  }
  for (const method of CANVAS_CONTEXT_METHODS) {
    ctx[method] = () => undefined
  }
  // 不在这两张清单里的 2D 方法（弧线、贝塞尔、变换…）也给个空实现，
  // 免得某条渲染分支在 jsdom 里因为「方法不存在」而红。
  const fallback = [
    'arc',
    'arcTo',
    'bezierCurveTo',
    'closePath',
    'ellipse',
    'quadraticCurveTo',
    'rotate',
    'setTransform',
    'transform',
    'translate',
  ] as const
  for (const method of fallback) {
    if (!(method in ctx)) ctx[method] = () => undefined
  }
  return ctx
}

export function installCanvasStub(): void {
  const contexts = new WeakMap<HTMLCanvasElement, StubContext>()
  const proto = HTMLCanvasElement.prototype

  if (typeof globalThis.ResizeObserver !== 'function') {
    class StubResizeObserver {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    }
    ;(globalThis as { ResizeObserver?: unknown }).ResizeObserver =
      StubResizeObserver as unknown as typeof ResizeObserver
  }

  // 点事件的连线标记走 `new Path2D()`（jsdom 没有）——只用 moveTo/lineTo，
  // 其余方法给空实现，免得别的分支又踩。
  if (typeof (globalThis as { Path2D?: unknown }).Path2D !== 'function') {
    class StubPath2D {
      moveTo(): void {}
      lineTo(): void {}
      rect(): void {}
      roundRect(): void {}
      arc(): void {}
      closePath(): void {}
    }
    ;(globalThis as { Path2D?: unknown }).Path2D =
      StubPath2D as unknown as typeof Path2D
  }

  const originalGetContext = proto.getContext
  /** jsdom 的 `getContext('2d')` 会打一条 “Not implemented” —— 只探一次，别每次渲染都刷屏。 */
  let realTwoDAvailable: boolean | undefined
  proto.getContext = function (
    this: HTMLCanvasElement,
    type?: string,
    ...rest: unknown[]
  ): unknown {
    // 非 2d 原样交给 jsdom（返回 null 也无所谓）；2d 能拿到真 ctx 就用真的，
    // 拿不到（jsdom 的常态）才给桩 —— 不抢真浏览器的实现。
    if (type && type !== '2d') {
      return originalGetContext.call(this, type as '2d', ...rest)
    }
    realTwoDAvailable ??= Boolean(
      originalGetContext.call(document.createElement('canvas'), '2d'),
    )
    if (realTwoDAvailable) return originalGetContext.call(this, '2d')
    let ctx = contexts.get(this)
    if (!ctx) {
      ctx = createStubContext(this)
      contexts.set(this, ctx)
    }
    return ctx
  } as typeof proto.getContext

  Object.defineProperty(proto, 'toBlob', {
    configurable: true,
    writable: true,
    value: function (callback: BlobCallback, type?: string): void {
      callback(new Blob([''], { type: type ?? 'image/png' }))
    },
  })
  Object.defineProperty(proto, 'toDataURL', {
    configurable: true,
    writable: true,
    value: () => 'data:image/png;base64,',
  })

  for (const [key, value] of [
    ['clientWidth', X],
    ['clientHeight', Y],
    ['offsetWidth', X],
    ['offsetHeight', Y],
  ] as const) {
    Object.defineProperty(proto, key, {
      configurable: true,
      get: () => value,
    })
  }
}

import { proxy, subscribe, useSnapshot, type Snapshot } from 'valtio'
import { computed as reactiveComputed, effect } from 'valtio-reactive'
import type { Entity, Ref, RxFactory, RxWatchSource } from '@mmda/core'
import type { ReactUiContext, RuiState } from './contexts/react_ui_context'

/**
 * 订阅一个 ReactUiContext：读取返回快照里的字段会随 ctx 状态变化触发重渲染。
 *
 * 底层是 valtio 的 {@link useSnapshot}。只读快照、只写源 proxy：
 * ```tsx
 * function MyForm({ ctx }: { ctx: ReactUiContext }) {
 *   const snap = useReactUiContext(ctx)
 *   return <div>{snap.model?.name}</div>
 * }
 * ```
 */
export function useReactUiContext<M extends Entity>(
  ctx: ReactUiContext<M>,
): Snapshot<RuiState<M>> {
  return useSnapshot(ctx._state)
}

/**
 * React（valtio）版 {@link RxFactory}。
 *
 * - `rx`：对象/数组 → `proxy`；基本类型 → `proxy({ value })`（Ref 形态）。
 * - `computed` / `watch`：getter 依赖追踪基于 `valtio-reactive` 的 `computed` / `effect`。
 */
export function createReactRxFactory(): RxFactory {
  return {
    rx<T>(val: T) {
      if (typeof val === 'object' && val !== null) {
        return proxy(val) as T extends object ? T : Ref<T>
      }
      return proxy({ value: val }) as unknown as T extends object
        ? T
        : Ref<T>
    },
    computed<T>(fn: () => T): Ref<T> {
      return reactiveComputed({ value: fn })
    },
    watch(source: RxWatchSource, cb: (val: unknown) => void): () => void {
      if (typeof source === 'function') {
        let first = true
        return effect(() => {
          const value = source()
          if (first) {
            first = false
            return
          }
          cb(value)
        })
      }
      return subscribe(source, () => {
        cb(source.value)
      })
    },
  }
}

import {
  computed as vueComputed,
  reactive,
  ref,
  watch as vueWatch,
  isReactive,
  type Ref,
  type UnwrapNestedRefs,
} from "vue";
import type { RxFactory, RxWatchSource } from "@mmda/core";

export type Rx<T> = UnwrapNestedRefs<T>;

export function rx<T extends object>(value: T): Rx<T> {
  if(isReactive(value)) return value as Rx<T>;
  return reactive<T>(value);
}

/**
 * Vue 版 {@link RxFactory}。
 *
 * - `rx`：对象/数组 → `reactive`（深层）；基本类型 → `ref`（Ref 形态）。自动分发。
 * - `computed`：Vue `computed`。
 * - `watch`：Vue `watch`，支持 Ref 与 getter 两种 source，返回 stop 函数。
 */
export function createVueRxFactory(): RxFactory {
  return {
    rx<T>(val: T) {
      if (typeof val === "object" && val !== null) {
        return reactive(val) as T extends object ? T : Ref<T>
      }
      return ref(val) as unknown as T extends object ? T : Ref<T>
    },
    ref<T>(value: T): Ref<T> {
      return ref(value) as Ref<T>
    },
    computed<T>(fn: () => T): Ref<T> {
      return vueComputed(fn) as Ref<T>
    },
    watch(source: RxWatchSource, cb: (val: unknown) => void): () => void {
      return vueWatch(source as any, (value) => cb(value))
    },
  }
}

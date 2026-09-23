/** 响应式引用。实现侧通常对应 Vue Ref / valtio 代理后的引用。 */
export interface Ref<T> {
  value: T
}

/** watch 的监听源：Ref 或返回值的 getter。 */
export type RxWatchSource = Ref<unknown> | (() => unknown)

/**
 * 响应式工厂：值响应式化、派生值、监听变化。
 * vui / rui 各自实现；Layout / Factory 不依赖它。
 */
export interface RxFactory {
  /** 基本类型 → Ref；对象/数组 → 响应式 proxy。自动分发，程序员不用选。 */
  rx<T>(val: T): T extends object ? T : Ref<T>
  /** 永远包成 Ref（含对象/数组）。用于「持有数组」这类需要整体替换引用的状态。 */
  ref<T>(value: T): Ref<T>
  /** 派生值。 */
  computed<T>(fn: () => T): Ref<T>
  /** 值变化监听，返回 stop 函数。 */
  watch(source: RxWatchSource, cb: (val: unknown) => void): () => void
}

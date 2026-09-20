/**
 * 区域（slot）：调用方提供的**惰性**节点生产者。
 *
 * 设计见 [`vui_architecture.md`](../../../docs/design/vui_architecture.md) §1。
 * 三条要点：
 * - **惰性函数**，不是已建节点 —— 由控件决定何时建（不渲染的区域就不建）；
 *   同时这是 Vue `Slot` / Svelte 5 `Snippet` / React render-prop 的共同形态。
 * - **与 props 分开**：区域走「第二参」，值 / 事件 / 壳样式走 props。
 *   合并进 props 会让 Vue 把未被消费的函数键静默写成 DOM 属性（实测，见设计文档 §1.1）。
 * - **返回值可多节点**：Vue `VNodeChild` 与 React `ReactNode` 都天然含数组。
 *
 * core 不 import 任何框架，所以这里只有调用约定，没有节点类型知识。
 */
export type UiSlot<TNode = any> = () => TNode | TNode[]

/**
 * 区域表（备用）：没有具名接口时的通用形状。
 * 每控件仍优先写具名 `UiXxxSlots`（键名有类型、拼错报错）；这个是兜底与工具函数的参数类型。
 */
export type UiSlots<TNode = any> = Record<string, UiSlot<TNode> | undefined>

/**
 * 区域求值的**唯一出口**：控件实现读区域一律走它，不要各写 `slots?.header?.()`。
 *
 * 语义：
 * - 有区域且返回非 `null` / `undefined` → 用它的返回值（数组原样透传）；
 * - 区域缺省、或返回 `null` / `undefined` → 用 `fallback()`；
 * - 两者都没有 → 空数组。
 *
 * 框架特有的「空区域」判定（例如 Vue 里条件插槽返回的注释节点）留在实现侧，
 * core 只负责调用与回退，不认识节点。
 */
export function uiSlot<TNode>(
  slot?: UiSlot<TNode>,
  fallback?: () => TNode | TNode[],
): TNode | TNode[] {
  return (slot ? slot() : undefined) ?? fallback?.() ?? []
}
/**
 * 领域事件基座。业主：core。
 *
 * 事件对象只放"监听者从事件名里看不出来的东西"：
 * - 事件名已经说清动作的（`onSelect` / `onResizeStart` / `onRangeChange`），不要再放 `action`；
 * - 一个事件名覆盖多个动作的（`onCardChange` 覆盖 add / update / delete / move），
 *   由**那个事件自己的类型**声明必填的 `action`。
 *
 * 厂商原始 args（EJ2 args / svar ev …）不进契约：core 契约是跨皮肤、跨框架的，
 * 谁要暴露厂商细节，由那个皮肤在自己的 EventArgs 子类型上加字段。
 */
export interface UiEventArgs {}

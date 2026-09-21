/**
 * Vue 专属形状的取值归口。业主：vui。
 *
 * core 的标准形态用**平台原生名**（`class` / `for`），vui 直接吃，不做键名翻译
 * （见 [`vui_architecture.md`](../../../../docs/design/vui_architecture.md) §1.4）。
 * 这里只留 Vue 运行时特有的 `onUpdate:*` 形状 —— 它在 core 契约里不存在
 * （那是 `v-model` 编译出来的 prop + 监听器，Vue 运行时用 `isModelListener` 特判该前缀）。
 */

/**
 * Vue v-model 写入回调：袋键 `onUpdate` → `onUpdate:modelValue`。
 *
 * 参数收 `object` 而不是 `UiProps`：这正是**读契约外键**的地方（reader 必须能看索引），
 * 调用方传具体 `UiXxxProps` 也能直接进。
 */
export function vueUpdateOf<T = unknown>(
  props?: object | null,
  name?: string,
): ((value: T) => void) | undefined {
  const bag = props as Record<string, unknown> | null | undefined
  if (!bag) return undefined
  // 具名多 v-model：`onUpdate:<name>`
  if (name) {
    const fn = bag[`onUpdate:${name}`]
    return typeof fn === 'function' ? (fn as (value: T) => void) : undefined
  }
  // `onUpdate` 与 `onUpdate:modelValue` 是同一条 v-model 通道的两个名字：
  // 程序员两个都给时必须都写（只挑一个是丢事件）。
  const fns = ['onUpdate', 'onUpdate:modelValue']
    .map((key) => bag[key])
    .filter((fn): fn is (value: T) => void => typeof fn === 'function')
  if (!fns.length) return undefined
  if (fns.length === 1) return fns[0]
  return (value: T) => {
    for (const fn of fns) fn(value)
  }
}

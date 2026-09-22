/*
 * 契约 ↔ 引擎的编译期一致性断言（不跑，只在 tsc 里生效）。
 *
 * core 不引 `@tempis/timeline`（不能把厂商包拖给每个 app），契约类型是 core 自己
 * 同构声明的。代价是两边可能悄悄漂移 —— 这个文件把漂移变成编译错误：
 * 映射函数的返回值必须能直接喂给厂商的 `TempisTimelineOptions` / `TempisTimelineItem`。
 *
 * 覆盖在 `tsconfig.vitest.json` 的 include 里（src 下所有 .ts），所以
 * `npm run typecheck` 就会检查它。
 *
 * 注意：这个注释里不能出现「两个星号紧跟斜杠」那种通配写法，它会提前闭合块注释。
 */
import type { TempisTimelineItem, TempisTimelineOptions } from '@tempis/timeline'
import type { UiTempisTimelineItem, UiTempisTimelineProps } from '@mmda/vui'
import { tempisItemForEngine, tempisItemsForEngine } from '../tempis_items'
import { tempisOptionsOf } from '../tempis_options'

/** 契约 props → 引擎选项（含 range / legend / tooltip / style 等全部子结构）。 */
export const optionsAreEngineCompatible: (
  props: UiTempisTimelineProps,
) => TempisTimelineOptions = tempisOptionsOf

/** 契约 props → 引擎行（`key → id`）。 */
export const itemsAreEngineCompatible: (
  props: UiTempisTimelineProps,
) => TempisTimelineItem[] = tempisItemsForEngine

/** 单行映射（`setItems` 走的那条路）。 */
export const itemRowIsEngineCompatible: (
  item: UiTempisTimelineItem,
  index: number,
) => TempisTimelineItem | undefined = tempisItemForEngine

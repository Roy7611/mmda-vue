import type { MetaUiGroup } from '../metaui/metaui_group'
import type { UiContext } from './context'
import type { UiProps } from './props'

/**
 * 组级渲染函数：一个 `MetaUiGroup`（字段组 / 子表 many 组）交给业务自己画。
 *
 * 挂载入口是 `MetaUiGroupLogic.customRenderer` / `customEditor`
 * （`packages/core/src/logic/group_logic.ts`）；vui 的消费点在 `builder.buildGroup`
 * （`packages/vui/src/ui/builder/form.ts`），编辑态取 `customEditor ?? customRenderer`。
 *
 * 与字段级同构：`context` 是运行时入口（`context.getFieldValue` / `uiBuilder` / `t`），
 * `props` 是组所在屏的入参（传子集即可，如 vui 的 `BuildGroupProps`）。
 * 组级没有单元格那一层，所以不存在第三参给「当前行」的形态 —— 行由 `context`（子表会话）给。
 */
export type UiGroupRenderer<TNode = any> = (
  group: MetaUiGroup,
  context: UiContext,
  props?: UiProps,
) => TNode

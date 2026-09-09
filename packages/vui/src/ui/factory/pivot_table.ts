/*
 * 透视表是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setPivotPlugin(createSfPivotPlugin()) / createAgPivotPlugin()
 * 契约在 @mmda/core。
 */
import type { VNode } from 'vue'
import type { UiPivotPlugin as CorePlugin } from '@mmda/core'

export type {
  UiPivotAggregate,
  UiPivotField,
  UiPivotFormat,
  UiPivotTableProps,
  UiPivotPlugin,
} from '@mmda/core'

export {
  PIVOT_PLUGIN_NOT_INSTALLED,
  unimplementedPivotPlugin,
  pivotHookClass,
  pivotAggregateOf,
  ej2PivotTypeOf,
  pivotDataOf,
} from '@mmda/core'

/** vui 钉成 VNode。 */
export type VuePivotPlugin = CorePlugin<VNode>

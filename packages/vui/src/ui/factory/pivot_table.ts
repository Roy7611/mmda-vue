/*
 * 透视表是 Builder 插件，不进 chrome UiFactory。
 * App：ui.setPivotPlugin(createSfPivotPlugin()) / createAgPivotPlugin()
 *
 * 契约跟 AG 轴（rowGroup / pivot / value）。服务端动作是 filterRows / pivotRows，
 * 不是 AG 内部的 getRows。SF 只适配本地 data，不能打这两个接口。
 */
import type { VNode } from 'vue'
import type {UiProps} from '../layout/layout'

export const PIVOT_PLUGIN_NOT_INSTALLED = 'pivot plugin not installed'

export type UiPivotAggregate =
  | 'sum'
  | 'count'
  | 'avg'
  | 'min'
  | 'max'
  | 'distinctCount'

export interface UiPivotField {
  name: string
  caption?: string
  aggregate?: UiPivotAggregate
}

export interface UiPivotFormat {
  name: string
  format: string
}

export interface UiPivotTableProps extends UiProps {
  data?: Record<string, unknown>[]
  rows?: UiPivotField[]
  columns?: UiPivotField[]
  values?: UiPivotField[]
  height?: string | number
  showFieldList?: boolean
  showGroupingBar?: boolean
  expandAll?: boolean
  formats?: UiPivotFormat[]
  onReady?: (api: unknown) => void
}

export interface UiPivotPlugin {
  pivotTable: (props: UiPivotTableProps) => VNode
}

function notInstalled(): never {
  throw new Error(PIVOT_PLUGIN_NOT_INSTALLED)
}

export function unimplementedPivotPlugin(): UiPivotPlugin {
  return { pivotTable: notInstalled }
}

export function pivotHookClass(extra?: unknown): unknown[] {
  return ['mmda-pivot', extra]
}

const EJ2_TYPE: Record<UiPivotAggregate, string> = {
  sum: 'Sum',
  count: 'Count',
  avg: 'Avg',
  min: 'Min',
  max: 'Max',
  distinctCount: 'DistinctCount',
}

export function pivotAggregateOf(
  value?: string | null,
): UiPivotAggregate {
  if (
    value === 'count' ||
    value === 'avg' ||
    value === 'min' ||
    value === 'max' ||
    value === 'distinctCount'
  ) {
    return value
  }
  return 'sum'
}

export function ej2PivotTypeOf(aggregate?: string | null): string {
  return EJ2_TYPE[pivotAggregateOf(aggregate)]
}

export function pivotDataOf(
  props: UiPivotTableProps,
): Record<string, unknown>[] {
  return Array.isArray(props.data) ? props.data : []
}

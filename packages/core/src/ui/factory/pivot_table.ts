/**
 * 透视表插件契约。无 Vue。
 * 不进 chrome UiFactory。契约跟 AG 轴（rowGroup / pivot / value）。
 */
import type { UiProps } from '../props'

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

export interface UiPivotPlugin<TNode = any> {
  pivotTable: (props: UiPivotTableProps) => TNode
}

function notInstalled(): never {
  throw new Error(PIVOT_PLUGIN_NOT_INSTALLED)
}

export function unimplementedPivotPlugin<TNode = any>(): UiPivotPlugin<TNode> {
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

export function pivotAggregateOf(value?: string | null): UiPivotAggregate {
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

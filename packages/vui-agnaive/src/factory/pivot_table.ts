/*
 * AG Grid Enterprise pivotMode。契约跟 AG 轴；本轮 rowData，不接 pivotRows。
 */
import { h } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import type { ColDef, IAggFuncParams } from 'ag-grid-community'
import type { UiPivotPlugin, UiPivotTableProps } from '@mmda/vui'
import { htmlAttributesOf, pivotAggregateOf, pivotDataOf, pivotHookClass } from '@mmda/vui'

function distinctCount(params: IAggFuncParams): number {
  const seen = new Set<unknown>()
  for (const value of params.values ?? []) {
    if (value != null && value !== '') seen.add(value)
  }
  return seen.size
}

function captionOf(props: UiPivotTableProps, name: string): string | undefined {
  for (const field of [
    ...(props.rows ?? []),
    ...(props.columns ?? []),
    ...(props.values ?? []),
  ]) {
    if (field.name === name && field.caption) return field.caption
  }
  return undefined
}

export function toAgPivotColumnDefs(props: UiPivotTableProps): ColDef[] {
  const names = new Set<string>()
  for (const field of [
    ...(props.rows ?? []),
    ...(props.columns ?? []),
    ...(props.values ?? []),
  ]) {
    names.add(field.name)
  }
  const sample = pivotDataOf(props)[0]
  if (sample) {
    for (const key of Object.keys(sample)) names.add(key)
  }

  const rowIndex = new Map(
    (props.rows ?? []).map((field, index) => [field.name, index]),
  )
  const pivotIndex = new Map(
    (props.columns ?? []).map((field, index) => [field.name, index]),
  )
  const aggOf = new Map(
    (props.values ?? []).map((field) => [
      field.name,
      pivotAggregateOf(field.aggregate),
    ]),
  )

  return [...names].map((name) => {
    const def: ColDef = {
      field: name,
      headerName: captionOf(props, name) ?? name,
      enableRowGroup: true,
      enablePivot: true,
      enableValue: true,
    }
    if (rowIndex.has(name)) {
      def.rowGroup = true
      def.rowGroupIndex = rowIndex.get(name)
      def.hide = true
    }
    if (pivotIndex.has(name)) {
      def.pivot = true
      def.pivotIndex = pivotIndex.get(name)
      def.hide = true
    }
    if (aggOf.has(name)) {
      def.aggFunc = aggOf.get(name)
    }
    return def
  })
}

export function createAgPivotTable(props: UiPivotTableProps) {
  const {
    data: _data,
    rows: _rows,
    columns: _columns,
    values: _values,
    height,
    showFieldList,
    showGroupingBar,
    expandAll,
    formats: _formats,
    onReady,
    class: _className,
    htmlAttributes,
    ...rest
  } = props

  const className = pivotHookClass(props.class)
    .flat()
    .filter(Boolean)
    .join(' ')

  return h(AgGridVue, {
    ...rest,
    ...htmlAttributesOf(props),
    class: className,
    style: {
      width: '100%',
      height: typeof height === 'number' ? `${height}px` : (height ?? '350px'),
    },
    rowData: pivotDataOf(props),
    columnDefs: toAgPivotColumnDefs(props),
    pivotMode: true,
    sideBar: showFieldList === true ? 'columns' : undefined,
    rowGroupPanelShow: showGroupingBar === true ? 'always' : 'never',
    pivotPanelShow: showGroupingBar === true ? 'always' : 'never',
    aggFuncs: { distinctCount },
    animateRows: true,
    onGridReady: (event: { api: { expandAll: () => void } }) => {
      if (expandAll === true) event.api.expandAll()
      onReady?.(event.api)
    },
  } as any)
}

export function createAgPivotPlugin(): UiPivotPlugin {
  return {
    pivotTable: (props) => createAgPivotTable(props),
  }
}

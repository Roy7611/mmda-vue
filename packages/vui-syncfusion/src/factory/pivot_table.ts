/*
 * 透视表是 Builder 插件。把 AG 轴译成 EJ2 dataSourceSettings。
 * 只绑本地 data，不要接 SF Server url / filterRows / pivotRows。
 */
import { defineComponent, h } from 'vue'
import {
  FieldList,
  GroupingBar,
  PivotViewComponent,
} from '@syncfusion/ej2-vue-pivotview'
import type { UiPivotPlugin, UiPivotTableProps } from '@mmda/vui'
import {
  ej2PivotTypeOf,
  htmlAttributesOf,
  pivotDataOf,
  pivotHookClass,
} from '@mmda/vui'
import '@syncfusion/ej2-pivotview/styles/material3.css'

export function toEj2DataSourceSettings(props: UiPivotTableProps) {
  const axis = (fields: UiPivotTableProps['rows'], asValue = false) =>
    (fields ?? []).map((field) => {
      const item: { name: string; caption?: string; type?: string } = {
        name: field.name,
      }
      if (field.caption) item.caption = field.caption
      if (asValue) item.type = ej2PivotTypeOf(field.aggregate)
      return item
    })

  return {
    dataSource: pivotDataOf(props),
    expandAll: props.expandAll === true,
    rows: axis(props.rows),
    columns: axis(props.columns),
    values: axis(props.values, true),
    filters: [],
    formatSettings: (props.formats ?? []).map((item) => ({
      name: item.name,
      format: item.format,
    })),
  }
}

const SfPivotHost = defineComponent({
  name: 'SfPivotHost',
  inheritAttrs: false,
  provide: {
    pivotview: [FieldList, GroupingBar],
  },
  setup(_, { attrs }) {
    return () => h(PivotViewComponent as any, attrs)
  },
})

export function createSfPivotTable(props: UiPivotTableProps) {
  const {
    data: _data,
    rows: _rows,
    columns: _columns,
    values: _values,
    height,
    showFieldList,
    showGroupingBar,
    expandAll: _expandAll,
    formats: _formats,
    onReady,
    class: _className,
    htmlAttributes,
    ...rest
  } = props

  const cssClass = pivotHookClass(props.class)
    .flat()
    .filter(Boolean)
    .join(' ')

  return h(SfPivotHost, {
    ...rest,
    ...htmlAttributesOf(props),
    dataSourceSettings: toEj2DataSourceSettings(props),
    showFieldList: showFieldList === true,
    showGroupingBar: showGroupingBar === true,
    height: height ?? 350,
    cssClass,
    htmlAttributes,
    created: () => onReady?.(undefined),
  })
}

export function createSfPivotPlugin(): UiPivotPlugin {
  return {
    pivotTable: (props) => createSfPivotTable(props),
  }
}

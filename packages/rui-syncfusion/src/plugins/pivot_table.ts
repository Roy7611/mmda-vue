import {
  createElement,
  lazy,
  Suspense,
  type ComponentType,
  type ReactElement,
} from 'react'
import {
  ej2PivotTypeOf,
  pivotDataOf,
  pivotHookClass,
  UiPluginName,
  type UiPivotTableProps,
  type UiPlugin,
} from '@mmda/core'
import { joinClass, reactDomProps } from './utils'

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

function MissingPivot(): ReactElement {
  return createElement(
    'p',
    { className: 'mmda-pivot-missing' },
    'Pivot table requires @syncfusion/ej2-react-pivotview',
  )
}

const PivotImpl = lazy(async (): Promise<{
  default: ComponentType<any>
  services: any[]
}> => {
  try {
    // @ts-ignore -- optional peer；未安装时回落 MissingPivot
    const mod: any = await import(/* @vite-ignore */ '@syncfusion/ej2-react-pivotview')
    return {
      default: mod.PivotViewComponent as ComponentType<any>,
      services: [mod.FieldList, mod.GroupingBar],
    }
  } catch {
    return { default: MissingPivot, services: [] }
  }
})

export function SfPivotTable(props: UiPivotTableProps): ReactElement {
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

  return createElement(
    Suspense,
    { fallback: null },
    createElement(PivotImpl as any, {
      ...rest,
      ...reactDomProps(props),
      cssClass: joinClass(pivotHookClass(props.class)),
      dataSourceSettings: toEj2DataSourceSettings(props),
      showFieldList: showFieldList === true,
      showGroupingBar: showGroupingBar === true,
      height: height ?? 350,
      htmlAttributes,
      created: () => onReady?.(undefined),
    }),
  )
}

export function createSfPivotPlugin(): UiPlugin {
  return {
    name: UiPluginName.pivotTable,
    buildUi(_context, props) {
      return SfPivotTable(props as UiPivotTableProps)
    },
  }
}

import { defineComponent, h, provide } from 'vue'
import type { UiCalendarHeatMapProps, UiChartData, UiChartFactory, UiChartProps, UiCircularGaugeProps, UiLinearGaugeProps, UiGeoHeatMapProps, UiHeatMapProps, UiSankeyProps, UiSmithChartProps, UiSparklineProps, UiStockChartProps, UiTreeMapProps, UiFunnelProps, UiPyramidProps, UiWaterfallProps, UiBoxPlotProps, UiHistogramProps, UiBubbleProps, UiBulletProps } from '@mmda/vui'
import { chartHookClass, chartShortcuts, htmlAttributesOf, resolveChartData, resolveChartType, sankeyLabelOf, sankeyNodesOf, sparklinePointsOf, stockChartHasVolume, stockChartKeysOf, treeMapLabelOf, treeMapWeightedOf, unsupportedChartMethod } from '@mmda/vui'
import {
  CandleSeries,
  ColumnSeries,
  DateTime,
  HiloOpenCloseSeries,
} from '@syncfusion/ej2-charts'
import {
  AccumulationChartComponent,
  ChartComponent,
  SankeyComponent,
  SmithchartComponent,
  SparklineComponent,
  StockChartComponent,
  BulletChartComponent,
} from '@syncfusion/ej2-vue-charts'
import { CircularGaugeComponent } from '@syncfusion/ej2-vue-circulargauge'
import { LinearGaugeComponent } from '@syncfusion/ej2-vue-lineargauge'
import { HeatMapComponent } from '@syncfusion/ej2-vue-heatmap'
import { MapsComponent } from '@syncfusion/ej2-vue-maps'
import { TreeMapComponent } from '@syncfusion/ej2-vue-treemap'

function ej2CartesianType(
  type: ReturnType<typeof resolveChartType>,
  orientation?: UiChartProps['orientation'],
): string {
  if (type === 'bar') return orientation === 'horizontal' ? 'Bar' : 'Column'
  if (type === 'area') return 'Area'
  if (type === 'line') return 'Line'
  if (type === 'scatter') return 'Scatter'
  if (type === 'radar') return 'Radar'
  return 'Column'
}

function cartesianSeries(data: UiChartData, props: UiChartProps) {
  const type = resolveChartType(props)
  const ejType = ej2CartesianType(type, props.orientation)
  const labels = data.labels ?? []
  return (
    data.datasets.map((set) => ({
      type: ejType,
      dataSource: labels.map((label, i) => ({
        x: label,
        y: set.data?.[i],
      })),
      xName: 'x',
      yName: 'y',
      name: set.label,
    })) ?? []
  )
}

function accumulationPoints(data: UiChartData) {
  const labels = data.labels ?? []
  const values = data.datasets[0]?.data ?? []
  return labels.map((x, i) => ({ x, y: values[i] ?? 0 }))
}

function renderChart(data: UiChartData, props: UiChartProps = {}) {
  const resolved = resolveChartData(data, props)
  const type = resolveChartType(props)
  const {
    data: _d,
    type: _t,
    stacked,
    orientation,
    options,
    htmlAttributes,
    class: className,
    ...rest
  } = props
  const classList = chartHookClass('chart', className)
  const attrs = htmlAttributesOf(props)

  if (type === 'pie' || type === 'doughnut') {
    return h(AccumulationChartComponent as any, {
      ...rest,
      ...options,
      htmlAttributes: attrs,
      class: classList,
      series: [
        {
          type: type === 'doughnut' ? 'Doughnut' : 'Pie',
          dataSource: accumulationPoints(resolved),
          xName: 'x',
          yName: 'y',
        },
      ],
    })
  }

  return h(ChartComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: attrs,
    class: classList,
    primaryXAxis: { valueType: 'Category' },
    series: cartesianSeries(resolved, { ...props, type }),
  })
}

function renderGauge(props: UiCircularGaugeProps) {
  const {
    value,
    min = 0,
    max = 100,
    label,
    needle,
    ranges,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  return h(CircularGaugeComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('circular-gauge', className),
    axes: [
      {
        minimum: min,
        maximum: max,
        pointers: [
          {
            value,
            type: needle === false ? 'RangeBar' : 'Needle',
          },
        ],
        ranges: ranges?.map((range) => ({
          start: range.from,
          end: range.to,
          color: range.color,
          legendText: range.label,
        })),
        annotations: label
          ? [{ content: label, angle: 180, zIndex: '1' }]
          : undefined,
      },
    ],
  })
}

function renderLinearGauge(props: UiLinearGaugeProps) {
  const {
    value,
    min = 0,
    max = 100,
    label,
    needle,
    ranges,
    orientation,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  return h(LinearGaugeComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('linear-gauge', className),
    orientation: orientation === 'horizontal' ? 'Horizontal' : 'Vertical',
    axes: [
      {
        minimum: min,
        maximum: max,
        pointers: [
          {
            value,
            type: needle === false ? 'Bar' : 'Marker',
          },
        ],
        ranges: ranges?.map((range) => ({
          start: range.from,
          end: range.to,
          color: range.color,
        })),
        title: label ? { text: label } : undefined,
      },
    ],
  })
}

function renderHeatMap(props: UiHeatMapProps) {
  const {
    xLabels,
    yLabels,
    values,
    min,
    max,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  return h(HeatMapComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('heat-map', className),
    dataSource: values,
    xAxis: { labels: xLabels },
    yAxis: { labels: yLabels },
    paletteSettings:
      min != null || max != null
        ? { min, max }
        : undefined,
  })
}

function renderGeoHeatMap(props: UiGeoHeatMapProps) {
  const {
    points,
    regions,
    map,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  const layer: Record<string, unknown> = {
    shapeData: map,
  }
  if (regions?.length) {
    layer.dataSource = regions
    layer.shapeDataPath = 'regionId'
    layer.shapePropertyPath = 'name'
    layer.shapeSettings = { colorValuePath: 'value' }
  }
  if (points?.length) {
    layer.bubbleSettings = [
      {
        visible: true,
        dataSource: points.map((p) => ({
          longitude: p.lng,
          latitude: p.lat,
          value: p.value,
        })),
        valuePath: 'value',
        minRadius: 3,
        maxRadius: 20,
      },
    ]
  }
  return h(MapsComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('geo-heat-map', className),
    layers: [layer],
  })
}

function renderCalendarHeatMap(props: UiCalendarHeatMapProps) {
  const {
    dates,
    min,
    max,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  const parsed = (dates ?? [])
    .map((item) => ({ date: new Date(item.date), value: item.value }))
    .filter((item) => Number.isFinite(item.date.getTime()))
  const start = parsed[0]?.date ?? new Date()
  const end = parsed.reduce(
    (latest, item) => (item.date > latest ? item.date : latest),
    start,
  )
  const earliest = parsed.reduce(
    (first, item) => (item.date < first ? item.date : first),
    start,
  )
  const weekStart = new Date(earliest)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const weekMs = 7 * 24 * 60 * 60 * 1000
  const weeks = Math.max(
    1,
    Math.floor((end.getTime() - weekStart.getTime()) / weekMs) + 1,
  )
  const lookup = new Map(
    (dates ?? []).map((item) => [item.date.slice(0, 10), item.value]),
  )
  const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const dataSource: number[][] = []
  for (let y = 0; y < 7; y++) {
    const row: number[] = []
    for (let w = 0; w < weeks; w++) {
      const cell = new Date(weekStart)
      cell.setDate(cell.getDate() + w * 7 + y)
      row.push(lookup.get(ymd(cell)) ?? 0)
    }
    dataSource.push(row)
  }
  return h(HeatMapComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('calendar-heat-map', className),
    dataSource,
    xAxis: {
      valueType: 'DateTime',
      minimum: weekStart,
      maximum: end,
      intervalType: 'Days',
      showLabelOn: 'Months',
      labelFormat: 'MMM',
      increment: 7,
    },
    yAxis: {
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      isInversed: true,
    },
    paletteSettings:
      min != null || max != null
        ? { min, max }
        : undefined,
  })
}

function ej2BoxSize(value?: string | number) {
  if (value == null || value === '') return undefined
  return typeof value === 'number' ? `${value}px` : String(value)
}

function renderSankey(props: UiSankeyProps) {
  const {
    nodes: nodeProps,
    links,
    orientation,
    width,
    height,
    labelOf,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  const nodes = sankeyNodesOf({ nodes: nodeProps, links })
  return h(SankeyComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('sankey', className),
    width: ej2BoxSize(width),
    height: ej2BoxSize(height),
    orientation: orientation === 'vertical' ? 'Vertical' : 'Horizontal',
    nodes: nodes.map((node) => ({
      id: node.id,
      label: { text: sankeyLabelOf(node, labelOf) },
    })),
    links: (links ?? []).map((link) => ({
      sourceId: link.source,
      targetId: link.target,
      value: link.value,
    })),
  })
}

function renderSmithChart(props: UiSmithChartProps) {
  const {
    series,
    type,
    title,
    width,
    height,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  return h(SmithchartComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('smith-chart', className),
    width: ej2BoxSize(width),
    height: ej2BoxSize(height),
    renderType: type === 'admittance' ? 'Admittance' : 'Impedance',
    title: title ? { visible: true, text: title } : undefined,
    series: (series ?? []).map((item) => ({
      name: item.name,
      points: item.points,
    })),
  })
}

function ej2SparklineType(type?: UiSparklineProps['type']): string {
  if (type === 'column') return 'Column'
  if (type === 'area') return 'Area'
  if (type === 'winLoss') return 'WinLoss'
  if (type === 'pie') return 'Pie'
  return 'Line'
}

function renderSparkline(props: UiSparklineProps) {
  const {
    data,
    type,
    width,
    height,
    fill,
    highColor,
    lowColor,
    startColor,
    endColor,
    negativeColor,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  const points = sparklinePointsOf(data)
  const category = points.some((p) => typeof p.x === 'string')
  return h(SparklineComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('sparkline', className),
    width: ej2BoxSize(width),
    height: ej2BoxSize(height),
    type: ej2SparklineType(type),
    dataSource: points,
    xName: 'x',
    yName: 'y',
    valueType: category ? 'Category' : 'Numeric',
    fill,
    highPointColor: highColor,
    lowPointColor: lowColor,
    startPointColor: startColor,
    endPointColor: endColor,
    negativePointColor: negativeColor,
  })
}

const SfStockChart = defineComponent({
  name: 'MmdaSfStockChart',
  inheritAttrs: false,
  setup(_, { attrs }) {
    provide('stockChart', [
      DateTime,
      CandleSeries,
      HiloOpenCloseSeries,
      ColumnSeries,
    ])
    return () => h(StockChartComponent as any, { ...attrs })
  },
})

function renderStockChart(props: UiStockChartProps) {
  const {
    data,
    type,
    width,
    height,
    periodSelector,
    htmlAttributes,
    class: className,
    options,
    xName: _x,
    open: _o,
    high: _h,
    low: _l,
    close: _c,
    volume: _vol,
    ...rest
  } = props
  const keys = stockChartKeysOf(props)
  const rows = data ?? []
  const hasVolume = stockChartHasVolume(rows, keys.volume)
  return h(SfStockChart, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('stock-chart', className),
    width: ej2BoxSize(width),
    height: ej2BoxSize(height),
    enablePeriodSelector: periodSelector === true,
    series: [
      {
        type: type === 'ohlc' ? 'OHLC' : 'Candle',
        dataSource: rows,
        xName: keys.xName,
        open: keys.open,
        high: keys.high,
        low: keys.low,
        close: keys.close,
        volume: hasVolume ? keys.volume : undefined,
      },
    ],
  })
}

function sfTreeMapData(
  nodes: ReturnType<typeof treeMapWeightedOf>,
  labelOf?: UiTreeMapProps['labelOf'],
): Record<string, unknown>[] {
  return nodes.map((node) => ({
    name: node.name,
    value: node.value,
    label: treeMapLabelOf(node, labelOf),
    children: node.children?.length
      ? sfTreeMapData(node.children, labelOf)
      : undefined,
  }))
}

function renderTreeMap(props: UiTreeMapProps) {
  const {
    data,
    width,
    height,
    labelOf,
    palette,
    layout,
    drillDown,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  const weighted = treeMapWeightedOf(data)
  return h(TreeMapComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('tree-map', className),
    width: ej2BoxSize(width),
    height: ej2BoxSize(height),
    dataSource: sfTreeMapData(weighted, labelOf),
    weightValuePath: 'value',
    leafItemSettings: {
      labelPath: labelOf ? 'label' : 'name',
    },
    palette,
    layoutType: layout === 'sliceAndDice' ? 'SliceAndDiceAuto' : 'Squarified',
    enableDrillDown: drillDown === true,
  })
}

function renderAccumulationKind(
  kind: 'funnel' | 'pyramid',
  props: UiFunnelProps | UiPyramidProps,
) {
  const {
    data,
    width,
    height,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  return h(AccumulationChartComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass(kind, className),
    width: ej2BoxSize(width),
    height: ej2BoxSize(height),
    series: [
      {
        type: kind === 'pyramid' ? 'Pyramid' : 'Funnel',
        dataSource: (data ?? []).map((item) => ({
          x: item.name,
          y: item.value,
        })),
        xName: 'x',
        yName: 'y',
      },
    ],
  })
}

function renderWaterfall(props: UiWaterfallProps) {
  const {
    data,
    width,
    height,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  const rows = data ?? []
  const sumIndexes = rows
    .map((item, i) => (item.total ? i : -1))
    .filter((i) => i >= 0)
  return h(ChartComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('waterfall', className),
    width: ej2BoxSize(width),
    height: ej2BoxSize(height),
    primaryXAxis: { valueType: 'Category' },
    series: [
      {
        type: 'Waterfall',
        dataSource: rows.map((item) => ({ x: item.name, y: item.value })),
        xName: 'x',
        yName: 'y',
        sumIndexes,
      },
    ],
  })
}

function renderBoxPlot(props: UiBoxPlotProps) {
  const {
    data,
    width,
    height,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  return h(ChartComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('box-plot', className),
    width: ej2BoxSize(width),
    height: ej2BoxSize(height),
    primaryXAxis: { valueType: 'Category' },
    series: [
      {
        type: 'BoxAndWhisker',
        dataSource: (data ?? []).map((item) => ({
          x: item.name,
          y: [item.min, item.q1, item.median, item.q3, item.max],
        })),
        xName: 'x',
        yName: 'y',
      },
    ],
  })
}

function renderHistogram(props: UiHistogramProps) {
  const {
    values,
    bins,
    width,
    height,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  return h(ChartComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('histogram', className),
    width: ej2BoxSize(width),
    height: ej2BoxSize(height),
    series: [
      {
        type: 'Histogram',
        dataSource: (values ?? []).map((y) => ({ y })),
        yName: 'y',
        binInterval: bins,
      },
    ],
  })
}

function renderBubble(props: UiBubbleProps) {
  const {
    data,
    width,
    height,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  return h(ChartComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('bubble', className),
    width: ej2BoxSize(width),
    height: ej2BoxSize(height),
    series: [
      {
        type: 'Bubble',
        dataSource: data ?? [],
        xName: 'x',
        yName: 'y',
        size: 'size',
      },
    ],
  })
}

function renderBullet(props: UiBulletProps) {
  const {
    value,
    target,
    min,
    max,
    ranges,
    orientation,
    width,
    height,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  return h(BulletChartComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('bullet', className),
    width: ej2BoxSize(width),
    height: ej2BoxSize(height),
    value,
    target,
    minimum: min,
    maximum: max,
    orientation: orientation === 'vertical' ? 'Vertical' : 'Horizontal',
    ranges: ranges?.map((range) => ({
      end: range.to,
      color: range.color,
    })),
  })
}

function comboEj2Type(
  type: UiChartData['datasets'][number]['type'],
  orientation?: UiChartProps['orientation'],
): string {
  if (type === 'line') return 'Line'
  if (type === 'area') return 'Area'
  return orientation === 'horizontal' ? 'Bar' : 'Column'
}

function renderComboChart(data: UiChartData, props: UiChartProps = {}) {
  const resolved = resolveChartData(data, props)
  const {
    data: _d,
    type: _t,
    stacked,
    orientation,
    options,
    htmlAttributes,
    class: className,
    ...rest
  } = props
  const labels = resolved.labels ?? []
  return h(ChartComponent as any, {
    ...rest,
    ...options,
    htmlAttributes: htmlAttributesOf(props),
    class: chartHookClass('combo-chart', className),
    primaryXAxis: { valueType: 'Category' },
    series: resolved.datasets.map((set) => ({
      type: comboEj2Type(set.type, orientation),
      dataSource: labels.map((label, i) => ({
        x: label,
        y: set.data?.[i],
      })),
      xName: 'x',
      yName: 'y',
      name: set.label,
      stacked,
    })),
  })
}

export function createSfChartFactory(): UiChartFactory {
  const chart = (data: UiChartData, props?: UiChartProps) =>
    renderChart(data, props)
  return {
    chart,
    ...chartShortcuts(chart),
    circularGauge: renderGauge,
    linearGauge: renderLinearGauge,
    heatMap: renderHeatMap,
    geoHeatMap: renderGeoHeatMap,
    calendarHeatMap: renderCalendarHeatMap,
    sankey: renderSankey,
    smithChart: renderSmithChart,
    sparkline: renderSparkline,
    stockChart: renderStockChart,
    treeMap: renderTreeMap,
    funnel: (props) => renderAccumulationKind('funnel', props),
    pyramid: (props) => renderAccumulationKind('pyramid', props),
    waterfall: renderWaterfall,
    boxPlot: renderBoxPlot,
    histogram: renderHistogram,
    bubble: renderBubble,
    bullet: renderBullet,
    sunburst: unsupportedChartMethod(
      'sunburst',
    ) as UiChartFactory['sunburst'],
    comboChart: renderComboChart,
  }
}

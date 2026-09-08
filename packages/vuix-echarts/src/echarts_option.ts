import type {
  UiBoxPlotProps,
  UiBubbleProps,
  UiCalendarHeatMapProps,
  UiChartData,
  UiChartProps,
  UiCircularGaugeProps,
  UiComboSeriesType,
  UiFunnelProps,
  UiGeoHeatMapProps,
  UiHeatMapProps,
  UiSankeyProps,
  UiStockChartProps,
  UiSunburstProps,
  UiTreeMapProps,
} from '@mmda/vui'
import {
  resolveChartData,
  resolveChartType,
  sankeyLabelOf,
  sankeyNodesOf,
  stockChartHasVolume,
  stockChartKeysOf,
  treeMapLabelOf,
  treeMapWeightedOf,
} from '@mmda/vui'

const GEO_MAP_NAME = 'mmda-geo'

function labelsOf(data: UiChartData): string[] {
  return (
    data.labels ??
    data.datasets[0]?.data.map((_: number, i: number) => String(i + 1)) ??
    []
  )
}

function pieData(data: UiChartData) {
  const labels = labelsOf(data)
  const values = data.datasets[0]?.data ?? []
  return labels.map((name, i) => ({ name, value: values[i] ?? 0 }))
}

export function echartsOptionOf(
  data: UiChartData,
  props?: UiChartProps,
): Record<string, unknown> {
  const resolved = resolveChartData(data, props)
  const type = resolveChartType(props)
  const stacked = props?.stacked === true
  const horizontal = props?.orientation === 'horizontal'
  const labels = labelsOf(resolved)
  const legend = resolved.datasets.map((d) => d.label).filter(Boolean)

  if (type === 'pie' || type === 'doughnut') {
    return {
      tooltip: { trigger: 'item' },
      legend: { data: labels },
      series: [
        {
          type: 'pie',
          radius: type === 'doughnut' ? ['45%', '70%'] : '65%',
          data: pieData(resolved),
        },
      ],
      ...props?.options,
    }
  }

  if (type === 'radar') {
    return {
      tooltip: {},
      legend: { data: legend },
      radar: {
        indicator: labels.map((name) => ({ name })),
      },
      series: [
        {
          type: 'radar',
          data: resolved.datasets.map((set) => ({
            name: set.label,
            value: set.data,
          })),
        },
      ],
      ...props?.options,
    }
  }

  if (type === 'scatter') {
    return {
      tooltip: { trigger: 'item' },
      legend: { data: legend },
      xAxis: {},
      yAxis: {},
      series: resolved.datasets.map((set) => ({
        type: 'scatter',
        name: set.label,
        data: set.data.map((y, i) => [i, y]),
      })),
      ...props?.options,
    }
  }

  const categoryAxis = { type: 'category', data: labels }
  const valueAxis = { type: 'value' }
  const seriesType = type === 'area' ? 'line' : type === 'bar' ? 'bar' : 'line'

  return {
    tooltip: { trigger: 'axis' },
    legend: { data: legend },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: resolved.datasets.map((set) => ({
      type: seriesType,
      name: set.label,
      data: set.data,
      stack: stacked ? 'total' : undefined,
      areaStyle: type === 'area' ? {} : undefined,
    })),
    ...props?.options,
  }
}

export function echartsGaugeOptionOf(
  props: UiCircularGaugeProps,
): Record<string, unknown> {
  const min = props.min ?? 0
  const max = props.max ?? 100
  const span = max - min || 1
  const axisColor = props.ranges?.length
    ? props.ranges.map((range) => [
        (range.to - min) / span,
        range.color ?? '#5470c6',
      ])
    : undefined

  return {
    series: [
      {
        type: 'gauge',
        min,
        max,
        pointer: { show: props.needle !== false },
        axisLine: axisColor
          ? { lineStyle: { color: axisColor } }
          : undefined,
        data: [{ value: props.value, name: props.label }],
      },
    ],
    ...props.options,
  }
}

function numericExtent(
  values: number[],
  min?: number,
  max?: number,
): { min: number; max: number } {
  const lo = min ?? Math.min(...values, 0)
  const hi = max ?? Math.max(...values, 1)
  return { min: lo, max: hi === lo ? lo + 1 : hi }
}

export function echartsHeatMapOptionOf(
  props: UiHeatMapProps,
): Record<string, unknown> {
  const xLabels = props.xLabels ?? []
  const yLabels = props.yLabels ?? []
  const values = props.values ?? []
  const cells: [number, number, number][] = []
  const nums: number[] = []
  for (let y = 0; y < yLabels.length; y++) {
    for (let x = 0; x < xLabels.length; x++) {
      const v = values[y]?.[x] ?? 0
      cells.push([x, y, v])
      nums.push(v)
    }
  }
  const extent = numericExtent(nums, props.min, props.max)
  return {
    tooltip: {},
    xAxis: { type: 'category', data: xLabels },
    yAxis: { type: 'category', data: yLabels },
    visualMap: { min: extent.min, max: extent.max, calculable: true },
    series: [{ type: 'heatmap', data: cells }],
    ...props.options,
  }
}

export function echartsGeoHeatMapOptionOf(props: UiGeoHeatMapProps): {
  option: Record<string, unknown>
  registerMap?: { name: string; geoJson: object }
} {
  const mapProp = props.map
  const registerMap =
    mapProp && typeof mapProp === 'object'
      ? { name: GEO_MAP_NAME, geoJson: mapProp }
      : undefined
  const mapName =
    typeof mapProp === 'string' && mapProp ? mapProp : GEO_MAP_NAME
  const points = props.points ?? []
  const regions = props.regions ?? []
  const nums = [
    ...points.map((p) => p.value),
    ...regions.map((r) => r.value),
  ]
  const extent = numericExtent(nums, props.min, props.max)
  const series: Record<string, unknown>[] = []
  if (points.length) {
    series.push({
      type: 'heatmap',
      coordinateSystem: 'geo',
      data: points.map((p) => [p.lng, p.lat, p.value]),
    })
  }
  if (regions.length) {
    series.push({
      type: 'map',
      map: mapName,
      data: regions.map((r) => ({ name: r.regionId, value: r.value })),
    })
  }
  return {
    registerMap,
    option: {
      tooltip: {},
      geo: { map: mapName },
      visualMap: { min: extent.min, max: extent.max, calculable: true },
      series,
      ...props.options,
    },
  }
}

export function echartsCalendarHeatMapOptionOf(
  props: UiCalendarHeatMapProps,
): Record<string, unknown> {
  const dates = props.dates ?? []
  const nums = dates.map((d) => d.value)
  const extent = numericExtent(nums, props.min, props.max)
  const years = [
    ...new Set(
      dates.map((d) => {
        const y = new Date(d.date).getFullYear()
        return Number.isFinite(y) ? y : new Date().getFullYear()
      }),
    ),
  ]
  const range = years.length === 1 ? years[0] : years
  return {
    tooltip: {},
    visualMap: {
      min: extent.min,
      max: extent.max,
      orient: 'horizontal',
    },
    calendar: { range: range ?? new Date().getFullYear() },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: dates.map((d) => [d.date, d.value]),
      },
    ],
    ...props.options,
  }
}

export function echartsSankeyOptionOf(
  props: UiSankeyProps,
): Record<string, unknown> {
  const nodes = sankeyNodesOf(props)
  const links = props.links ?? []
  return {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'sankey',
        orient: props.orientation === 'vertical' ? 'vertical' : 'horizontal',
        data: nodes.map((node) => ({ name: node.id })),
        links: links.map((link) => ({
          source: link.source,
          target: link.target,
          value: link.value,
        })),
        label: {
          formatter: (params: { name?: string }) => {
            const id = String(params.name ?? '')
            const node = nodes.find((item) => item.id === id) ?? { id }
            return sankeyLabelOf(node, props.labelOf)
          },
        },
      },
    ],
    ...props.options,
  }
}

export function echartsStockChartOptionOf(
  props: UiStockChartProps,
): Record<string, unknown> {
  const keys = stockChartKeysOf(props)
  const rows = props.data ?? []
  const hasVolume = stockChartHasVolume(rows, keys.volume)
  const categories = rows.map((row) => row[keys.xName])
  const candle = rows.map((row) => [
    Number(row[keys.open]),
    Number(row[keys.close]),
    Number(row[keys.low]),
    Number(row[keys.high]),
  ])
  const series: Record<string, unknown>[] = [
    { type: 'candlestick', data: candle },
  ]
  if (hasVolume) {
    series.push({
      type: 'bar',
      data: rows.map((row) => Number(row[keys.volume])),
      xAxisIndex: 1,
      yAxisIndex: 1,
    })
    return {
      tooltip: { trigger: 'axis' },
      grid: [{ bottom: '32%' }, { top: '76%', height: '16%' }],
      xAxis: [
        { type: 'category', data: categories, gridIndex: 0 },
        { type: 'category', data: categories, gridIndex: 1 },
      ],
      yAxis: [{ gridIndex: 0, scale: true }, { gridIndex: 1 }],
      series,
      ...props.options,
    }
  }
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: categories },
    yAxis: { scale: true },
    series,
    ...props.options,
  }
}

export function echartsTreeMapOptionOf(
  props: UiTreeMapProps,
): Record<string, unknown> {
  const data = treeMapWeightedOf(props.data)
  return {
    series: [
      {
        type: 'treemap',
        data,
        color: props.palette,
        label: {
          formatter: (params: { data?: { name?: string; value?: number } }) => {
            const item = params.data ?? { name: '' }
            return treeMapLabelOf(
              {
                name: String(item.name ?? ''),
                value: item.value,
              },
              props.labelOf,
            )
          },
        },
      },
    ],
    ...props.options,
  }
}

export function echartsFunnelOptionOf(
  props: UiFunnelProps,
): Record<string, unknown> {
  return {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'funnel',
        data: (props.data ?? []).map((item) => ({
          name: item.name,
          value: item.value,
        })),
      },
    ],
    ...props.options,
  }
}

export function echartsBoxPlotOptionOf(
  props: UiBoxPlotProps,
): Record<string, unknown> {
  const rows = props.data ?? []
  return {
    tooltip: { trigger: 'item' },
    xAxis: { type: 'category', data: rows.map((item) => item.name) },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'boxplot',
        data: rows.map((item) => [
          item.min,
          item.q1,
          item.median,
          item.q3,
          item.max,
        ]),
      },
    ],
    ...props.options,
  }
}

export function echartsBubbleOptionOf(
  props: UiBubbleProps,
): Record<string, unknown> {
  return {
    tooltip: { trigger: 'item' },
    xAxis: {},
    yAxis: {},
    series: [
      {
        type: 'scatter',
        data: (props.data ?? []).map((point) => [
          point.x,
          point.y,
          point.size,
        ]),
        symbolSize: (value: number[]) => value[2],
      },
    ],
    ...props.options,
  }
}

function echartsComboSeriesType(type?: UiComboSeriesType): string {
  return type === 'line' || type === 'area' ? 'line' : 'bar'
}

export function echartsComboOptionOf(
  data: UiChartData,
  props?: UiChartProps,
): Record<string, unknown> {
  const resolved = resolveChartData(data, props)
  const stacked = props?.stacked === true
  const horizontal = props?.orientation === 'horizontal'
  const labels = labelsOf(resolved)
  const legend = resolved.datasets.map((d) => d.label).filter(Boolean)
  const categoryAxis = { type: 'category', data: labels }
  const valueAxis = { type: 'value' }
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: legend },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: resolved.datasets.map((set) => ({
      type: echartsComboSeriesType(set.type),
      name: set.label,
      data: set.data,
      stack: stacked ? 'total' : undefined,
      areaStyle: set.type === 'area' ? {} : undefined,
    })),
    ...props?.options,
  }
}

export function echartsSunburstOptionOf(
  props: UiSunburstProps,
): Record<string, unknown> {
  const data = treeMapWeightedOf(props.data)
  return {
    series: [
      {
        type: 'sunburst',
        data,
        label: {
          formatter: (params: { data?: { name?: string; value?: number } }) => {
            const item = params.data ?? { name: '' }
            return treeMapLabelOf(
              {
                name: String(item.name ?? ''),
                value: item.value,
              },
              props.labelOf,
            )
          },
        },
      },
    ],
    ...props.options,
  }
}

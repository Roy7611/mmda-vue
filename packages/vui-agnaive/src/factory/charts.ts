import { h } from 'vue'
import type {
  UiChartData,
  UiChartFactory,
  UiChartProps,
  UiCircularGaugeProps,
  UiLinearGaugeProps,
  UiGeoHeatMapProps,
  UiHeatMapProps,
  UiSankeyProps,
  UiSparklineProps,
  UiStockChartProps,
  UiTreeMapProps,
  UiFunnelProps,
  UiPyramidProps,
  UiWaterfallProps,
  UiBoxPlotProps,
  UiHistogramProps,
  UiBubbleProps,
  UiSunburstProps,
} from '@mmda/vui'
import {
  chartBoxStyle,
  chartHookClass,
  chartShortcuts,
  htmlAttributesOf,
  resolveChartData,
  resolveChartType,
  sankeyLabelOf,
  sankeyNodesOf,
  sparklinePointsOf,
  stockChartHasVolume,
  stockChartKeysOf,
  treeMapLabelOf,
  treeMapWeightedOf,
  unsupportedChartMethod,
  chartNotSupportedMessage,
} from '@mmda/vui'
import * as AgChartsVue from 'ag-charts-vue3'
import { AgCharts, AgGauge, AgSparkline } from 'ag-charts-vue3'

function rowsOf(data: UiChartData): Record<string, unknown>[] {
  const labels = data.labels ?? []
  return labels.map((category, i) => {
    const row: Record<string, unknown> = { category }
    data.datasets.forEach((set, di) => {
      row[`y${di}`] = set.data[i]
    })
    return row
  })
}

function agSeriesType(type: ReturnType<typeof resolveChartType>): string {
  if (type === 'doughnut') return 'donut'
  if (type === 'area') return 'area'
  if (type === 'radar') return 'radar-line'
  return type
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
  const seriesType = agSeriesType(type)
  const pieLike = type === 'pie' || type === 'doughnut'
  const radar = type === 'radar'
  const series = resolved.datasets.map((set, di) => {
    if (pieLike) {
      return {
        type: seriesType,
        angleKey: `y${di}`,
        legendItemKey: 'category',
        stacked,
      }
    }
    if (radar) {
      return {
        type: 'radar-line',
        angleKey: 'category',
        radiusKey: `y${di}`,
        radiusName: set.label,
      }
    }
    return {
      type: seriesType,
      xKey: 'category',
      yKey: `y${di}`,
      yName: set.label,
      stacked,
      direction: orientation === 'horizontal' ? 'horizontal' : undefined,
    }
  })
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('chart', className),
    options: {
      data: rowsOf(resolved),
      series,
      ...options,
    },
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
  return h(AgGauge as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('circular-gauge', className),
    options: {
      type: 'radial-gauge',
      value,
      scale: {
        min,
        max,
        fills: ranges?.map((range) => ({
          color: range.color,
        })),
      },
      needle: { enabled: needle !== false },
      label: label ? { text: label } : undefined,
      ...options,
    },
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
  return h(AgGauge as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('linear-gauge', className),
    options: {
      type: 'linear-gauge',
      value,
      direction: orientation === 'horizontal' ? 'horizontal' : 'vertical',
      scale: {
        min,
        max,
        fills: ranges?.map((range) => ({
          color: range.color,
        })),
      },
      needle: { enabled: needle === true },
      label: label ? { text: label } : undefined,
      ...options,
    },
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
  const data: { x: string; y: string; value: number }[] = []
  for (let y = 0; y < yLabels.length; y++) {
    for (let x = 0; x < xLabels.length; x++) {
      data.push({
        x: xLabels[x],
        y: yLabels[y],
        value: values[y]?.[x] ?? 0,
      })
    }
  }
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('heat-map', className),
    options: {
      data,
      series: [
        {
          type: 'heatmap',
          xKey: 'x',
          yKey: 'y',
          colorKey: 'value',
          colorScale:
            min != null || max != null
              ? { domain: [min ?? 0, max ?? 1] }
              : undefined,
        },
      ],
      ...options,
    },
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
  const series: Record<string, unknown>[] = []
  let data: Record<string, unknown>[] = []
  if (regions?.length) {
    data = regions.map((r) => ({ name: r.regionId, value: r.value }))
    series.push({
      type: 'map-shape',
      idKey: 'name',
      colorKey: 'value',
    })
  }
  if (points?.length) {
    const markerData = points.map((p) => ({
      lat: p.lat,
      lon: p.lng,
      value: p.value,
    }))
    if (!regions?.length) data = markerData
    series.push({
      type: 'map-marker',
      latitudeKey: 'lat',
      longitudeKey: 'lon',
      sizeKey: 'value',
      data: regions?.length ? markerData : undefined,
    })
  }
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('geo-heat-map', className),
    options: {
      topology: map,
      data,
      series,
      ...options,
    },
  })
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
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('sankey', className),
    style: chartBoxStyle(width, height),
    options: {
      data: (links ?? []).map((link) => ({
        from: link.source,
        to: link.target,
        size: link.value,
      })),
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      series: [
        {
          type: 'sankey',
          fromKey: 'from',
          toKey: 'to',
          sizeKey: 'size',
          idKey: 'id',
          labelKey: 'label',
          nodes: nodes.map((node) => ({
            id: node.id,
            label: sankeyLabelOf(node, labelOf),
          })),
          direction: orientation === 'vertical' ? 'vertical' : 'horizontal',
        },
      ],
      ...options,
    },
  })
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
  if (type === 'winLoss' || type === 'pie') {
    throw new Error(chartNotSupportedMessage('sparkline'))
  }
  const points = sparklinePointsOf(data)
  const ys = points.map((p) => p.y)
  const high = Math.max(...ys, Number.NEGATIVE_INFINITY)
  const low = Math.min(...ys, Number.POSITIVE_INFINITY)
  const last = points.length - 1
  const itemStyler = (params: { datum?: { y?: number }; datumIndex?: number }) => {
    const i = params.datumIndex ?? 0
    const y = params.datum?.y ?? 0
    if (y < 0 && negativeColor) return { fill: negativeColor }
    if (i === 0 && startColor) return { fill: startColor }
    if (i === last && endColor) return { fill: endColor }
    if (y === high && highColor) return { fill: highColor }
    if (y === low && lowColor) return { fill: lowColor }
    return {}
  }
  return h(AgSparkline as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('sparkline', className),
    style: chartBoxStyle(width, height),
    options: {
      type: type === 'column' ? 'bar' : type === 'area' ? 'area' : 'line',
      data: points,
      xKey: 'x',
      yKey: 'y',
      fill,
      itemStyler,
      marker: { itemStyler },
      width: typeof width === 'number' ? width : undefined,
      height: typeof height === 'number' ? height : undefined,
      ...options,
    },
  })
}

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
  const chartType = type === 'ohlc' ? 'ohlc' : 'candlestick'
  const Financial = (AgChartsVue as Record<string, unknown>).AgFinancialCharts
  if (Financial) {
    return h(Financial as any, {
      ...rest,
      ...htmlAttributesOf(props),
      class: chartHookClass('stock-chart', className),
      style: chartBoxStyle(width, height),
      options: {
        data: rows,
        dateKey: keys.xName,
        openKey: keys.open,
        highKey: keys.high,
        lowKey: keys.low,
        closeKey: keys.close,
        volumeKey: hasVolume ? keys.volume : undefined,
        volume: hasVolume,
        rangeButtons: periodSelector === true,
        chartType,
        ...options,
      },
    })
  }
  const series: Record<string, unknown>[] = [
    {
      type: chartType,
      xKey: keys.xName,
      openKey: keys.open,
      highKey: keys.high,
      lowKey: keys.low,
      closeKey: keys.close,
    },
  ]
  if (hasVolume) {
    series.push({
      type: 'bar',
      xKey: keys.xName,
      yKey: keys.volume,
    })
  }
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('stock-chart', className),
    style: chartBoxStyle(width, height),
    options: {
      data: rows,
      series,
      ...options,
    },
  })
}

function agTreeMapData(
  nodes: ReturnType<typeof treeMapWeightedOf>,
  labelOf?: UiTreeMapProps['labelOf'],
): Record<string, unknown>[] {
  return nodes.map((node) => ({
    name: node.name,
    label: treeMapLabelOf(node, labelOf),
    value: node.value,
    children: node.children?.length
      ? agTreeMapData(node.children, labelOf)
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
    htmlAttributes,
    class: className,
    options,
    layout: _layout,
    drillDown: _drill,
    ...rest
  } = props
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('tree-map', className),
    style: chartBoxStyle(width, height),
    options: {
      data: agTreeMapData(treeMapWeightedOf(data), labelOf),
      series: [
        {
          type: 'treemap',
          labelKey: labelOf ? 'label' : 'name',
          sizeKey: 'value',
          childrenKey: 'children',
          fills: palette,
        },
      ],
      ...options,
    },
  })
}

function agStageValue(data: { name: string; value: number }[]) {
  return data.map((item) => ({ name: item.name, value: item.value }))
}

function renderFunnelKind(
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
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass(kind, className),
    style: chartBoxStyle(width, height),
    options: {
      data: agStageValue(data ?? []),
      series: [
        {
          type: kind,
          stageKey: 'name',
          valueKey: 'value',
        },
      ],
      ...options,
    },
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
  const totals = rows
    .map((item, index) =>
      item.total
        ? { totalType: 'total' as const, index, axisLabel: item.name }
        : null,
    )
    .filter((item): item is { totalType: 'total'; index: number; axisLabel: string } =>
      item != null,
    )
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('waterfall', className),
    style: chartBoxStyle(width, height),
    options: {
      data: rows.map((item) => ({ name: item.name, value: item.value })),
      series: [
        {
          type: 'waterfall',
          xKey: 'name',
          yKey: 'value',
          totals,
        },
      ],
      ...options,
    },
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
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('box-plot', className),
    style: chartBoxStyle(width, height),
    options: {
      data: data ?? [],
      series: [
        {
          type: 'box-plot',
          xKey: 'name',
          minKey: 'min',
          q1Key: 'q1',
          medianKey: 'median',
          q3Key: 'q3',
          maxKey: 'max',
        },
      ],
      ...options,
    },
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
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('histogram', className),
    style: chartBoxStyle(width, height),
    options: {
      data: (values ?? []).map((value) => ({ value })),
      series: [
        {
          type: 'histogram',
          xKey: 'value',
          binCount: bins,
        },
      ],
      ...options,
    },
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
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('bubble', className),
    style: chartBoxStyle(width, height),
    options: {
      data: data ?? [],
      series: [
        {
          type: 'bubble',
          xKey: 'x',
          yKey: 'y',
          sizeKey: 'size',
        },
      ],
      ...options,
    },
  })
}

function renderSunburst(props: UiSunburstProps) {
  const {
    data,
    width,
    height,
    labelOf,
    htmlAttributes,
    class: className,
    options,
    ...rest
  } = props
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('sunburst', className),
    style: chartBoxStyle(width, height),
    options: {
      data: agTreeMapData(treeMapWeightedOf(data), labelOf),
      series: [
        {
          type: 'sunburst',
          labelKey: labelOf ? 'label' : 'name',
          sizeKey: 'value',
          childrenKey: 'children',
        },
      ],
      ...options,
    },
  })
}

function comboAgType(type?: UiChartData['datasets'][number]['type']): string {
  if (type === 'line') return 'line'
  if (type === 'area') return 'area'
  return 'bar'
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
  return h(AgCharts as any, {
    ...rest,
    ...htmlAttributesOf(props),
    class: chartHookClass('combo-chart', className),
    style: chartBoxStyle(props.width, props.height),
    options: {
      data: rowsOf(resolved),
      series: resolved.datasets.map((set, di) => ({
        type: comboAgType(set.type),
        xKey: 'category',
        yKey: `y${di}`,
        yName: set.label,
        stacked,
        direction: orientation === 'horizontal' ? 'horizontal' : undefined,
      })),
      ...options,
    },
  })
}

export function createAgChartFactory(): UiChartFactory {
  const chart = (data: UiChartData, props?: UiChartProps) =>
    renderChart(data, props)
  return {
    chart,
    ...chartShortcuts(chart),
    circularGauge: renderGauge,
    linearGauge: renderLinearGauge,
    heatMap: renderHeatMap,
    geoHeatMap: renderGeoHeatMap,
    calendarHeatMap: unsupportedChartMethod(
      'calendarHeatMap',
    ) as UiChartFactory['calendarHeatMap'],
    sankey: renderSankey,
    smithChart: unsupportedChartMethod(
      'smithChart',
    ) as UiChartFactory['smithChart'],
    sparkline: renderSparkline,
    stockChart: renderStockChart,
    treeMap: renderTreeMap,
    funnel: (props) => renderFunnelKind('funnel', props),
    pyramid: (props) => renderFunnelKind('pyramid', props),
    waterfall: renderWaterfall,
    boxPlot: renderBoxPlot,
    histogram: renderHistogram,
    bubble: renderBubble,
    bullet: unsupportedChartMethod('bullet') as UiChartFactory['bullet'],
    sunburst: renderSunburst,
    comboChart: renderComboChart,
  }
}

import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from 'vue'
import type {
  UiBoxPlotProps,
  UiBubbleProps,
  UiCalendarHeatMapProps,
  UiChartData,
  UiChartFactory,
  UiChartHookKind,
  UiChartProps,
  UiCircularGaugeProps,
  UiFunnelProps,
  UiGeoHeatMapProps,
  UiHeatMapProps,
  UiSankeyProps,
  UiStockChartProps,
  UiSunburstProps,
  UiTreeMapProps,
} from '@mmda/vui'
import {
  chartBoxStyle,
  chartHookClass,
  chartShortcuts,
  htmlAttributesOf,
  resolveChartData,
  unsupportedChartMethod,
} from '@mmda/vui'
import {
  echartsBoxPlotOptionOf,
  echartsBubbleOptionOf,
  echartsCalendarHeatMapOptionOf,
  echartsComboOptionOf,
  echartsFunnelOptionOf,
  echartsGaugeOptionOf,
  echartsGeoHeatMapOptionOf,
  echartsHeatMapOptionOf,
  echartsOptionOf,
  echartsSankeyOptionOf,
  echartsStockChartOptionOf,
  echartsSunburstOptionOf,
  echartsTreeMapOptionOf,
} from './echarts_option'

const EchartsHost = defineComponent({
  name: 'MmdaEcharts',
  props: {
    option: { type: Object as PropType<Record<string, unknown>>, required: true },
    kind: { type: String as PropType<UiChartHookKind>, required: true },
    registerMap: {
      type: Object as PropType<{ name: string; geoJson: object } | null>,
      default: null,
    },
  },
  setup(props, { attrs }) {
    const el = ref<HTMLDivElement>()
    let instance: { resize: () => void; dispose: () => void; setOption: (o: object, n: boolean) => void } | null =
      null
    const paint = async () => {
      if (!el.value) return
      const echarts = await import('echarts')
      if (props.registerMap) {
        echarts.registerMap(
          props.registerMap.name,
          props.registerMap.geoJson as never,
        )
      }
      if (!instance) instance = echarts.init(el.value)
      instance.setOption(props.option, true)
    }
    onMounted(() => void paint())
    onBeforeUnmount(() => {
      instance?.dispose()
      instance = null
    })
    watch(
      () => props.option,
      () => void paint(),
      { deep: true },
    )
    return () =>
      h('div', {
        ...attrs,
        ref: el,
        class: chartHookClass(props.kind, attrs.class),
      })
  },
})

function renderChart(data: UiChartData, props: UiChartProps = {}) {
  const {
    data: _data,
    type,
    stacked,
    orientation,
    options,
    htmlAttributes,
    class: className,
    ...rest
  } = props
  return h(EchartsHost, {
    ...rest,
    ...htmlAttributesOf(props),
    option: echartsOptionOf(data, props),
    kind: 'chart',
    class: className,
  })
}

function renderGauge(props: UiCircularGaugeProps) {
  const { htmlAttributes, class: className, ...rest } = props
  return h(EchartsHost, {
    ...rest,
    ...htmlAttributesOf(props),
    option: echartsGaugeOptionOf(props),
    kind: 'circular-gauge',
    class: className,
  })
}

function restOf(props: Record<string, unknown>) {
  const {
    htmlAttributes: _h,
    class: className,
    options: _o,
    min: _min,
    max: _max,
    xLabels: _x,
    yLabels: _y,
    values: _v,
    points: _p,
    regions: _r,
    map: _m,
    dates: _d,
    nodes: _n,
    links: _l,
    labelOf: _lo,
    orientation: _or,
    width: _w,
    height: _ht,
    data: _data,
    xName: _xn,
    open: _op,
    high: _hi,
    low: _low,
    close: _cl,
    volume: _vol,
    type: _ty,
    periodSelector: _ps,
    palette: _pal,
    layout: _lay,
    drillDown: _dd,
    bins: _bins,
    target: _target,
    ranges: _ranges,
    value: _value,
    ...rest
  } = props
  return { className, rest }
}

function renderHost(
  kind: UiChartHookKind,
  option: Record<string, unknown>,
  props: { width?: string | number; height?: string | number } & Record<
    string,
    unknown
  >,
) {
  const { className, rest } = restOf(props)
  return h(EchartsHost, {
    ...rest,
    ...htmlAttributesOf(props),
    option,
    kind,
    class: className,
    style: chartBoxStyle(props.width, props.height),
  })
}

function renderHeatMap(props: UiHeatMapProps) {
  const { className, rest } = restOf(props as Record<string, unknown>)
  return h(EchartsHost, {
    ...rest,
    ...htmlAttributesOf(props),
    option: echartsHeatMapOptionOf(props),
    kind: 'heat-map',
    class: className,
  })
}

function renderGeoHeatMap(props: UiGeoHeatMapProps) {
  const { option, registerMap } = echartsGeoHeatMapOptionOf(props)
  const { className, rest } = restOf(props as Record<string, unknown>)
  return h(EchartsHost, {
    ...rest,
    ...htmlAttributesOf(props),
    option,
    registerMap: registerMap ?? null,
    kind: 'geo-heat-map',
    class: className,
  })
}

function renderCalendarHeatMap(props: UiCalendarHeatMapProps) {
  const { className, rest } = restOf(props as Record<string, unknown>)
  return h(EchartsHost, {
    ...rest,
    ...htmlAttributesOf(props),
    option: echartsCalendarHeatMapOptionOf(props),
    kind: 'calendar-heat-map',
    class: className,
  })
}

function renderSankey(props: UiSankeyProps) {
  const { className, rest } = restOf(props as Record<string, unknown>)
  return h(EchartsHost, {
    ...rest,
    ...htmlAttributesOf(props),
    option: echartsSankeyOptionOf(props),
    kind: 'sankey',
    class: className,
    style: chartBoxStyle(props.width, props.height),
  })
}

function renderStockChart(props: UiStockChartProps) {
  const { className, rest } = restOf(props as Record<string, unknown>)
  return h(EchartsHost, {
    ...rest,
    ...htmlAttributesOf(props),
    option: echartsStockChartOptionOf(props),
    kind: 'stock-chart',
    class: className,
    style: chartBoxStyle(props.width, props.height),
  })
}

function renderTreeMap(props: UiTreeMapProps) {
  const { className, rest } = restOf(props as Record<string, unknown>)
  return h(EchartsHost, {
    ...rest,
    ...htmlAttributesOf(props),
    option: echartsTreeMapOptionOf(props),
    kind: 'tree-map',
    class: className,
    style: chartBoxStyle(props.width, props.height),
  })
}

export function createEchartsFactory(): UiChartFactory {
  const chart = (data: UiChartData, props?: UiChartProps) =>
    renderChart(resolveChartData(data, props), { ...props, data })
  return {
    chart,
    ...chartShortcuts(chart),
    circularGauge: renderGauge,
    linearGauge: unsupportedChartMethod(
      'linearGauge',
    ) as UiChartFactory['linearGauge'],
    heatMap: renderHeatMap,
    geoHeatMap: renderGeoHeatMap,
    calendarHeatMap: renderCalendarHeatMap,
    sankey: renderSankey,
    smithChart: unsupportedChartMethod(
      'smithChart',
    ) as UiChartFactory['smithChart'],
    sparkline: unsupportedChartMethod(
      'sparkline',
    ) as UiChartFactory['sparkline'],
    stockChart: renderStockChart,
    treeMap: renderTreeMap,
    funnel: (props: UiFunnelProps) =>
      renderHost('funnel', echartsFunnelOptionOf(props), props),
    pyramid: unsupportedChartMethod('pyramid') as UiChartFactory['pyramid'],
    waterfall: unsupportedChartMethod(
      'waterfall',
    ) as UiChartFactory['waterfall'],
    boxPlot: (props: UiBoxPlotProps) =>
      renderHost('box-plot', echartsBoxPlotOptionOf(props), props),
    histogram: unsupportedChartMethod(
      'histogram',
    ) as UiChartFactory['histogram'],
    bubble: (props: UiBubbleProps) =>
      renderHost('bubble', echartsBubbleOptionOf(props), props),
    bullet: unsupportedChartMethod('bullet') as UiChartFactory['bullet'],
    sunburst: (props: UiSunburstProps) =>
      renderHost('sunburst', echartsSunburstOptionOf(props), props),
    comboChart: (data: UiChartData, props?: UiChartProps) =>
      renderHost(
        'combo-chart',
        echartsComboOptionOf(resolveChartData(data, props), props),
        { ...props, data },
      ),
  }
}

export {
  echartsBoxPlotOptionOf,
  echartsBubbleOptionOf,
  echartsCalendarHeatMapOptionOf,
  echartsComboOptionOf,
  echartsFunnelOptionOf,
  echartsGaugeOptionOf,
  echartsGeoHeatMapOptionOf,
  echartsHeatMapOptionOf,
  echartsOptionOf,
  echartsSankeyOptionOf,
  echartsStockChartOptionOf,
  echartsSunburstOptionOf,
  echartsTreeMapOptionOf,
} from './echarts_option'

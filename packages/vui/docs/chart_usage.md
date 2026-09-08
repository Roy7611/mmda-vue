# 图表：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `app.ui.chartFactory`。设计见 [chart.md](./chart.md)。

```ts
import { PrimeVueUiBuilder } from '@mmda/vui-primevue'
import { createPrimeChartFactory } from '@mmda/vui-primevue/charts'

const ui = new PrimeVueUiBuilder()
ui.setChartFactory(createPrimeChartFactory())

const data = {
  labels: ['Q1', 'Q2', 'Q3'],
  datasets: [{ label: '产量', data: [12, 19, 8] }],
}

ui.chartFactory.barChart(data)
ui.chartFactory.lineChart(data)
ui.chartFactory.circularGauge({ value: 72, min: 0, max: 100, label: 'OEE' })
ui.chartFactory.linearGauge({
  value: 72,
  min: 0,
  max: 100,
  label: 'OEE',
  orientation: 'horizontal',
})

ui.chartFactory.heatMap({
  xLabels: ['早', '中', '晚'],
  yLabels: ['线1', '线2'],
  values: [
    [1, 3, 2],
    [4, 0, 5],
  ],
})

const geoJson = { type: 'FeatureCollection', features: [] }

ui.chartFactory.geoHeatMap({
  map: geoJson,
  points: [{ lng: 121.47, lat: 31.23, value: 12 }],
  regions: [{ regionId: 'Shanghai', value: 40 }],
})

ui.chartFactory.calendarHeatMap({
  dates: [
    { date: '2026-01-01', value: 3 },
    { date: '2026-01-02', value: 8 },
  ],
})

ui.chartFactory.sankey({
  links: [
    { source: 'in', target: 'out', value: 12 },
  ],
  orientation: 'horizontal',
  width: '100%',
  height: 320,
  labelOf: (node) => node.label ?? node.id,
})

ui.chartFactory.smithChart({
  series: [
    {
      name: 'Line 1',
      points: [
        { resistance: 10, reactance: 25 },
        { resistance: 8, reactance: 6 },
      ],
    },
  ],
  type: 'impedance',
  title: 'Transmission',
})

ui.chartFactory.sparkline({
  data: [12, 19, 8, 15],
  type: 'line',
  width: 120,
  height: 32,
  fill: '#5470c6',
})

ui.chartFactory.stockChart({
  data: [
    {
      date: '2026-01-02',
      open: 10,
      high: 12,
      low: 9,
      close: 11,
      volume: 1000,
    },
  ],
  type: 'candle',
  periodSelector: false,
})

ui.chartFactory.treeMap({
  data: [
    {
      name: 'root',
      children: [
        { name: 'a', value: 12 },
        { name: 'b', value: 8 },
      ],
    },
  ],
  layout: 'squarified',
  drillDown: false,
  width: '100%',
  height: 320,
  labelOf: (node) => node.name,
})

ui.chartFactory.funnel({
  data: [
    { name: '询盘', value: 100 },
    { name: '成交', value: 40 },
  ],
})
ui.chartFactory.waterfall({
  data: [
    { name: '期初', value: 10, total: true },
    { name: '增产', value: 4 },
    { name: '损耗', value: -2 },
  ],
})
ui.chartFactory.boxPlot({
  data: [{ name: '线1', min: 1, q1: 2, median: 3, q3: 4, max: 5 }],
})
ui.chartFactory.histogram({ values: [1, 2, 2, 3, 5], bins: 4 })
ui.chartFactory.bubble({
  data: [{ x: 1, y: 2, size: 8 }],
})
ui.chartFactory.bullet({ value: 72, target: 80, min: 0, max: 100 })
ui.chartFactory.sunburst({
  data: [{ name: 'root', children: [{ name: 'a', value: 12 }] }],
})
ui.chartFactory.comboChart({
  labels: ['Q1', 'Q2'],
  datasets: [
    { label: '产量', type: 'bar', data: [12, 19] },
    { label: '达成率', type: 'line', data: [80, 90] },
  ],
})
```

Prime Chart.js：`bubble` / `comboChart` 有原生；Gauge / 热图 / 桑基 / 史密斯图 / sparkline / stockChart / treeMap / funnel / pyramid / waterfall / boxPlot / histogram / bullet / sunburst 为 `not supported`。

Syncfusion / AG 按需挂，不 `set` 则图表不进应用包：

```ts
import { createSfChartFactory } from '@mmda/vui-syncfusion/charts'
import { createAgChartFactory } from '@mmda/vui-agnaive/charts'

ui.setChartFactory(createSfChartFactory())
```

要 ECharts 用独立引擎包，见该包 README。不要 `factory.barChart`，不要 `ui.buildBarChart`，不要把 EJ2 `Column` / AG `donut` 写进调用方。地理底图自己传 `map`，vui 不带 GeoJSON。

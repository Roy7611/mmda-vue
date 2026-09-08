# @mmda/vuix-echarts

`UiChartFactory` 的 ECharts 插件。不依赖任何皮肤包。vui 只定契约，见 [vui 图表](../vui/docs/chart.md)。

```ts
import { createEchartsFactory } from '@mmda/vuix-echarts'

ui.setChartFactory(createEchartsFactory())

ui.chartFactory.barChart({
  labels: ['Q1', 'Q2'],
  datasets: [{ label: '产量', data: [12, 19] }],
})
ui.chartFactory.funnel({
  data: [
    { name: '询盘', value: 100 },
    { name: '成交', value: 40 },
  ],
})
ui.chartFactory.comboChart({
  labels: ['Q1', 'Q2'],
  datasets: [
    { label: '产量', type: 'bar', data: [12, 19] },
    { label: '达成率', type: 'line', data: [80, 90] },
  ],
})
```

`echarts` 是 optional peer，动态 `import('echarts')`。未安装时挂载图表会失败。

## 本引擎能力

| vui | echarts |
|---|---|
| `bar` | `bar` |
| `line` | `line` |
| `area` | `line` + `areaStyle` |
| `pie` | `pie` |
| `doughnut` | 内环 pie |
| `scatter` | `scatter` |
| `radar` | `radar` |
| `circularGauge` | `gauge` |
| `linearGauge` | **not supported** |
| `heatMap` | `heatmap` + `visualMap` |
| `geoHeatMap` | `geo` + heatmap |
| `calendarHeatMap` | `calendar` + heatmap |
| `sankey` | `sankey` |
| `smithChart` | **not supported** |
| `sparkline` | **not supported** |
| `stockChart` | `candlestick`（可选成交量柱；无独立 OHLC 类型） |
| `treeMap` | `treemap`（忽略 `sliceAndDice` 与 `drillDown`） |
| `funnel` | `funnel` |
| `pyramid` | **not supported** |
| `waterfall` | **not supported** |
| `boxPlot` | `boxplot` |
| `histogram` | **not supported** |
| `bubble` | `scatter` + `symbolSize` |
| `bullet` | **not supported** |
| `sunburst` | `sunburst` |
| `comboChart` | 多 series `bar` / `line` / `area` |

不要用堆叠柱冒充瀑布，不要用 funnel 冒充 pyramid。

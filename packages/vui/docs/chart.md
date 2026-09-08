# 图表插件

图表不进 chrome `factory`。vui 只定 [`UiChartFactory`](../src/ui/factory/chart.ts)；应用 `setChartFactory` 才挂引擎。皮肤 Builder **默认不挂**。

程序员用法：[chart_usage.md](./chart_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/chart.ts` | `UiChartData` / `UiChartProps` / Gauge、热图、桑基、漏斗、瀑布、箱线、直方图、气泡、子弹图、旭日图、combo 等；未安装 stub |
| `VueUiBuilder.chartFactory` | 默认 `unimplementedChartFactory`；`setChartFactory` |
| 皮肤 `./charts` | 可选：Prime Chart.js、SF EJ2、AG Charts。不要从 `createXxxUiFactory` 引用 |
| 独立引擎包 | 不依赖皮肤；能力见该包 README |

不要 `buildBarChart`。Logic 不画图。core `UiBuilder` 不加图表方法。

## 失败

| 情况 | 错误 |
|---|---|
| 未 `setChartFactory` | `chart plugin not installed` |
| 引擎没有这张图 | `not supported: <method>` |

不要静默空节点，不要用 doughnut 冒充 Gauge。

## 属性

| 属性 | 说明 |
|---|---|
| `data.labels` | 类目 |
| `data.datasets` | `{ label, data: number[] }` |
| `type` | `bar` / `line` / `area` / `pie` / `doughnut` / `scatter` / `radar` |
| `stacked` | 柱/面积堆叠 |
| `orientation` | 柱图 `vertical`（默认）/ `horizontal`。不要把 EJ2 `Column` 写进 vui |
| `options` | 引擎逃逸；能不用就不用 |
| Gauge `value` / `min` / `max` | 单值刻度，不是 labels/datasets |
| Gauge `needle` / `ranges` | 指针与区间色 |
| `linearGauge` | 直线表；`orientation` 默认 `vertical` |
| `heatMap` | `xLabels` × `yLabels`，`values[y][x]` |
| `geoHeatMap` | `points` / `regions` + 调用方 `map`（GeoJSON 或图名）。仓库不内置底图 |
| `calendarHeatMap` | `{ date, value }[]` |
| `sankey` | `links` 必填；`nodes` 可选。`labelOf` 只返回 string。无 `nodeRenderer` |
| `smithChart` | `series[].points` 为 `resistance` / `reactance`；`type` 为 `impedance`（默认）/ `admittance` |
| `sparkline` | `data` 为 `number[]` 或 `{ x?, y }[]`。`type`：`line`（默认）/ `column` / `area` / `winLoss` / `pie` |
| `stockChart` | 行对象 `data`。默认字段 `date/open/high/low/close/volume`。`type`：`candle`（默认）/ `ohlc`。`periodSelector` 默认 false |
| `treeMap` | 嵌套 `{ name, value?, children? }`。`layout`：`squarified`（默认）/ `sliceAndDice`。`drillDown` 默认 false。`labelOf` 只返回 string |
| `funnel` / `pyramid` | `{ name, value }[]` |
| `waterfall` | `{ name, value, total? }[]` |
| `boxPlot` | `{ name, min, q1, median, q3, max }[]` |
| `histogram` | `values: number[]`，可选 `bins` |
| `bubble` | `{ x, y, size }[]` |
| `bullet` | `value` + `target`；可选 `min`/`max`/`ranges`。`orientation` 默认 `horizontal` |
| `sunburst` | 与 treeMap 相同嵌套树 |
| `comboChart` | `datasets[].type` 为 `bar`（默认）/ `line` / `area` |

钩子 class：`mmda-chart`、`mmda-circular-gauge`、`mmda-linear-gauge`、`mmda-heat-map`、`mmda-geo-heat-map`、`mmda-calendar-heat-map`、`mmda-sankey`、`mmda-smith-chart`、`mmda-sparkline`、`mmda-stock-chart`、`mmda-tree-map`、`mmda-funnel`、`mmda-pyramid`、`mmda-waterfall`、`mmda-box-plot`、`mmda-histogram`、`mmda-bubble`、`mmda-bullet`、`mmda-sunburst`、`mmda-combo-chart`。皮肤 `style.css` 不写长相。

## 本轮类型

| vui | Prime Chart.js | EJ2 | AG Charts |
|---|---|---|---|
| `bar` | `bar` | 竖 `Column` / 横 `Bar` | `bar` |
| `line` | `line` | `Line` | `line` |
| `area` | `line` + fill | `Area` | `area` |
| `pie` | `pie` | Accumulation `Pie` | `pie` |
| `doughnut` | `doughnut` | `Doughnut` | `donut` |
| `scatter` | `scatter` | `Scatter` | `scatter` |
| `radar` | `radar` | `Radar` | `radar-line`（Enterprise） |
| `circularGauge` | **not supported** | CircularGauge 包 | `AgGauge`（Enterprise） |
| `linearGauge` | **not supported** | LinearGauge 包 | `linear-gauge`（Enterprise） |
| `heatMap` | **not supported** | HeatMap 包 | `heatmap`（Enterprise） |
| `geoHeatMap` | **not supported** | Maps 包 | `map-shape` / `map-marker`（Enterprise） |
| `calendarHeatMap` | **not supported** | HeatMap 日期轴 | **not supported** |
| `sankey` | **not supported** | `SankeyComponent`（charts 包） | `sankey`（Enterprise） |
| `smithChart` | **not supported** | `SmithchartComponent`（charts 包） | **not supported** |
| `sparkline` | **not supported** | `SparklineComponent`（charts 包） | `AgSparkline`（line / bar / area） |
| `stockChart` | **not supported** | `StockChartComponent`（charts 包） | `candlestick` / `ohlc`（有则 `AgFinancialCharts`） |
| `treeMap` | **not supported** | `TreeMapComponent`（treemap 包） | `treemap`（Enterprise） |
| `funnel` | **not supported** | Accumulation `Funnel` | `funnel` |
| `pyramid` | **not supported** | Accumulation `Pyramid` | `pyramid` |
| `waterfall` | **not supported** | Chart `Waterfall` | `waterfall` |
| `boxPlot` | **not supported** | Chart `BoxAndWhisker` | `box-plot` |
| `histogram` | **not supported** | Chart `Histogram` | `histogram` |
| `bubble` | `bubble` | Chart `Bubble` | `bubble` |
| `bullet` | **not supported** | `BulletChartComponent` | **not supported** |
| `sunburst` | **not supported** | **not supported** | `sunburst`（Enterprise） |
| `comboChart` | mixed datasets | 多 series | 多 series |

`polarArea` 不做。3D / wordcloud / range navigator 不做。Gauge、三类热图、桑基、史密斯图、sparkline、stockChart、treeMap、漏斗/金字塔、瀑布、箱线、直方图、气泡、子弹图、旭日图不进 `chart(type)`（`comboChart` 是多 series）。桑基节点是矩形条+文字，不要 `nodeRenderer`。AG sparkline 没有 `winLoss` / `pie`。Prime 不要 `chartjs-chart-financial`。AG 的 `treeMap` 忽略 `sliceAndDice` 与 `drillDown`。不要用堆叠柱冒充瀑布，不要用 funnel 冒充 pyramid。独立引擎包的能力见该包 README。

AG Charts Enterprise 许可与 AG Grid Enterprise **不是**同一把钥匙。

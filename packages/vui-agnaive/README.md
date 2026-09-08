# @mmda/vui-agnaive

AG Grid Enterprise + Naive UI skin for `@mmda/vui`.

按 **components → factory → builder**：`components/AgGrid` 吃 `data` + `MetaUi`；`createAgNaiveUiFactory` 生产它（`factory.table` / `treeGrid`）。vui Builder 只拼工具栏和会话，不 import ag-grid。表单、弹层、菜单按需引入 Naive UI。不要使用 `NDataTable`。约定见 [vui Builder](../vui/docs/builder.md)。列表远程排序/过滤与 Syncfusion、Prime 同一套：`searchParam` + return Promise，见 [列表契约](../vui/docs/list.md#远程排序--过滤皮肤契约)。

```ts
import { mmdaAgNaive, AgNaiveUiBuilder } from '@mmda/vui-agnaive'

const builder = new AgNaiveUiBuilder()
app.use(mmdaAgNaive, { locale: 'zh', licenseKey: import.meta.env.VITE_AG_GRID_LICENSE })
```

Playground: `pnpm dev:vui`（仿 app 壳，假数据）。

## 图表插件

默认不挂。应用按需：

```ts
import { createAgChartFactory } from '@mmda/vui-agnaive/charts'

ui.setChartFactory(createAgChartFactory())
```

需要 optional peer `ag-charts-vue3`。`circularGauge` / `linearGauge` / `radar` / `heatMap` / `geoHeatMap` / `sankey` / `sparkline` / `stockChart` / `treeMap` / `funnel` / `pyramid` / `waterfall` / `boxPlot` / `histogram` / `bubble` / `sunburst` / `comboChart` 走 AG Charts。`calendarHeatMap` / `smithChart` / `bullet` 为 `not supported`。`sparkline` 的 `winLoss` / `pie` 亦 not supported。Grid 的 license 不能当 Charts 许可。也可用独立包 `@mmda/vuix-echarts`。见 [vui 图表](../vui/docs/chart.md)。

图插件与 Prime 共用 `@mmda/vuix-vf-diagram`：

```ts
import { createVueDiagramPlugin } from '@mmda/vuix-vf-diagram'

ui.setDiagramPlugin(createVueDiagramPlugin())
```

Markdown 共用 `@mmda/vuix-vditor-markdown`：

```ts
import { createMarkdownEditorPlugin } from '@mmda/vuix-vditor-markdown'

ui.setMarkdownEditorPlugin(createMarkdownEditorPlugin())
```

看板用独立包 `@mmda/vuix-svar-kanban`（不进本皮肤）：

```ts
import { createVueKanbanPlugin } from '@mmda/vuix-svar-kanban'

ui.setKanbanPlugin(createVueKanbanPlugin())
```


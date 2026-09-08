# @mmda/vuix-hyper-gantt

DlhSoft [Gantt Chart Hyper Library](https://dlhsoft.com/GanttChartHyperLibrary/) 的 `UiGanttPlugin`。不替换 `@mmda/vui-syncfusion/gantt`。契约见 [vui 甘特插件](../vui/docs/gantt.md)。

```ts
import { createHyperGanttPlugin } from '@mmda/vuix-hyper-gantt'

ui.setGanttPlugin(createHyperGanttPlugin({ license }))
```

optional peer：`@dlhsoft/ganttcharthyperlibrary`（`npm install @dlhsoft/ganttcharthyperlibrary`）。试用可跑；正式授权把 license 字符串传入。打印、MS Project XML、资源平衡走 `UiGanttController`。

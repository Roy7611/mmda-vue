# 甘特插件

甘特不进 chrome `factory`。vui 只定 [`UiGanttPlugin`](../src/ui/factory/gantt.ts)；应用 `setGanttPlugin` 才挂引擎。皮肤 Builder **默认不挂**。

程序员用法：[gantt_usage.md](./gantt_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/gantt.ts` | 任务 / 连线 / `UiGanttViewProps` / 控制器；未安装 stub |
| `VueUiBuilder.ganttPlugin` | 默认 `unimplementedGanttPlugin`；`setGanttPlugin`；`buildGanttView` 转调插件 |
| `@mmda/vui-syncfusion/gantt` | `createSfGanttPlugin`，EJ2 Gantt（App 默认） |
| `@mmda/vuix-hyper-gantt` | `createHyperGanttPlugin`，DlhSoft Hyper Library |

不要 `factory.gantt` / `factory.ganttChart`。Logic 不画甘特。core `UiBuilder` 不加甘特方法。不要叫 `ganttMixin`。不要把 EJ2 `TaskID` 或 DlhSoft `content` / `indentation` 写进调用方。

`buildGanttChart` 是 `buildGanttView` 的别名。`viewKind === gantt` 仍分发到 `buildGanttView`。

## 失败

| 情况 | 错误 |
|---|---|
| 未 `setGanttPlugin` | `gantt plugin not installed` |
| Hyper 未装 peer | host 文案 `Gantt requires @dlhsoft/ganttcharthyperlibrary` |
| Hyper 无 Extras | `getProjectXml` throw `gantt ProjectSerializer not installed` |

不要静默空节点。

## 任务与连线

| 属性 | 说明 |
|---|---|
| `id` / `name` / `startDate` / `endDate` / `duration` | 主键、名称、起止；无 end 时用 `duration`（天） |
| `parentId` | 树；引擎写成缩进或 EJ2 parentID |
| `progress` | 0–100 |
| `type` | `task` / `milestone` / `project` |
| `assignments` | 资源串，如 `R1, R2 [50%]` |
| `expanded` / `hidden` | 摘要展开、层次隐藏 |
| `baselineStart` / `baselineEnd` | 基线 |
| `links.type` | `FS` `SS` `FF` `SF` |
| `links.lag` | 滞后，**毫秒** |

## 视图

| 属性 | 说明 |
|---|---|
| `viewMode` | `day` / `week` / `month` / `quarter` / `year` |
| `hourWidth` | 每小时像素（缩放）；不设则跟 viewMode |
| `timelineStart` / `timelineFinish` / `currentTime` | 时间轴与竖线 |
| `gridVisible` / `gridWidth` / `chartWidth` | 左表 |
| `readonly` / `allowTaskDrag` / `allowTaskResize` / `allowLinks` / `allowRowReorder` | 编辑开关 |
| `virtualizing` | 默认 true |
| `dependencyConstraints` | 自动排依赖 |
| `baselineVisible` | 显示基线 |
| `workingWeekStart` / `workingWeekFinish` | 0=日 … 6=六 |
| `specialNonworkingDays` | 节假日 |
| `assignableResources` / `resourceHourCosts` / `resourceQuantities` | 资源与单价 |
| `license` | 也可 `createHyperGanttPlugin({ license })` |

## 控制器

`onReady` 拿到 `UiGanttController`。Hyper 做满打印 / MS Project XML / 资源算法；EJ2 没有的方法走 no-op。

| 方法 | 说明 |
|---|---|
| `print` / `exportHtml` | `UiGanttPrintOptions`：`title` `gridVisible` `columnIndexes` `timelineStart` `timelineFinish` `hourWidth` `rotate` `preparingMessage` |
| `getProjectXml` / `loadProjectXml` | Microsoft Project XML |
| `optimizeWork` / `levelAllocations` / `levelResources` | 排程算法；Hyper 会 `onTaskChange` |
| `criticalTaskIds` / `setupBaseline` | 关键路径、基线 |
| `undo` | Hyper 用快照栈；EJ2 走厂商 undo |

`onTaskChange` 返回 `false` 可回滚（EJ2）。钩子 class：`mmda-gantt`、`mmda-gantt--readonly`。皮肤可再挂 `mmda-sf-gantt` / `mmda-hyper-gantt`。

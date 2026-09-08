# Timeline 设计

chrome 时间轴，走 `factory.timeline`。默认是事件列表。[EJ2 Vue Timeline](https://ej2.syncfusion.com/vue/documentation/timeline/vue3-getting-started)。

应用 `setTimelinePlugin(createTempisTimelinePlugin())` 之后，**同一调用**改走 [Tempis](https://tempis.dev/) canvas 轴（包 `@mmda/vuix-tempis-timeline`）。`setTimelinePlugin(null)` 卸回皮肤。未装插件 **不 throw**。

程序员用法：[timeline_usage.md](./timeline_usage.md)。

vui 名是 **`timeline`**。不要 `ejs-timeline` / `TempisTimeline` / Prime `Timeline` / `NSteps` / `NTimeline`。

不要和 `factory.stepper`（向导）、甘特、`scheduler` 的 `timelineWeek` 混。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/timeline.ts` | `UiTimelineProps`；`*Field`；`timelineItemsOf` / `tempisItemsOf`；`setTimelinePlugin` 覆盖 `factory.timeline` |
| 皮肤 `factory/timeline.ts` | 无插件时：SF `TimelineComponent`；Prime `Timeline`；Naive `NTimeline` |
| `@mmda/vuix-tempis-timeline` | 插件：canvas 起止轴 |
| `fldFactory.timeline` | 字段值若是数组当 `items`；走当前 `factory.timeline`（含插件） |

对侧时间缺省 **`relativeTime`**（core / Intl，「3天前」）。绝对时间：`timeDisplay: 'absolute'`。

`orientation` 是 `UiOrientation`；列表缺省 **vertical**。Tempis 忽略横竖（时间轴）。

## 属性

| 属性 | 皮肤列表 | Tempis |
|---|---|---|
| `items` + `labelField` / `contentField` / `timeField` | 文案与对侧时间 | 无 `end` 时 `time`/`start` 为时间点 |
| `startField` / `endField` | start 可当 time；end 忽略 | 区间条 |
| `groupingField` / `range` | 忽略 | 用 |
| `orientation` / `align` / `reverse` | 用 | 忽略 |

`timelineItemsOf` 只解析一次。皮肤吃列表项；插件再映射 `{ id, label, start, end? }`。

钩子 class：`mmda-timeline`；`--vertical` / `--horizontal`；`--after` 等 align；插件再加 `--tempis`。

## 源码

- vui [`timeline.ts`](../src/ui/factory/timeline.ts)
- Syncfusion [`factory/timeline.ts`](../../vui-syncfusion/src/factory/timeline.ts)
- Prime [`factory/timeline.ts`](../../vui-primevue/src/factory/timeline.ts)
- Naive [`factory/timeline.ts`](../../vui-agnaive/src/factory/timeline.ts)
- Tempis [`vuix-tempis-timeline`](../../vuix-tempis-timeline)

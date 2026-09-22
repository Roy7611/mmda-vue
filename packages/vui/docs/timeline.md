# Timeline 设计（列表式时间轴）

chrome 时间轴，走 `factory.timeline`：**一维事件列表**（正文 + 对侧时间）。[EJ2 Vue Timeline](https://ej2.syncfusion.com/vue/documentation/timeline/vue3-getting-started)。

**二维画布轴**（时间 × 泳道 + 依赖箭头 + 缩放/小地图/导出）是**另一个控件**，不在这里：

| 项 | 列表式（本文件） | 二维画布轴 |
|---|---|---|
| 入口 | `factory.timeline`（chrome 控件） | `builder.buildTempisTimeline(ctx, props)`（插件） |
| 契约 | core `ui/plugins/timeline.ts` — `UiTimelineProps` | core `ui/plugins/tempis_timeline.ts` — `UiTempisTimelineProps extends UiTimelineProps` |
| 实现 | 三套皮肤各自的厂商控件 | `@mmda/vuix-tempis-timeline`（Vue）/ `@mmda/ruix-tempis-timeline`（React） |
| 缺实现时 | 皮肤兜底 | **throw**（装 `createTempisTimelinePlugin()` 才有，不回落本控件） |

画布轴的用法与字段清单见 [vuix-tempis-timeline README](../../vuix-tempis-timeline/README.md)（React 同族包 README 与之对等）。

程序员用法：[timeline_usage.md](./timeline_usage.md)。

vui 名是 **`timeline`**。不要 `ejs-timeline` / `TempisTimeline` / Prime `Timeline` / `NSteps` / `NTimeline`。

不要和 `factory.stepper`（向导）、甘特、`scheduler` 的 `timelineWeek` 混。

## 分层

| 层 | 做什么 |
|---|---|
| core `ui/plugins/timeline.ts` | `UiTimelineProps`（**纯数据入参**：行绑定 + 文案 + 形态）；`timelineItemsOf` 只解析一次 |
| vui `ui/plugins/timeline.ts` | 薄封装：再导出两档契约（列表 + 画布）与 `timelinePropsFromField` |
| 皮肤 `factory/timeline.ts` | SF `TimelineComponent`；Prime `Timeline`；Naive `NTimeline` |
| `fieldFactory.timeline` | 字段值若是数组当 `items`；走 `factory.timeline` |

对侧时间缺省 **`relativeTime`**（core / Intl，「3天前」）。绝对时间：`timeDisplay: 'absolute'`。

`orientation` 是 `UiOrientation`；缺省 **vertical**。

## 属性

| 属性 | 说明 |
|---|---|
| `items` + `labelField` / `contentField` / `timeField` | 文案与对侧时间 |
| `oppositeContentField` / `iconField` / `disabledField` / `cssClassField` | 逐项覆盖 |
| `orientation` / `align` / `reverse` | 列表形态 |
| `timeDisplay` / `timeFormat` / `locale` | 对侧时间文案 |
| `template` | 逐项内容模板（皮肤透传给厂商组件）；**不是** tooltip 模板 |

列表侧**没有**事件、控制器与 `range` —— 三套皮肤都不派发/不支持，这些只属于画布契约。

钩子 class：`mmda-timeline`；`--vertical` / `--horizontal`；`--after` 等 align；画布轴另有 `mmda-timeline--tempis`。

## 源码

- core 列表契约 [`timeline.ts`](../../core/src/ui/plugins/timeline.ts) / 画布契约 [`tempis_timeline.ts`](../../core/src/ui/plugins/tempis_timeline.ts)
- vui 薄封装 [`timeline.ts`](../src/ui/plugins/timeline.ts)
- Syncfusion [`factory/timeline.ts`](../../vui-syncfusion/src/factory/timeline.ts)
- Prime [`factory/timeline.ts`](../../vui-primevue/src/factory/timeline.ts)
- Naive [`factory/timeline.ts`](../../vui-agnaive/src/factory/timeline.ts)
- 画布轴 [`vuix-tempis-timeline`](../../vuix-tempis-timeline) / [`ruix-tempis-timeline`](../../ruix-tempis-timeline)

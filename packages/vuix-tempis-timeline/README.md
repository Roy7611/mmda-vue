# @mmda/vuix-tempis-timeline

[Tempis](https://tempis.dev/) 二维时间轴画布（时间 × 泳道 + 依赖箭头）的 Vue 插件。契约在 core 的
`ui/plugins/tempis_timeline.ts`（`UiTempisTimelineProps`），走 Builder 具名入口 `buildTempisTimeline`：

```ts
import { UiPluginName } from '@mmda/vui'
import { createTempisTimelinePlugin } from '@mmda/vuix-tempis-timeline'

ui.use(createTempisTimelinePlugin())
// builder.buildTempisTimeline(ctx, props)   ← 未装插件时抛 TEMPIS_TIMELINE_PLUGIN_NOT_INSTALLED（不回落列表时间轴）
```

> 列表式时间轴（一维事件流）**不是插件**：它就 `builder.factory.timeline`，用三个皮肤各自的厂商控件。

## 能表达什么

`buildTempisTimeline(ctx, props)` 的 props 是 `UiTempisTimelineProps extends UiTimelineProps`：

- **行**：`keyField` / `labelField` + `startField` / `endField`（`start` 缺失的行被丢掉；没给 `startField` 时回落 `timeField`）、
  `groupingField`（泳道）、`categoryField`、`progressField`（0–1 区间填充）、`styleField`、`selectedField`。
- **轴级数据**：`categories`（配色 + 图例 + 点击筛选）、`bands`（高亮区段 / 截止线）、`dependencies`（`source → target` 箭头，取值为行的 `key`）。
- **视图**：`responsive`（默认 true）、`verticalFill`、`stackMode`、`range`（起止 / position / fixed / min / max / minorUnit / majorUnit / zoom）、
  `legend`、`tooltip`、`scrollbar`、`minimap`、`grouping`（`collapsible` / `sort`）、`accessibility`、
  `font` / `itemStyle` / `gridColor`（Tempis 的 `style` 三项，避开 `UiProps.style` 撞名）。
- **选择**：`selectionMode` + `selectedIds`（**给值 = 受控**，靠 `onSelectionChange` + `setSelection` 回写）。
- **事件**：`onItemClick` / `onItemDoubleClick` / `onItemContextClick` / `onItemHover` / `onSelectionChange` / `onRangeChange` / `onGroupToggle` / `onReady`。
- **命令式**：`onReady(controller)` 拿到 15 个方法（`focus` / `getRange` / `toImage` / `getItems` / `setItems` / `setCategories` / `setBands` /
  `setDependencies` / `setSelection` / `getSelection` / `clearSelection` / `setGroupCollapsed` / `isGroupCollapsed` / `redraw`）。

**tooltip 模板**：`tooltip.template: (id) => unknown` —— 可以给 HTML 字符串（引擎按 `innerHTML` 塞入），也可以给 Vue 节点；
宿主每次显示时用 `createApp` 挂一个临时应用把它变成元素（`createRoot` 同理，React 侧在 `@mmda/ruix-tempis-timeline`）。

## 宿主行为（实现要点）

- 组件只声明**一个 prop `source`**：props 逐一声明会长出第二份契约，未声明的键还会被 attrs fallthrough 落进 DOM。
- 数据（`items` / `categories` / `bands` / `dependencies` / `selectedIds`）变了走 `setItems` 等 setter，**不重建**；
  构造期选项（`range` / `legend` / `tooltip` 标量 / `style` / `scrollbar` / `minimap` / `accessibility` / `stackMode` / `responsive` …）变了
  `destroy()` + 重建 —— Tempis 只在构造时读它们（判定函数 `tempisStructureOf`）。
- 回调与 `tooltip` 模板每次触发都读**最新** props（引擎活过多次渲染，闭包不能钉死旧引用）。
- 卸载 `destroy()` 并卸掉 tooltip 用的临时应用。

## optional peer 与 dev 注意

`@tempis/timeline` 是 optional peer，动态 `import()`（**不要加 `@vite-ignore`**：加了之后裸 specifier 原样留在产物里，
浏览器解析不了，装没装都落到「缺引擎」分支 —— 真浏览器实测）。未安装时宿主渲染 `Timeline requires @tempis/timeline` 并给出 noop 控制器。

测试用 jsdom 挂载需要 canvas 兜底（本机实测：jsdom 的 `getContext('2d')` 返回 null，引擎构造期就抛）：
`src/__tests__/canvas_stub.ts` 装了 2D ctx 桩、`ResizeObserver`、`Path2D` 与固定尺寸；像素 / 命中 / 平移缩放必须在真浏览器验。

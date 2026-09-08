# @mmda/vui-syncfusion

`@mmda/vui` 的 Syncfusion EJ2 Vue 3 控件皮肤。页面结构、查询和 CRUD 仍由 vui 管理。

本包按 **components → factory → builder** 落地：`components/SfGrid.ts` 等是控件；`factory/` 用 `MetaUi` 生产（`factory.table` → `h(SfGrid)`）；`builder/` 只补壳。vui 的 `VueUiBuilder` 拼列表/表单，不 import EJ2。约定见 [vui Builder](../vui/docs/builder.md)。

## 安装

```ts
import { createApp } from 'vue'
import { MmdaVueApp, setupI18n } from '@mmda/vui'
import { SyncfusionUiBuilder, mmdaSyncfusion } from '@mmda/vui-syncfusion'

const app = createApp(Root)
const ui = new SyncfusionUiBuilder()
const i18n = setupI18n({}, 'zh')

app
  .use(i18n)
  .use(mmdaSyncfusion, {
    licenseKey: import.meta.env.VITE_SYNCFUSION_LICENSE,
    locale: 'zh', // zh | en | zh-Hant；也可传入 EJ2 L10n 对象
  })
  .use(new MmdaVueApp('/api', 'demo', ui, i18n))
  .mount('#app')
```

`locale` 会 `L10n.load` + `setCulture`，并跟随 `app.changeLocale()`（需先 `app.use(i18n)`）。`zh` 用简体覆盖表格空数据/分页等常用文案；`zh-Hant` 用 EJ2 自带的繁体包。

`MmdaApplication.install` 会自动把 Overlay Host 挂到 `document.body`，不必再写 `<SfOverlayHost/>`。

无 license 时控件仍可运行，但会带 Syncfusion 试用水印。也可读环境变量 `VITE_SYNCFUSION_LICENSE`。

默认主题为 Material 3（`src/style.css` 里成套 `@import .../material3.css`）。换成 `fluent2`、`bootstrap5.3`、`tailwind3` 等现代主题时，把同一文件里各包的文件名改成同一套即可；这些主题**单文件含明暗**，`setColorScheme(true)` 会给 `html`/`body` 加 `e-dark-mode`。旧主题（`material-dark` 等）需另载深色 CSS，不能只靠类名切换。

系统级模块菜单按官方 Sidebar 用法接入：

- [Dock](https://ej2.syncfusion.com/documentation/sidebar/docking-sidebar)：`enableDock` + `dockSize: 72px` + `width: 320px`，`toggle()` 伸缩；收起用 `.e-dock.e-close .e-text` 隐藏文案
- [Target](https://ej2.syncfusion.com/documentation/sidebar/custom-context)：`target: '.mmda-sf-shell'`
- [Types](https://ej2.syncfusion.com/documentation/sidebar/variations)：`type: 'Push'`，Sidebar 与 `.mmda-sf-maincontent` 为兄弟节点（不再塞进 CSS Grid nav 列）

壳层由 `SyncfusionUiBuilder.buildAppScaffold` 渲染为 `.mmda-sf-shell > Sidebar + .mmda-sf-maincontent`。

动作图标用 Syncfusion `e-icons`；业务图标（`Module.moduleIcon`、`far fa-*`）走 `@mmda/vui/fontawesome.css`（插件已引入）。

## 图表插件

默认不挂，不进 `createSyncfusionUiFactory`。应用按需：

```ts
import { createSfChartFactory } from '@mmda/vui-syncfusion/charts'

ui.setChartFactory(createSfChartFactory())
```

需要 optional peer `@syncfusion/ej2-vue-charts`、`@syncfusion/ej2-vue-circulargauge`、`@syncfusion/ej2-vue-lineargauge`、`@syncfusion/ej2-vue-heatmap`、`@syncfusion/ej2-vue-maps`。漏斗 / 金字塔 / 瀑布 / 箱线 / 直方图 / 气泡 / 子弹图 / combo 走 EJ2；`sunburst` 为 `not supported`。也可用 `@mmda/vuix-echarts`。见 [vui 图表](../vui/docs/chart.md)。

## 图插件

默认不挂。EJ2 Diagram 在本包：

```ts
import { createSfDiagramEditorPlugin } from '@mmda/vui-syncfusion/diagram-editor'

ui.setDiagramPlugin(createSfDiagramEditorPlugin())
```

兼容：`@mmda/vui-syncfusion/diagrams` 的 `createSfDiagramPlugin` 是同一函数。

Prime / Naive 共用 `@mmda/vuix-vf-diagram`（Vue Flow）。`buildBpmnDiagram` 仍走 bpmn-js XML，不要和 `diagramPlugin` 混用。见 [vui 图插件](../vui/docs/diagram.md)。

## 图片编辑器

默认不挂。需要 optional peer `@syncfusion/ej2-vue-image-editor`：

```ts
import { createSfImageEditorPlugin } from '@mmda/vui-syncfusion/image-editor'

ui.setImageEditorPlugin(createSfImageEditorPlugin())
```

## Markdown

三家皮肤共用 `@mmda/vuix-vditor-markdown`（Vditor），见 [vui Markdown](../vui/docs/markdown_editor.md)。

## 甘特插件

默认不挂。EJ2 Gantt 在本包：

```ts
import { createSfGanttPlugin } from '@mmda/vui-syncfusion/gantt'

ui.setGanttPlugin(createSfGanttPlugin())
```

需要 optional peer `@syncfusion/ej2-vue-gantt`。Prime / Naive 本轮不实现。见 [vui 甘特插件](../vui/docs/gantt.md)。

另有独立包 [`@mmda/vuix-hyper-gantt`](../vuix-hyper-gantt)（DlhSoft Hyper Library），`setGanttPlugin(createHyperGanttPlugin())`，不换本皮肤默认实现。

## Ribbon 插件

默认不挂。EJ2 Ribbon 在本包（不是 `factory.toolbar`）：

```ts
import { createSfRibbonPlugin } from '@mmda/vui-syncfusion/ribbon'

ui.setRibbonPlugin(createSfRibbonPlugin())
```

需要 optional peer `@syncfusion/ej2-vue-ribbon`。Prime / Naive 无对等控件。见 [vui Ribbon 插件](../vui/docs/ribbon.md)。

## 看板插件

默认不挂。EJ2 Kanban 在本包：

```ts
import { createSfKanbanPlugin } from '@mmda/vui-syncfusion/kanban'

ui.setKanbanPlugin(createSfKanbanPlugin())
```

需要 optional peer `@syncfusion/ej2-vue-kanban`。见 [vui 看板插件](../vui/docs/kanban.md)。

另有独立包 [`@mmda/vuix-svar-kanban`](../vuix-svar-kanban)（SVAR），`setKanbanPlugin(createVueKanbanPlugin())`，不换本皮肤默认实现。

## AI 助手

默认不挂。需要 optional peer `@syncfusion/ej2-vue-interactive-chat`：

```ts
import { createSfAiAssistantPlugin } from '@mmda/vui-syncfusion/ai-assistant'

ui.setAiAssistantPlugin(createSfAiAssistantPlugin())
```

见 [vui AI 助手](../vui/docs/ai_assistant.md)。

## 文档

- [表格契约](./docs/sf-grid.md)：厂商无关的 Grid 接口（scene、props、事件、方法）。本包以 `SfGrid` 实现；AgGrid 包装应对齐同一份。
- [SfGrid 设计](./docs/sf-grid-design.md)：本皮肤如何落到 EJ2。尚未从 `factory.table` 抽出实现。

## 边界

- 不拼装 `EntitySearchParam`；Grid 过滤只回写 `filterModel`
- 表格 `selectedItems` 绑定会话数组，不要每次 `ref([])`
- Office 预览走 vui 的 `buildFilePreview`（vue-office），不用 EJ2 Spreadsheet / DocumentEditor / PdfViewer
- BPMN 使用 EJ2 Diagram + `BpmnDiagrams` 的 nodes/connectors JSON，不是 bpmn-js XML

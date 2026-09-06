# @mmda/vui

Vue 3 运行时。把 `@mmda/core` 的元数据、实体和 `UiContext` 接到 Vue：一屏会话、CRUD、拼屏和皮肤契约。

当前版本 `1.2.0`。从 `@mmda/vui` 一次导入即可。

```ts
import {
  MmdaVueApp,
  UiLogic,
  VueUiContext,
  setupI18n,
} from '@mmda/vui'
import type { MmdaApplication } from '@mmda/core'
```

**不包含** PrimeVue / Syncfusion / Naive 控件。vui 只提供拼屏契约与 Builder 组合；皮肤由 `@mmda/vui-primevue`、`@mmda/vui-syncfusion`、`@mmda/vui-agnaive` 实现。

UI 构造：**皮肤 `components/` 写控件**（`SfGrid`、`AgGrid`）→ **皮肤 `factory/` 用 `MetaUi` 生产** → **vui Builder 拼复杂视图**。vui 不 import 厂商表格。目录与约定见 [Builder 与皮肤](./docs/builder.md)。

## 分层

```text
i18n / keys          语言包、provide/inject token
        ↓
MmdaVueApp           应用壳：DI、鉴权、locale；弹层在 app.ui（VueUiBuilder）
        ↓
UiLogic              实体在 UI 层的交互逻辑：beforeEdit / load / save，装配字段与组
        ↓
VueUiContext         一实体一份 Vue 会话（实现 core 的 UiContext；含查询与 IO）
        ↓
VueUiBuilder / Factory / Overlay  拼屏实现 + 弹层；PrimeVue / Syncfusion / Naive
```

约定：

- 先有 core 的 `MetaUi`，再用 `UiLogic` 装配字段逻辑，最后用 `VueUiContext` 跑一屏。
- `VueUiContext` 实现 `@mmda/core` 的 `UiContext`；搜索缓存仍是 `FieldSearchOptions`，不要写回 `MetaUiField`。
- vui 可以依赖 Vue / vue-i18n / vue-router；不要依赖 PrimeVue。
- `select(field)` 写回字段；`select({ repository })` 选仓库。弹层走 `app.ui.dialog`（皮肤 overlayHost）。
- `Attachment` / `ReportTemplate` 从 `@mmda/core` 导入；上传下载走 `VueUiContext`，不要往 `ApiClient` 加专用方法。
- 用法对照 core：[UiBuilder](../core/docs/ui/ui_builder_usage.md)、[UiContext](../core/docs/logic/ui_context_usage.md)。

和计划中的 `@mmda/rui`：rui **不要** 从 vui 抄组件。会话语义跟 core，控件层各自实现。

## 源码目录（`src/`）

对外只从 `@mmda/vui` 导入（`src/index.ts`）。皮肤与业务包不要写包内深路径。`context.uiBuilder` 的类型是 core `UiBuilder`（值为 `app.ui`）。

```text
src/
  app/              应用壳：MmdaVueApp、inject keys、主题 / 图标 / Material token、壳 state
  logic/            UiLogic：对标 core EntityLogic，无 Vue 控件
  contexts/         一屏会话：VueUiContext（Handbook mixin：data / validate / subgroup / navigate / reference）、view
  components/       皮肤无关 Vue 组件（EntityView、ListSettingView、GroupCard、侧栏、预览…）
  ui/
    layout/         栅格与槽：UiLayout、AppLayout、PropData、UiSlots
    factory/        控件契约（一控件一文件）：UiFactory、UiFieldFactory、list/tree/dialog…
    builder/        VueUiBuilder 拼屏：form/list/tree mixin、overlay、list_query / tree_data 等辅助函数
  i18n/             语言包与 setupI18n
  assets/
    css/            theme.css、fontawesome.css、material-symbols.css（对外仍 @mmda/vui/theme.css）
    fa/             Font Awesome 厂商整包，不要再搬进 css/
  utils/            槽解析等小工具
  rx.ts             响应式辅助
  __tests__/        包内单测
  index.ts          公开符号 re-export
```

| 目录 | 职责 | 不要放什么 |
|---|---|---|
| `app/` | Vue 应用壳、provide/inject、色板 | 业务计算、厂商表格 |
| `logic/` | 显示 / 锁定 / 校验 / 动作装配 | Vue 组件、HTTP 拼装 |
| `contexts/` | 一实体一份会话；Logic 钩子认 core `UiContext` | 皮肤控件 |
| `components/` | 无厂商依赖的页面壳与预览 | `SfGrid` / `AgGrid` 一类皮肤实现 |
| `ui/layout/` | 行列栅格形状 | 业务 Logic |
| `ui/factory/` | props / emits / slots；字段也是一类生产控件 | 远程查询函数、列宽落盘 |
| `ui/builder/` | 模板方法拼复杂视图；`list_query` / `list_layout` / `tree_data` / `tree_category` 是辅助函数不是第二套控件 | 皮肤 `components/` |
| `assets/` | 入口样式与 FA 静态资源 | 业务文案（走 `i18n/`） |

厂商表格和皮肤 factory 在 `@mmda/vui-syncfusion` / `primevue` / `agnaive`。细则见 [Builder 与皮肤](./docs/builder.md)。

## 最小用法

```ts
import { createApp } from 'vue'
import { MmdaVueApp, setupI18n, VueUiContext } from '@mmda/vui'
import { UiViewMany } from '@mmda/vui'
import { PrimeVueUiBuilder } from '@mmda/vui-primevue'

const i18n = setupI18n({}, 'zh')
const builder = new PrimeVueUiBuilder()
const app = new MmdaVueApp('/api', 'base', builder, i18n, {
  clientId: 'mmda-base',
  clientSecret: '',
})

const vueApp = createApp({
  setup() {
    return () => builder.buildListView(context)
  },
})
vueApp.use(i18n)
vueApp.use(app)
```

业务页通常用 DI 取出 Logic，再 `new VueUiContext` 后 `init()`：

```ts
const logic = app.di.get('MaterialsLogic')
const pack = await app.meta.getPack({ repository: 'Materials' })
const context = new VueUiContext({
  model: { list: [] },
  metaui: pack.metaui,
  view: UiViewMany.Index,
  app,
  logic,
})
await context.init()
```

无定制字段逻辑时用 `GenericUiLogic`。换皮肤只换 Builder（如 `PrimeVueUiBuilder` / `SyncfusionUiBuilder`），vui 其余代码不变。

## 文档

| 文档 | 内容 |
|---|---|
| [应用壳](./docs/application.md) | `MmdaVueApp`、`app.state`、鉴权、i18n |
| [实体交互逻辑](./docs/logic.md) | `UiLogic` / `GenericUiLogic` / `UiGroupLogic` |
| [会话上下文](./docs/context.md) | 程序员怎么写 `VueUiContext` / core `UiContext` |
| [会话设计](./docs/vue_ui_context.md) | 为何一个类、Handbook mixin、文件按能力拆 |
| [Builder 与皮肤](./docs/builder.md) | 组件 → Factory → Builder；目录 `ui/builder/` |
| [列表与过滤](./docs/list.md) | 工具栏、搜索、`UiFilter`、`select()` |
| [表格契约](../vui-syncfusion/docs/sf-grid.md) | 厂商无关的 Grid 接口（各皮肤共用） |
| [SfGrid 设计](../vui-syncfusion/docs/sf-grid-design.md) | Syncfusion 皮肤如何实现该契约 |

旧的 [vui.md](./docs/vui.md) 仅作索引，新内容以本 README 和上表为准。

## 开发

仓库根目录，需要 Node `>=20.19`、pnpm `>=9`。

```bash
pnpm install
pnpm --filter @mmda/vui test
pnpm --filter @mmda/vui typecheck
pnpm --filter @mmda/vui build
pnpm dev:vui    # playground（vui-agnaive，假数据）
pnpm dev:app    # 统一 SPA（BASE + MES）
```

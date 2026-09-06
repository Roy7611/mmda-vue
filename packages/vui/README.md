# @mmda/vui

Vue 3 运行时。把 `@mmda/core` 的元数据、实体和 `UiContext` 接到 Vue：一屏会话、CRUD、拼屏和皮肤契约。

当前版本 `1.2.0`。从 `@mmda/vui` 一次导入即可。

```ts
import {
  MmdaVueApp,
  UiLogic,
  UiBuildContext,
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
UiViewContext        一实体一份 Vue 会话（实现 core 的 UiContext）
        ↓
UiBuildContext       屏级 CRUD、列表刷新、附件与导入导出
        ↓
VueUiBuilder / Factory / Overlay  拼屏实现 + 弹层；PrimeVue / Syncfusion / Naive
```

约定：

- 先有 core 的 `MetaUi`，再用 `UiLogic` 装配字段逻辑，最后用 `UiBuildContext` 跑一屏。
- `UiViewContext` 实现 `@mmda/core` 的 `UiContext`；搜索缓存仍是 `FieldSearchOptions`，不要写回 `MetaUiField`。
- vui 可以依赖 Vue / vue-i18n / vue-router；不要依赖 PrimeVue。
- `select(field)` 写回字段；`select({ repository })` 选仓库。弹层走 `app.ui.dialog`（皮肤 overlayHost）。
- `Attachment` / `ReportTemplate` 从 `@mmda/core` 导入；上传下载走 `UiBuildContext`，不要往 `ApiClient` 加专用方法。
- 用法对照 core：[UiBuilder](../core/docs/ui/ui_builder_usage.md)、[UiContext](../core/docs/logic/ui_context_usage.md)。

和计划中的 `@mmda/rui`：rui **不要** 从 vui 抄组件。会话语义跟 core，控件层各自实现。

## 最小用法

```ts
import { createApp } from 'vue'
import { MmdaVueApp, setupI18n, UiBuildContext } from '@mmda/vui'
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

业务页通常用 DI 取出 Logic，再 `new UiBuildContext` 后 `init()`：

```ts
const logic = app.di.get('MaterialsLogic')
const pack = await app.meta.getPack({ repository: 'Materials' })
const context = new UiBuildContext({
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
| [会话上下文](./docs/context.md) | `UiViewContext`、`UiBuildContext`、`contexts/` |
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

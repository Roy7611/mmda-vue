# @mmda/vui

Vue 3 运行时。把 `@mmda/core` 的元数据、实体和 `UiContext` 接到 Vue：一屏会话、CRUD、拼屏和皮肤契约。

当前版本 `1.2.0`。从 `@mmda/vui` 一次导入即可。

```ts
import {
  MmdaApplication,
  UiLogic,
  UiBuildContext,
  HtmlUiBuilder,
  setupI18n,
} from '@mmda/vui'
```

**不包含** PrimeVue / Syncfusion 控件。包内 `HtmlUiBuilder` 是零控件库依赖的 HTML 皮肤；PrimeVue 4.5 由 `@mmda/vui-primevue` 实现，EJ2 由 `@mmda/vui-syncfusion` 实现。

## 分层

```text
i18n / keys          语言包、provide/inject token
        ↓
MmdaApplication      应用壳：DI、鉴权、locale、弹层转发 Builder
        ↓
UiLogic              仓库逻辑：beforeEdit / load / save，装配字段与组
        ↓
UiViewContext        一实体一份 Vue 会话（实现 core 的 UiContext）
        ↓
UiBuildContext       屏级 CRUD、列表刷新、附件与导入导出
        ↓
UiBuilder / Factory / Overlay  拼屏契约 + 弹层；Html / PrimeVue / Syncfusion
```

约定：

- 先有 core 的 `MetaUi`，再用 `UiLogic` 装配字段逻辑，最后用 `UiBuildContext` 跑一屏。
- `UiViewContext` 实现 `@mmda/core` 的 `UiContext`；搜索缓存仍是 `FieldSearchOptions`，不要写回 `MetaUiField`。
- vui 可以依赖 Vue / vue-i18n / vue-router；不要依赖 PrimeVue。
- `select()` / `subGroupItem()` 属于表单会话；真正打开弹层走 `app.confirmDialog`，由皮肤实现。
- `Attachment` / `ReportTemplate` 从 `@mmda/core` 导入；上传下载走 `UiBuildContext`，不要往 `ApiClient` 加专用方法。

和计划中的 `@mmda/rui`：rui **不要** 从 vui 抄组件。会话语义跟 core，控件层各自实现。

## 最小用法

```ts
import { createApp } from 'vue'
import { MmdaApplication, HtmlUiBuilder, setupI18n, UiBuildContext } from '@mmda/vui'
import { UiViewMany } from '@mmda/vui'

const i18n = setupI18n({}, 'zh')
const builder = new HtmlUiBuilder()
const app = new MmdaApplication('/api', 'base', builder, i18n, {
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

无定制字段逻辑时用 `GenericUiLogic`。皮肤换成 PrimeVue 时，把 `HtmlUiBuilder` 换成 `PrimeVueUiBuilder`，vui 其余代码不变。

## 文档

| 文档 | 内容 |
|---|---|
| [应用壳](./docs/application.md) | `MmdaApplication`、鉴权、i18n、inject keys |
| [仓库逻辑](./docs/logic.md) | `UiLogic` / `GenericUiLogic` / `UiGroupLogic` |
| [会话上下文](./docs/context.md) | `UiViewContext`、`UiBuildContext`、主从树 |
| [Builder 与皮肤](./docs/builder.md) | `UiBuilder`、`UiFactory`、`HtmlUiBuilder` |
| [列表与过滤](./docs/list.md) | 工具栏、搜索、`UiFilter`、`UiSelector` |

旧的 [vui.md](./docs/vui.md) 仅作索引，新内容以本 README 和上表为准。

## 开发

仓库根目录，需要 Node `>=20.19`、pnpm `>=9`。

```bash
pnpm install
pnpm --filter @mmda/vui test
pnpm --filter @mmda/vui typecheck
pnpm --filter @mmda/vui build
pnpm dev:vui    # playground，假数据
pnpm dev:base   # 基础数据应用，需配置 packages/base/.env
```

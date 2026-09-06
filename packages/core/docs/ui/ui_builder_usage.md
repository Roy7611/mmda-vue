# UiBuilder：程序员怎么写

契约在 [`src/ui/builder.ts`](../../src/ui/builder.ts)。vui 里一定是 **`VueUiBuilder`**（抽象类，模板方法）；皮肤再 `extends`。业务 Logic **不要 import 皮肤、不要 `h()`**。

```text
UiBuilder              core 契约
    ↑ implements
VueUiBuilder           vui 抽象类
    ↑ extends
SyncfusionUiBuilder / PrimeVueUiBuilder / …
```

架构见 [ARCHITECTURE.md](../../../../ARCHITECTURE.md)。会话实现 [VueUiContext 设计](../../../vui/docs/vue_ui_context.md) / [怎么写](../../../vui/docs/context.md)。本轮改名见 [refactor_ui_app.md](../refactor_ui_app.md)。

## 从哪拿

```ts
const ui = context.uiBuilder
const factory = ui.factory
const fld = ui.fldFactory
```

`context.app.ui` 与 `context.uiBuilder` 是同一实例。不要调已删除的 `app.confirm` / `app.dialog`。

## toast / confirm / dialog

```ts
await ui.toast(context, { severity: 'success', summary: '已保存' })

const ok = await ui.confirm(context, {
  header: '删除',
  message: '确定删除？',
})
if (!ok) return

const picked = await ui.dialog(content, context, { header: '选择物料' })
```

| 方法 | 干什么 |
|---|---|
| `toast` | 提示，不必等用户 |
| `confirm` | 是/否（原 `confirmMessage`） |
| `dialog` | 弹层塞节点（原 `confirmDialog`） |
| `buildView` | 按 `context.view` 拼整页或选择器 |

`dialog` 的 `content` 类型是 `TNode | TNode[]`。Logic 里用 `factory.*` 产出节点，不要自己造 VNode。

## 表格（本地行）

已有实体列表、只要勾选，不要走仓库选择器：

```ts
import { MetaUiBuilder } from '@mmda/core'

const metaui = MetaUiBuilder.create('PickRow')
  .rowNumber()
  .field('code', '编码')
  .field('name', '名称')
  .listed()
  .build()

const table = ui.factory.table(rows, metaui, {
  selectionMode: 'single',
})
const result = await ui.dialog(table, context, { header: '选择' })
```

仓库实体用 [`context.select`](../logic/ui_context_usage.md)，不要再抄一份列表查询。

## 表单 / 选择器页

选择器就是 `selectOne` / `selectMany`，走 `buildView`。不要另写 `buildSelector`。

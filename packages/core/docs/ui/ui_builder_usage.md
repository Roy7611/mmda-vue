# UiBuilder：程序员怎么写

契约在 [`@mmda/core` `src/ui/`](../../src/ui/builder.ts)：**方法 + `Ui*Props` 都在 core**。vui 里是 **`VueUiBuilder`**（抽象类）；皮肤再 `extends`。业务 Logic **不要 import 皮肤、不要 `h()`**。

```text
UiBuilder / UiFactory / Ui*Props     core 契约
    ↑ implements / type alias
VueUiBuilder / VueUiFactory          vui（按实现选型）
    ↑ extends
SyncfusionUiBuilder / PrimeUiBuilder / …
```

设计真源：[ui.md](../ui.md)。架构见 [ARCHITECTURE.md](../../../../ARCHITECTURE.md)。

## 从哪拿

```ts
import type {
  UiButtonProps,
  UiListProps,
  UiTableProps,
  UiGridProps,
} from '@mmda/core'

const ui = context.uiBuilder
const factory = ui.factory
const fld = ui.fldFactory
```

`context.app.ui` 与 `context.uiBuilder` 是同一实例。不要调已删除的 `app.confirm` / `app.dialog`。

## 列表 / 表 / 可编表

契约分家（不要一份 Props + `display`）：

| 方法 | Props | 用途 |
|---|---|---|
| `buildList` / `factory.list` | `UiListProps` | 移动端卡片 / 行条 |
| `buildTable` / `factory.table` | `UiTableProps` | 只读桌面 **index**；**selector 默认同 index**（无 `scene`） |
| `buildGrid` / `factory.grid` | `UiGridProps` | edit / details；特殊 selector（带 `scene`） |
| `buildTreeGrid` | `UiTreeGridProps` | 树形可编表 |
| `buildTree` / `factory.tree` | `UiTreeProps` | chrome 导航树（不是下拉、不是树表） |
| `buildTreeView` | `UiTreeViewProps` | 分类树组合（搜索 + tree + 底栏） |
| `buildTreeListView` | `UiTreeListViewProps` | 左树右表 |
| `fldFactory.treeSelect` | 字段 props | 树下拉 |

整页（工具栏、搜索、分页）走 `buildListView`；本地勾选行仍用 `factory.table` + `dialog`（见下）。选仓库实体用 `context.select`，数据区默认也是 `table`（跟 index 一样）；特殊情况才 `grid` + `scene: 'selector'`。详情见 [list、table、grid](../../../../docs/naming.md#listtablegrid)、[vui list.md](../../../vui/docs/list.md)。

## toast / confirm / dialog

程序员只走 **`context.uiBuilder`**。弹层由 Overlay 画厂商窗，**没有 `factory.dialog`**。参数类型是 core 的 `UiToastProps` / `UiConfirmProps` / `UiDialogProps`。

```ts
ui.toast(context, {
  severity: 'success', // success | info | warning | error
  title: '已保存',
  message: '订单已更新',
  life: 3000, // 可省，缺省 3000
})

const ok = await ui.confirm(context, {
  title: '删除',
  message: '确定删除？',
})
if (!ok) return
// 业务写在这里，不要塞进 accept 回调

const result = await ui.dialog(content, context, {
  title: '选择物料',
  width: 'min(90vw, 60rem)',
  onAccept: async () => {
    // 返回 false 不关窗
    return true
  },
})
if (result !== 'ok') return
```

| 方法 | 干什么 | 具名参数 |
|---|---|---|
| `toast` | 提示，不必等 | `severity` / `title` / `message` / `life` |
| `confirm` | 是/否 → `boolean` | `title` / `message` |
| `dialog` | 弹层塞节点 → `UiDialogButton` | `title` / `header` / `footer` / `width` / `showFooter` / `buttons` / `onAccept` / `onReject` |
| `buildView` | 按 `context.view` 拼整页或选择器 | |

不要写：`summary`、`detail`、`type`、`group`、`icon`（pi-*）、`acceptProps`、`$toast.add`、`factory.dialog`。`header` / `footer` 是插槽函数，不要塞厂商 Dialog 的 `header` 字符串。

`dialog` 的 `content` 类型是 `TNode | TNode[]`。Logic 里用 `factory.*` 产出节点，不要自己造 VNode。选相对实体继续 `context.select` / 字段控件，真正要窗就走 `ui.dialog`。

## 表格（本地行）

已有实体列表、只要勾选，不要走仓库选择器：

```ts
import { MetaUiBuilder } from '@mmda/core'

const metaUi = MetaUiBuilder.create('PickRow')
  .rowNumber()
  .field('code', '编码')
  .field('name', '名称')
  .listed()
  .build()

const table = ui.factory.table(rows, metaUi, {
  selectionMode: 'single',
  fieldCellRenderers: {
    code: (_field, row) => ui.factory.textSpan(row.code),
  },
} satisfies UiTableProps)
const result = await ui.dialog(table, context, { title: '选择' })
```

仓库实体用 [`context.select`](../logic/ui_context_usage.md)，不要再抄一份列表查询。

## 树

`buildTreeView` / `buildTreeGridView` / `buildTreeListView` 都是 context 在前，与 `buildListView(context, props)` 同序。

- `factory.tree`：导航树 chrome
- `buildTreeView`：分类树组合
- `buildTreeListView`：左树右表
- `factory.treeGrid`：树形表
- `fldFactory.treeSelect`：树下拉

不要把 `treeGrid` 写成 `view`。契约在 core [`tree.ts`](../../src/ui/tree.ts)。

## 表单 / 选择器页

选择器就是 `selectOne` / `selectMany`，走 `buildView`。不要另写 `buildSelector`。

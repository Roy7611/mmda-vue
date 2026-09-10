# UI 四职：程序员怎么写

设计真源：[ui_four_roles_design.md](./ui_four_roles_design.md)。契约在 `@mmda/core` 的 `src/ui/`。vui 实现是 **`VueUiBuilder`**；皮肤再 `extends`。业务 Logic **不要 import 皮肤、不要 `h()`**。

```text
UiLayout / UiAppLayout / UiFieldFactory / UiFactory / UiBuilder   ← core 契约
    ↑
VueUiLayout / AppLayout / VueUiBuilder / …                       ← vui
    ↑
Syncfusion* / Prime* / AgNaive*                                  ← 皮肤
```

## 从哪拿

```ts
import type { UiListViewProps, UiViewProps } from '@mmda/core'

const ui = context.uiBuilder
const factory = ui.factory
const fld = ui.fldFactory
// 页内排法：优先 factory.layout（与 Builder 同源），或注入的 layout 实例
const layout = factory.layout!
```

`context.app.ui` 与 `context.uiBuilder` 是同一实例。弹层不要走已删除的 `app.confirm`。

## 四职速查

| 你想… | 调 |
|---|---|
| 标签+输入的字段行 | `fld.render(field, context)` |
| 强制编辑行 / 强制只读行 | `fld.editFor` / `fld.displayFor` |
| 表格单元格裸控件 | `fld.textInput` / `fld.checkedIcon` / …（**不要** `render`） |
| 一张表 / 一页分页 | `factory.table` / `factory.paginator` |
| 登录表单 | `factory.signinForm(props, slots?)` |
| 应用壳 | `new AppLayout('sidebarLeft').scaffold({ nav, page })` |
| 模块列表整页 | `ui.buildIndexView(context, props?)` |
| 详情/编辑整页 | `ui.buildDetailsView` / `buildEditView` → `buildEntityView` |
| 左树右表 | `ui.buildExplorerView(context, props?)` |
| 主表字段组 / 子表 | `ui.buildFieldGroup` / `ui.buildSubGroup` |
| Toast / 确认 / 弹层 | `ui.toast` / `ui.confirm` / `ui.dialog` |

## Overlay

```ts
ui.toast(context, { severity: 'success', title: '已保存', message: '订单已更新' })

// 详情/编辑顶栏消息条（有 PageBody 时）；列表可回落 toast
ui.message(context, { severity: 'warn', text: '有未保存更改' })

const ok = await ui.confirm(context, { title: '删除', message: '确定删除？' })
if (!ok) return

const button = await ui.dialog(contentNode, context, {
  title: '选择物料',
  width: 'min(90vw, 60rem)',
})
if (button !== 'ok') return
```

- `confirm` → `Promise<boolean>`；业务写在 `if` 里，不要 `accept` 回调
- `dialog` 的 `content` 是**已构造节点**（用 `factory.*` 产出），不是路由名
- X / Esc → `cancel`；左侧 `customActions`（如 Apply）不关窗、不结束 Promise

## 应用壳

```ts
import { AppLayout } from '@mmda/vui'

new AppLayout('sidebarLeft').scaffold({
  variant: 'sidebarLeft',
  nav: ui.buildAppSideMenu!({
    modules: app.modules,
    header: () => logoNode,
    footer: () => userFooterNode,
  }),
  page: routerViewNode,
})
```

- **不要** `ui.buildAppScaffold`
- `buildAppSideMenu` 内部应走 `factory.sidebar` / `factory.drawer`
- 变体：`sidebarLeft` | `topBarFull`

## 模块页

```ts
// 索引
ui.buildIndexView?.(context, {
  showToolbar: true,
  showSearchbar: true,
  display: 'table', // 可省：只读 table / 可编 grid / 树 treeGrid / 移动 list
} satisfies UiListViewProps)

// 选择器（与 Index 同形；勾选由 context.view 决定）
ui.buildSelectView?.(context, { selectionMode: 'multiple' })

// 详情 / 编辑（create 与 edit 同一入口，靠 context.view）
ui.buildDetailsView?.(context, { primaryCols: 2 } satisfies UiViewProps)
ui.buildEditView?.(context, { showAttachments: true })

// 共享实现（自定义屏也可直接调）
ui.buildEntityView(context, props)
```

Index **内部**已经是：

```text
buildModuleToolbar + factory.table|grid|list|treeGrid + factory.paginator
```

程序员自定义列表屏时同样直调 `factory.*`，不要再找 `buildListView`。

### 本地勾选表 + 弹层

```ts
const table = factory.table!(rows, metaUi, {
  selectionMode: 'single',
})
const result = await ui.dialog(table, context, { title: '选择' })
```

仓库实体继续 `context.select`，不要再抄一份列表查询。

## 字段行

```ts
// 默认：按会话自动选编辑/显示，并带标签布局
fld.render(field, context)

// 详情页里某一块仍要可输
fld.editFor(field, context)

// 编辑页里某一块强制只读
fld.displayFor(field, context)

// 单元格：裸控件
fld.textInput?.(field, context, cellProps)
fld.checkedIcon?.(field, context, cellProps)
```

| 场景 | 用 |
|---|---|
| `buildFieldGroup` / 自定义表单默认 | `render` |
| 明明是详情也要输入 | `editFor` |
| 编辑页局部只读 | `displayFor` |
| 表格 / 树表单元格 | 具名 renderer，**禁止** `render` |

元数据没配 editor / renderer 时：输入回落 `fallbackInput`，展示回落 `fallbackDisplay`（bool 展示默认 `checkedIcon`）。

## 字段组 / 子表

```ts
// 主表组（group.many === false）
ui.buildFieldGroup?.(group, context)

// 子表（group.many === true）→ 内部 factory.grid | treeGrid
ui.buildSubGroup?.(group, context)
```

不要一个 `buildGroup` 兼管主表与子表。

## 左树右表

```ts
ui.buildExplorerView?.(context, {
  viewKind: 'categoryList',
  foreignKey: 'categoryId',
  treeWidth: '16rem',
  showTreeSearchBar: true,
  treeOption: { /* UiTreeViewProps */ },
  listOption: { /* 列表侧 extras */ },
})
```

旧名 `buildTreeListView` / `UiTreeListViewProps` 已弃用，改 `buildExplorerView` / `UiExplorerViewProps`。

## 插件整页

```ts
ui.buildGanttView?.(context, props)
ui.buildTimelineView?.(context, props)
ui.buildSchedulerView?.(context, props)
ui.buildKanbanView?.(context, props)
ui.buildDiagramView?.(context, props)
```

未安装对应 plugin 时会 **throw**。嵌在普通屏里的时间轴仍用 `factory.timeline`，不要 `fldFactory.timeline`。

## 登录页

```ts
// 路由组件里
factory.signinForm!(
  {
    context: app,
    onSignin: async (user) => {
      await app.signin(user.username, user.password)
      await router.replace(redirect)
    },
  },
  { title: () => null },
)
```

- **不要** `ui.buildSigninForm`（若皮肤仍保留，仅兼容委托）
- 注册同理：`factory.signupForm`

## 页内语义块

```ts
layout.container([
  layout.header(toolbar),
  layout.main(table, { class: 'mmda-list-scroll' }),
], { class: 'mmda-list-view' })
```

替代旧 `buildContainer` / `buildHeader` / `buildMain`。

## 不要做

| 不要 | 原因 |
|---|---|
| Logic 里 `import` 皮肤 / `h()` | Logic 只认 core 契约 |
| `factory.dialog` | 弹层走 Builder Overlay |
| 单元格调 `fld.render` | 会带标签 |
| Index 再套 `buildListView` | 已删除这条路径 |
| `buildAppScaffold` | 改 `AppLayout.scaffold` |
| 把 hasOne 选项灌进 `refOptions` | 见字段引用规则；大表按需 `searchRelative` |

## 旧文档

- 总览仍读 [ui.md](../ui.md)
- 本文取代日常写法上的 [ui_builder_usage.md](./ui_builder_usage.md)（该页改为跳转入口）
- 布局细节：[layout.md](./layout.md)、[vui layout_usage.md](../../../vui/docs/layout_usage.md)

# UiContext：程序员怎么写

业务钩子参数类型是 core **`UiContext`**（[`src/ui/context.ts`](../../src/ui/context.ts)）。vui 的 `UiViewContext` 实现它；`UiBuildContext` 给拼屏 / 屏级 IO，**不要写成 Logic 钩子类型**。

文件 [`ui_context.md`](./ui_context.md) 只说明职责边界。本轮 API 见 [refactor_ui_app.md](../refactor_ui_app.md)。

## 会话上三条通道

```ts
context.apiClient    // = logic.apiClient；会话/UI 助手
this.apiClient       // Logic 内实体 CRUD（同一实例）
context.uiBuilder    // toast / confirm / dialog / factory（core 契约）
context.app          // MmdaApplication；业务读 app.state
```

实体 CRUD 优先走 Logic 方法。不要掏 `globalProps.$ui` / `$api`。弹层不要调 `app.confirm`（已删除）。

从 `@mmda/vui` 注入拼屏实现时用 **`VueUiBuilder`**（抽象类；皮肤再 extends）。不要把 core 的 `UiBuilder` 盖成别名，也不要另造 Host 接口。

## searchRelative vs select

| 方法 | 有没有 UI | 用途 |
|---|---|---|
| `searchRelative(field, word)` | 无 | 下拉联想、列筛候选项 |
| `select(field)` | 有对话框 | hasOne：选完写回当前字段（原 `pickRelative`） |
| `select({ repository, … })` | 有对话框 | 任意仓库勾选，返回 `false` 或 `T[]` |

`ref` 小表走缓存 `refOptions`，不要 `select` 灌全表。`hasOne` 不要当小表 `loadReferenceOptions`。

```ts
await context.searchRelative(field, searchWord)

await context.select('partnerID')

const rows = await context.select({
  repository: 'Materials',
  service: 'mes',
  selectionMode: 'multiple',
})
if (rows === false) return
```

`EntitySelectParam`：`repository` 必填；跨服务加 `service`；`selectionMode` 为 `'single'` / `'multiple'`。不必 import 对方模型包（缺省用对方元数据构造实体）。

本地已有数组、只要表格勾选：[`MetaUiBuilder` + `factory.table` + `dialog`](../ui/ui_builder_usage.md)。

## 应用状态

```ts
context.app.state.user
context.app.state.modules
```

不要写 `app.context`。`loginLoading` 不在 `state` 上。

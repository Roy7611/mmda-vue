# UI 契约 / 应用壳 / 选记录（本轮重构）

> **产品分层真源：[ARCHITECTURE.md](../../../ARCHITECTURE.md)。** 本文只记本轮搬/删/改名与旧 API 对照，不当现行架构说明。更早的分层清理见 [refactor.md](./refactor.md)。程序员怎么写见 [ui_four_roles_usage.md](./ui/ui_four_roles_usage.md)、[ui_context_usage.md](./logic/ui_context_usage.md)。四职设计：[ui_four_roles_design.md](./ui/ui_four_roles_design.md)。

## 目标

- core **没有 UI 实现**，但必须有 **UI 契约**（`src/ui/`），Logic 才能 `confirm` / `dialog` / `factory.table` 而不碰 Vue。
- 业务 `*Logic.ts` 只认 core **`UiContext`**，不认 vui `VueUiContext`，不出现 `h` / `VNode`。
- vui 会话实现只有一个类 **`VueUiContext`**（Handbook mixin 按能力叠加）。旧 `UiViewContext` / `UiBuildContext` 已合并。设计 [vue_ui_context.md](../../vui/docs/vue_ui_context.md)，用法 [context.md](../../vui/docs/context.md)。
- 应用壳是 abstract class **`MmdaApplication`**；Vue 实现叫 **`MmdaVueApp`**。弹层不在壳上，走 `app.ui` / `context.uiBuilder`。
- 选记录统一 **`context.select`**，删掉平行的 `pickRelative` / `buildSearchForRelativeContent` / `buildSelector`。

## 目录

| 从 | 到 | 说明 |
|---|---|---|
| `logic/ui_builder.ts`、`logic/ui_context.ts`、`logic/ui_types.ts` | `src/ui/`（无 `ui_` 前缀） | 契约属 UI 层。**转发文件已删**；从 `@mmda/core` / `ui/` 导入 |
| vui `interface UiBuilder` | 删除 | 只保留 core 接口 |
| vui `AbstractUiBuilder` | **`VueUiBuilder implements UiBuilder<VNode>`** | Vue 抽象类：模板方法填共用拼屏；皮肤 `extends` |
| 曾短暂存在的 `VueUiBuilderHost` | **删除** | 注入/类型一律用 `VueUiBuilder` |
| 皮肤类名 | **不改** | 仍是 `SyncfusionUiBuilder` / `PrimeVueUiBuilder` / `AgNaiveUiBuilder` |
| vui 壳类名 `MmdaApplication` | **`MmdaVueApp`** | core 占用 `MmdaApplication` |

core 现布局：

```text
packages/core/src
  mmda_app.ts     abstract class MmdaApplication
  ui/             UiBuilder / UiFactory / UiFieldFactory / UiLayout / UiContext
  logic/          EntityLogic / Field·Group Logic
  metaui/         含 MetaUiBuilder
```

## 应用壳

| 旧 | 新 |
|---|---|
| vui 里一个叫 `MmdaApplication` 的具体类 | core **abstract class** `MmdaApplication`；vui **`MmdaVueApp extends` 它** |
| `app.context`（用户、模块、主题） | **`app.state: MmdaApplicationState`** |
| `loginLoading` 在壳状态上 | 登录页本地状态，不进 `state` |
| `app.toast` / `app.confirm` / `app.dialog` | **`app.ui.*`**（与 `context.uiBuilder` 同一对象） |
| `changeLocale` 只改 meta | Vue 先 `setI18nLocale`，再 `super.changeLocale`（只动 `meta`） |

业务读 `app.state.modules` / `app.state.user`。inject 类型用 core `MmdaApplication`。

启动：`new MmdaVueApp(baseUrl, service, ui, i18n, options)`（`packages/app`、playground）。

## 弹层 API

| 旧名字 | 新名字 | 语义 |
|---|---|---|
| `confirmMessage` | **`confirm(context, props)`** | 是/否，`Promise<boolean>` |
| `confirmDialog` | **`dialog(content, context, props?)`** | 弹层里塞内容，`Promise<unknown>` |
| `buildSelector` | 删除 | 选择器就是 `view = selectOne / selectMany` 的 **`buildView`** |

不要再导出 `confirmMessage` / `confirmDialog` 别名。

## 选记录

| 旧 | 新 |
|---|---|
| `searchRelative` | **保留**：联想 / 列筛，**不弹层** |
| `pickRelative(field)` | **`select(field)`**：对话框 + 写回当前字段 |
| `buildSearchForRelativeContent(...)` | **`select({ repository, service?, selectionMode })`**：任意仓库；返回 `false` 或 `T[]` |
| 本地行勾选再搜一遍 | **`MetaUiBuilder` + `factory.table` + `dialog`** |

`select` 两个重载：字段（hasOne 弹选并 `setFieldValue`）；`EntitySelectParam`（跨服务选实体，不必 import 对方模型包）。

已从公开 API 删除：`pickRelative`、`buildSearchForRelativeContent`、`buildColumns`。

## MetaUiBuilder

流式拼一份**列表用** `MetaUi`，再 `factory.table(rows, metaUi)`。内部数组叫 `_fields`，避免和方法 `fields()` 撞名。用法 [metaui_builder.md](./metaui/metaui_builder.md)。

## Logic 边界

允许：`context.uiBuilder.factory` / `fldFactory` / `buildView` / `confirm` / `dialog` / `select`。

不允许：业务 `*Logic.ts` 里 `h`、`VNode`、`defineComponent`、`ref`、`reactive`。Vue 组件仍可放在 `packages/mes/src/components/`。

`viewOptions` 仍**只返回选项**，不在那里 `h()`。

## 泛型

`UiBuilder<TNode = any>`。数组 `TNode[]`，子节点 `TNode | TNode[]`。vui 实现 `TNode = VNode`。

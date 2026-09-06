# Vue 运行时（索引）

本文档已拆到与 `@mmda/core` 相同的结构。请从 [README](../README.md) 进入：

| 文档 | 内容 |
|---|---|
| [应用壳](./application.md) | `MmdaVueApp`、`app.state`、鉴权、i18n |
| [实体交互逻辑](./logic.md) | `UiLogic` / `UiGroupLogic` |
| [会话上下文](./context.md) | 程序员：`VueUiContext` / core `UiContext` |
| [会话设计](./vue_ui_context.md) | 一个类 + mixin 叠放；不是本地/远程两层 |
| [Builder 与皮肤](./builder.md) | `UiBuilder` → `VueUiBuilder` → 皮肤；组件 → Factory |
| [列表与过滤](./list.md) | 工具栏、搜索、表头日期 multi、`select()` / selectMany |
| [表格契约](../../vui-syncfusion/docs/sf-grid.md) | 厂商无关的 Grid 接口（各皮肤共用） |
| [SfGrid 设计](../../vui-syncfusion/docs/sf-grid-design.md) | Syncfusion 皮肤如何实现该契约 |
| [树](./tree.md) | `factory.tree`、`buildTree` / `buildTreeView` |
| [树形表格](./treegrid.md) | `factory.treeGrid`、`buildTreeGrid` / `buildTreeGridView` |

core 对照：[core README](../../core/README.md)。

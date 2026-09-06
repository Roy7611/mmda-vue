# core `src/ui/`（契约，无实现）

core **不是没有 UI**，是 **没有 UI 实现**。程序员对着这些接口写 Logic：

| 文件 | 接口 |
|---|---|
| `builder.ts` | `UiBuilder<TNode>`：`toast` / `confirm` / `dialog` / `buildView` |
| `factory.ts` | `UiFactory<TNode>`：含 `table(rows, metaui)` |
| `field_factory.ts` | `UiFieldFactory<TNode>` |
| `layout.ts` | `UiLayout<TNode>` |
| `context.ts` | `UiContext`（含 `searchRelative` / `select`；`UiSelectionMode` / `UiSubGroupView`） |

vui：`VueUiBuilder implements UiBuilder<VNode>`（模板方法，取代 `AbstractUiBuilder`）。皮肤：`SyncfusionUiBuilder` / `PrimeVueUiBuilder` 等 `extends VueUiBuilder`。不要另造 Host，也不要把 vui 实现 alias 成 `UiBuilder`。

继承图见仓库 [ARCHITECTURE.md](../../../ARCHITECTURE.md)「Builder：契约 → Vue 抽象类 → 皮肤」、vui [builder.md](../../vui/docs/builder.md)。

程序员：[ui_builder_usage.md](./ui/ui_builder_usage.md)。本轮改名：[refactor_ui_app.md](./refactor_ui_app.md)。


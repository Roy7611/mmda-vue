# logic/ui_context.ts

- **层**：Logic 可见的会话类型；**真源在** `packages/core/src/ui/context.ts`
- **转发**：`packages/core/src/logic/ui_context.ts` 只 re-export

## 职责

Logic 钩子的一屏会话：**模型、字段/组逻辑、校验、翻译**，以及 `searchRelative` / `select`、`uiBuilder` / `apiClient` / `app`。

vui 的 `UiViewContext` implements 本接口；屏级 IO（`save` / `refresh` / 路由）在 `UiBuildContext`（`UiSessionIo`），不写进本接口。

不要按 Index/Edit/Details 拆 Context 类。子表转换参数用 models 的 `SubGroupItemTransformParam`。

程序员写法：[ui_context_usage.md](./ui_context_usage.md)。

## 不要

- 不要把钩子参数写成 vui `UiBuildContext`。
- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 `@mmda/core/src/...` 深路径导入。

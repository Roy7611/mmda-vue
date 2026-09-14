# logic/entity_bool_expr.ts

- **层**：Logic
- **源码**：packages/core/src/logic/entity_bool_expr.ts

## 职责

`ModuleAction` / `EntityAction.executableExpression` 编成 `Predicate`（`lockIf` / `hideIf` / `canDo` 同一主题）。
空表达式恒 true；解析失败恒 false。实现不读 `context`。

调用：`group_logic` 的 `canDo` 叠加；vui `canDoFromExecutableExpression` 建成 `UiAction.canDo`。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

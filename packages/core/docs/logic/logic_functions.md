# logic/logic_functions.ts

- **层**：Logic
- **源码**：packages/core/src/logic/logic_functions.ts

## 职责

程序员交互回调（Predicate、OnChangeFn、OnValidateFn、RefFilterFn、组回调）。
`logicAnd` / `logicOr` 组合谓词；`sqlAnd` / `sqlOr` 拼接 SQL 片段。
不含渲染器；`UiFieldRenderer` / `UiGroupRenderer` 在 vui。metaui/models 不要 import 本文件。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

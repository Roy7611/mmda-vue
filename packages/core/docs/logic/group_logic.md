# logic/group_logic.ts

- **层**：Logic
- **源码**：packages/core/src/logic/group_logic.ts

## 职责

子表组交互。inplaceEditable / inplaceEdit()。标准按钮 add/clear 在 `stdActions`，`canDo` 叠加 `executableExpression`。行删：`itemDeletable` / `beforeItemRemove`。组自定义合计：`aggregateWith` → `customAggregator`。自定义渲染挂 Function，VNode 类型在 vui。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

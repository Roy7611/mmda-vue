# logic/ui_types.ts

- **层**：Logic
- **源码**：packages/core/src/logic/ui_types.ts

## 职责

仅会话枚举 `UiSelectionMode`、`UiSubGroupView`（子表行对话框的 create/edit/details，对应 view）。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

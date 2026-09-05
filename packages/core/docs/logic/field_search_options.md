# logic/field_search_options.ts

- **层**：Logic
- **源码**：packages/core/src/logic/field_search_options.ts

## 职责

关联搜索会话缓存（候选项、searchParam、`currentSelectOption`、`isComposing`），不是元数据。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

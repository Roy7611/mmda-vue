# logic/ui_context.ts

- **层**：Logic
- **源码**：packages/core/src/logic/ui_context.ts

## 职责

一屏会话接口。vui 实现。子表转换参数用 models 的 SubGroupItemTransformParam。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

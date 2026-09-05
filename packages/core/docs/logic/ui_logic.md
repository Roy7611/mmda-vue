# logic/ui_logic.ts

- **层**：Logic
- **源码**：packages/core/src/logic/ui_logic.ts

## 职责

业务 XxxLogic 基座入口；再导出 field/group logic 与 logic_functions。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

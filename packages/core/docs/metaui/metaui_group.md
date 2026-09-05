# metaui/metaui_group.ts

- **层**：Data / metaui
- **源码**：packages/core/src/metaui/metaui_group.ts

## 职责

组与整页声明。组回调类型在 logic_functions。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

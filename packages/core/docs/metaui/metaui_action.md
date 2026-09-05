# metaui/metaui_action.ts

- **层**：Data / metaui
- **源码**：packages/core/src/metaui/metaui_action.ts

## 职责

EntityAction 元数据形状。实例列表在 Entity.actions。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

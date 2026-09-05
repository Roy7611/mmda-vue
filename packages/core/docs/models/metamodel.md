# models/metamodel.ts

- **层**：Data / models
- **源码**：packages/core/src/models/metamodel.ts

## 职责

MetaModel 与子表转换 SubGroupItemTransform。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

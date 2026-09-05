# models/entity.ts

- **层**：Data / models
- **源码**：packages/core/src/models/entity.ts

## 职责

实体形状。actions[] 只 type-import EntityAction。不要再导出工厂。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

# logic/field_logic.ts

- **层**：Logic
- **源码**：packages/core/src/logic/field_logic.ts

## 职责

字段 lock/hide/required、onChange、onValidate（可带 severity）、refFilter 叠加、inplaceEdit。
关联查询：`buildRefFilter`（where AND refFilter）、`buildRefSearchFilter`（再加 @param 替换与 searchWord LIKE）。
构造时从 `validatorDescriptors` 组装 `validators`。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

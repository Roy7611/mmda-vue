# metaui/metaui_field.ts

- **层**：Data / metaui
- **源码**：packages/core/src/metaui/metaui_field.ts

## 职责

字段声明、reference.where、`validationRules` → `validatorDescriptors`（见 validator_parse）。回调类型不在此。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

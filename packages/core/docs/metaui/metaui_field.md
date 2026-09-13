# metaui/metaui_field.ts

- **层**：Data / metaui
- **源码**：packages/core/src/metaui/metaui_field.ts

## 职责

字段声明、reference.where、`validationRules` → `validatorDescriptors`（见 validator_parse）。回调类型不在此。

`MetaUiField.filterTypes` 是 `MetaUiFilterType` 位掩码。除此之外字段只提供 `inferColumnFilterType()`（dataType + reference → boolean | date | number | text | set；enum / ref / hasOne → set）。静态 `MetaUiField.inferColumnFilterType(field)` 给皮肤处理尚未 `new` 的字段袋。选项是否穷尽：`MetaUiFieldRef.isRefOptionsFull`。词汇表见 [metaui_filter.md](./metaui_filter.md)，框架见 [entity_filter_design.md](../models/entity_filter_design.md)。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

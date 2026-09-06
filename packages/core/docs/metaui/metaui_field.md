# metaui/metaui_field.ts

- **层**：Data / metaui
- **源码**：packages/core/src/metaui/metaui_field.ts

## 职责

字段声明、reference.where、`validationRules` → `validatorDescriptors`（见 validator_parse）。回调类型不在此。

## 列过滤器类型（filterTypes）

服务端 `metauifield.filterTypes` 为 **TINYINT 位掩码**（默认 0）：

| 值 | 名 | 含义 |
|---|---|---|
| 0 | NONE | 未配置，按 `dataType` + `reference` 推断 |
| 1 | TEXT | 文本比较 |
| 2 | NUMBER | 数字比较 |
| 4 | DATE | 日期比较 |
| 8 | BOOLEAN | 布尔 |
| 16 | SET | 集合 / 枚举 / 引用 |
| 32 | MULTI | 比较槽 + 集合槽 |
| 64 | JOIN | 比较槽允许多条件 AND/OR |

core：`MetaUiFieldFilterType`、`resolveColumnFilterTypes`、`columnFilterKindOf`。Syncfusion `factory.table` / `SfGrid` 与 AgGrid 列定义均读该掩码。

## 不要

- 不要让 Data（metaui / models / utils）依赖 logic。
- 不要从 @mmda/core/src/... 深路径导入。

# metaui/metaui_filter.ts

- **层**：Data / metaui
- **源码**：packages/core/src/metaui/metaui_filter.ts
- **设计**：[entity_filter_design.md](../models/entity_filter_design.md)

## 职责

过滤器**词汇表**：类型位、算子。字段能力问 `MetaUiField.inferColumnFilterType()`；选项是否穷尽问 `MetaUiFieldRef.isRefOptionsFull`。

`MetaUiFilter` / `MetaUiFilterCondition` 是旧快捷 SQL 芯片，**不进** `FilterModel`。vui 芯片 UI 另开。

## `MetaUiFilterType`

一份枚举两用：位掩码 = `field.filterTypes`；小写名 = `FieldFilter.filterType` JSON。

| 值 | 名 | 含义 |
|---|---|---|
| 0 | NONE | 本地未写位；服务端下发不会空 |
| 1 | TEXT | 文本比较 |
| 2 | NUMBER | 数字比较 |
| 4 | DATE | 日期比较 |
| 8 | BOOLEAN | 布尔 |
| 16 | SET | 集合 / 枚举 / 引用 |
| 32 | MULTI | 比较槽 + 集合槽（皮肤自己看位，不支持就降级） |
| 64 | JOIN | 比较槽允许多条件 AND/OR（同上） |

位置位用已有 `hasBit(mask, MetaUiFilterType.SET)`，与 `Module.allowOps` 相同。不要 core `hasFilterType` / `resolve` / `columnFilterKindOf`。列头画哪种壳（含 `range`）是各皮肤的事。

配套 `MetaUiFilterTypeEnum`：`valueOf`（名 → 位）、`nameOf`（成员名 `DATE`）、`textOf`（JSON 小写 `date`）、`hasFlag`。

## `MetaUiFilterOperator`

成员名 = JSON（`EQ` / `STARTS_WITH`）。值 = 控件名（`equals` / `startsWith`）。`FieldFilter.operator` 用 `MetaUiFilterOperatorCode`。配套 `valueOf` / `nameOf` / `textOf`。

## 不要

- 不要在 core 做 `0 → infer`、`TEXT → SET`。
- 不要从当前页 `getDistinct` 凑选项。
- 不要让 Data 依赖 Logic。
- 不要从 @mmda/core/src/... 深路径导入。

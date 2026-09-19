# Query Builder 设计

chrome 查询构建器走 `factory.queryBuilder`。契约 `UiQueryBuilderProps` 在 `@mmda/core`。**不是** Builder 插件，不要 `setQueryBuilderPlugin`。

对齐 `AdvancedFilterModel` 跨字段 join 树，不是列头 `FilterModel`。程序员用法：[query_builder_usage.md](./query_builder_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

- core [`AdvancedFilterModel`](../../core/src/models/entity_search.ts)：跨字段 join 树；叶子带 `fieldName`
- core [`query_builder.ts`](../../core/src/ui/factory/query_builder.ts)：`UiQueryBuilderProps`、列、默认算子（`MetaUiFilterOperatorEnum`）
- vui `ui/factory/query_builder.ts`：Vue `emitQueryBuilderChange`；`QueryBuilderHost` 给无厂商树控件的皮肤
- 皮肤映射自己的 JSON：SF EJ2 `RuleModel`（[`ej2_query.ts`](../../vui-syncfusion/src/factory/ej2_query.ts)）；agnaive Advanced Filter（[`ag_advanced_filter.ts`](../../vui-agnaive/src/ag_advanced_filter.ts)）
- `EntityQuery.advancedFilterModel` 可保存。**`searchAll` 本轮不 POST**（Java 后续）

列 `FilterModel` / `ag_filter` / 表头过滤不动。列里的 `join`/`multi` 仍是同一字段。AG Advanced Filter **不要**接到列头 `ag_filter`。

## 属性

- `fields`：`MetaUiField[]`，译成列
- `columns`：已译好的列（优先于 `fields`）
- `value`：`AdvancedFilterModel`。也认 `modelValue`
- `onChange`：`(model | undefined)`。空树 compact 成 `undefined`
- `disabled`
- enum / ref：选项来自 `refOptions`，显示 `labelOf`，值 `valueOf`。hasOne 不灌 `refOptions`

钩子 class：`mmda-querybuilder`。

## 皮肤映射

- SF：EJ2 Query Builder；`rule` / `change`；算子名 `equal` / `isempty` 由皮肤映射
- Prime / agnaive：无独立厂商树控件时用 `QueryBuilderHost`（AND/OR 组 + 字段/运算符/值）
- agnaive 另有 AG Advanced Filter JSON 互转（`blank` / `inRange` / `true` 等差异）

## 源码

- core：[`query_builder.ts`](../../core/src/ui/factory/query_builder.ts)
- vui：[`query_builder.ts`](../src/ui/factory/query_builder.ts)、[`QueryBuilderHost.ts`](../src/components/QueryBuilderHost.ts)
- 皮肤：各包 `factory/query_builder.ts`

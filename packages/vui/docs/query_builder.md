# Query Builder 设计

chrome 查询构建器走 `factory.queryBuilder`。契约 `UiQueryBuilderProps` 在 `@mmda/core`。**不是** Builder 插件，不要 `setQueryBuilderPlugin`。

对齐 AG Grid **Advanced Filter**（`getAdvancedFilterModel`），不是列头 `FilterModel`。程序员用法：[query_builder_usage.md](./query_builder_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

- core [`EntityAdvancedFilterModel`](../../core/src/models/entity_search.ts)：跨字段 join 树；叶子带 `fieldName`
- vui `ui/factory/query_builder.ts`：`UiQueryBuilderProps`；EJ2 `RuleModel` / AG AdvancedFilter JSON ↔ 该树
- 皮肤 `factory/query_builder.ts`：SF `QueryBuilderComponent`；Prime / Naive 用 vui `QueryBuilderHost`
- `EntityQuery.advancedFilterModel` 可保存。**`searchAll` 本轮不 POST**（Java 后续）

列 `EntityFilterModel` / `ag_filter` / 表头过滤不动。列里的 `join`/`multi` 仍是同一字段。

## 属性

- `fields`：`MetaUiField[]`，译成列
- `columns`：已译好的列（优先于 `fields`）
- `value`：`EntityAdvancedFilterModel`。也认 `modelValue`
- `onChange`：`(model | undefined)`。空树 compact 成 `undefined`
- `disabled`
- enum / ref：选项来自 `refOptions`，显示 `labelOf`，值 `valueOf`。hasOne 不灌 `refOptions`

钩子 class：`mmda-querybuilder`。

## 皮肤映射

- SF：EJ2 Query Builder；`rule` / `change`
- Prime / agnaive：无独立厂商树控件时用 `QueryBuilderHost`（AND/OR 组 + 字段/运算符/值）。AG Advanced Filter **不要**接到列头 `ag_filter`

## 源码

- vui：[`query_builder.ts`](../src/ui/factory/query_builder.ts)、[`QueryBuilderHost.ts`](../src/components/QueryBuilderHost.ts)
- 皮肤：各包 `factory/query_builder.ts`

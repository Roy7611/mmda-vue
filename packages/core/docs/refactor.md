# 本轮 core 分层清理

## 搬

| 从 | 到 | 原因 |
|---|---|---|
| metaui 上的回调类型（Predicate、OnChangeFn、组回调等） | `logic/logic_functions.ts` | 程序员写 Logic 用的，不是元数据 |
| `models/module.ts` | `metaui/module.ts` | 功能目录是服务端元数据 |
| `Watermark` / `setWatermark` | `@mmda/vui` `ui_watermark.ts` | 展现，不属于 core |
| 子表转换参数 | `models` 的 `SubGroupItemTransform` / `SubGroupItemTransformParam` | 实体操作属于 Data |

## 删

- 公开 `filterFn`、写回 `reference.filterFn`
- `onSearchChange` / `setSelectable`（FieldLogic）/ `FooterAction` / `logicMethods`
- `models/validation.ts`、`models/date_range.ts` 兼容转发
- `MetaUiFieldOptions` / `defaultFieldOptions` 别名
- `entity.ts` 再导出 `EntityActionType` / `entityActionFactory`
- `onWarn` / `OnWarnFn`、`searchable` / `isSearchField`、`setSearchParam` / `SetSearchParamFn`、`frozen` / `setFrozen`（FieldLogic）
- `UiFieldRenderer` / `UiCellRenderer` / `UiGroupRenderer` 移出 `logic_functions`；真源在 vui `ui_factory`

## 改名

- `cellEditable` → `inplaceEditable`；方法 `inplaceEdit()`（列级 boolean，不改 Predicate）
- `UiSubGroupMode` → `UiSubGroupView`（子表行对话框的 view，不是另一套 mode）

## 引用过滤

`refFilter` 往内部列表追加。`buildRefFilter` = `sqlAnd(reference.where, ...logicFns)`。vui 用 `buildRefSearchFilter` 组装关联查询（含 searchWord / `@param`）。原 `setSearchParam` 的 queryParams 加码改为 `refFilter` SQL。

## 列表查询（EntityQuery）

| 项 | 说明 |
|---|---|
| 可保存文档 | `EntityQuery`（`filterModel` + `pager` 含 sorts + `searchWord` + 命名元数据） |
| 当次请求 | `EntitySearchParam`（≈ Query + 兼容 `queryParams?`） |
| 列表入口 | 一律 `searchAll`；有 `filterModel` 才 POST body |
| 运算符 | 结构化用 `EntityFilterOperator`；SQL 片段用 `SqlOperator`（已删 SearchOp） |
| 模块芯片 | `Module.defaultFilter` = `queryID;queryName\|…`（不是 FilterModel JSON） |
| 本地缓存 | pack.`lastQuery` 一整份 EntityQuery；不单存 sorts |
| CustomizedQuery | `queryExpression` = `JSON.stringify(EntityQuery)`，旧 SQL 双读 |

设计 [entity_search.md](./models/entity_search.md)；用法 [entity_query_usage.md](./logic/entity_query_usage.md)。

## 本轮不删

旧 HTTP：`FetchClient` / `OAuthApiClient` / `ApiError` 仅标 deprecated。推荐 `FetchApi` + `OAuth2ApiClient` + `ApiProblem`。

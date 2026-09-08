# @mmda/core 设计说明

- **产品分层**：[仓库 ARCHITECTURE.md](../../../ARCHITECTURE.md)（UI → Logic → Data）
- **本包目录**：[core_architecture.md](./core_architecture.md)
- [本轮分层清理（历史）](./refactor.md)
- [UI 契约 / 应用壳 / 选记录（本轮）](./refactor_ui_app.md)
- [core / vui / syncfusion 评估（工作稿）](../../../docs/reviews/core-vui-syncfusion.md)
- [UiBuilder：程序员怎么写](./ui/ui_builder_usage.md)
- [UiContext：程序员怎么写](./logic/ui_context_usage.md)
- [vui 会话设计（VueUiContext）](../../vui/docs/vue_ui_context.md)
- [vui 会话：程序员怎么写](../../vui/docs/context.md)
- [MetaUiBuilder](./metaui/metaui_builder.md)
- [校验框架设计](./logic/validation_design.md)
- [校验：程序员怎么写](./logic/validation_usage.md)
- [列表查询设计：EntityQuery / FilterModel](./models/entity_search.md)
- [列表查询：程序员怎么写](./logic/entity_query_usage.md)
- [日期过滤与 Filter API 设计](./models/date_filter.md)
- [日期过滤：程序员怎么写](./logic/date_filter_usage.md)

按目录汇总（细节以单文件为准）：

- [logic.md](./logic.md) — **Logic 层**
- [ui.md](./ui.md) — **UI 契约**（无实现）；用法 [ui_builder_usage.md](./ui/ui_builder_usage.md)
- [metaui.md](./metaui.md) / [models.md](./models.md) / [net.md](./net.md) — **Data**
- [dependency-injection.md](./dependency-injection.md)
- [utils.md](./utils.md)
- [extensions.md](./extensions.md)

## logic

- [field_logic.ts](./logic/field_logic.md)
- [field_search_options.ts](./logic/field_search_options.md)
- [group_logic.ts](./logic/group_logic.md)
- [logic_functions.ts](./logic/logic_functions.md)
- [sql_operator.ts](./logic/sql_operator.md)
- [entity_query_usage.md](./logic/entity_query_usage.md)
- [date_filter_usage.md](./logic/date_filter_usage.md)
- [ui_context.ts](./logic/ui_context.md)（类型在 `src/ui/context.ts`）
- [ui_context_usage.md](./logic/ui_context_usage.md)
- [entity_logic.ts](./logic/entity_logic.md)
- [validation.ts](./logic/validation.md)
- [validators/](./logic/validators.md)
- [validator.md](./logic/validator.md)（内置名字）
- [validation_design.md](./logic/validation_design.md)
- [validation_usage.md](./logic/validation_usage.md)

## metaui

- [datatype.ts](./metaui/datatype.md)
- [metaui_builder.ts](./metaui/metaui_builder.md)
- [metaui_action.ts](./metaui/metaui_action.md)
- [metaui_field.ts](./metaui/metaui_field.md)
- [validator_parse.ts](./metaui/validator_parse.md)
- [metaui_filter.ts](./metaui/metaui_filter.md)
- [metaui_group.ts](./metaui/metaui_group.md)
- [metaui_service.ts](./metaui/metaui_service.md)
- [module.ts](./metaui/module.md)

## models

- [entity.ts](./models/entity.md)
- [entity_collection.ts](./models/entity_collection.md)
- [entity_search.ts](./models/entity_search.md)
- [date_filter.ts](./models/date_filter.md)
- [entity_state.ts](./models/entity_state.md)
- [file.ts](./models/file.md)
- [metamodel.ts](./models/metamodel.md)
- [pagination.ts](./models/pagination.md)

## net

- [api_client.ts](./net/api_client.md)
- [api_error.ts](./net/api_error.md)
- [api_problem.ts](./net/api_problem.md)
- [fetch_api.ts](./net/fetch_api.md)
- [fetch_api_http.ts](./net/fetch_api_http.md)
- [http.ts](./net/http.md)
- [oauth_api_client.ts](./net/oauth_api_client.md)

## di

- [dependency.ts](./di/dependency.md)

## utils

- [date_range.ts](./utils/date_range.md)
- [entity_bool_expr.ts](./utils/entity_bool_expr.md)
- [formatter.ts](./utils/formatter.md)
- [is.ts](./utils/is.md)
- [localdb.ts](./utils/localdb.md)
- [platform.ts](./utils/platform.md)
- [pluralize.ts](./utils/pluralize.md)
- [tools.ts](./utils/tools.md)

## extensions

- [array_extensions.ts](./extensions/array_extensions.md)
- [datetime_extensions.ts](./extensions/datetime_extensions.md)
- [number_extensions.ts](./extensions/number_extensions.md)
- [string_extensions.ts](./extensions/string_extensions.md)

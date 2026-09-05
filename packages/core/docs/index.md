# @mmda/core 设计说明

- [架构](./core_architecture.md)
- [本轮分层清理](./refactor.md)
- [校验框架设计](./logic/validation_design.md)
- [校验：程序员怎么写](./logic/validation_usage.md)
- [列表查询设计：EntityQuery / FilterModel](./models/entity_search.md)
- [列表查询：程序员怎么写](./logic/entity_query_usage.md)

按层汇总（旧文，细节以单文件说明为准）：

- [logic.md](./logic.md)
- [metaui.md](./metaui.md)
- [models.md](./models.md)
- [net.md](./net.md)
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
- [ui_context.ts](./logic/ui_context.md)
- [ui_logic.ts](./logic/ui_logic.md)
- [ui_types.ts](./logic/ui_types.md)
- [validation.ts](./logic/validation.md)
- [validators/](./logic/validators.md)
- [validator.md](./logic/validator.md)（内置名字）
- [validation_design.md](./logic/validation_design.md)
- [validation_usage.md](./logic/validation_usage.md)

## metaui

- [datatype.ts](./metaui/datatype.md)
- [metaui_action.ts](./metaui/metaui_action.md)
- [metaui_dialog.ts](./metaui/metaui_dialog.md)
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

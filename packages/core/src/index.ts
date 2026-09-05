/**
 * 元模型驱动架构核心（@mmda/core）
 * 产品层：Logic（logic/）+ Data（其余）。没有 UI。
 */
export { DateTime, Duration, Interval } from 'luxon'

// Data：utils / extensions
export * from './utils/is'
export * from './utils/platform'
export * from './utils/formatter'
export * from './utils/localdb'
export * from './utils/pluralize'
export * from './utils/date_range'
export * from './utils/tools'
export * from './utils/entity_bool_expr'
export * from './extensions/string_extensions'
export * from './extensions/datetime_extensions'
export * from './extensions/number_extensions'
export * from './extensions/array_extensions'

// Data：metaui（含 Module）
export * from './metaui/datatype'
export * from './metaui/metaui_dialog'
export * from './metaui/metaui_action'
export * from './metaui/metaui_field'
export * from './metaui/metaui_group'
export * from './metaui/metaui_filter'
export * from './metaui/metaui_service'
export * from './metaui/module'

// Data：models
export * from './models/entity'
export * from './models/file'
export * from './models/metamodel'
export * from './models/pagination'

// Logic
export * from './logic/field_search_options'
export * from './logic/validation'
export * from './logic/validators'
export * from './logic/ui_context'
export * from './logic/ui_logic'
export * from './logic/sql_operator'

// Data：net / di
export * from './net/api_problem'
export * from './net/fetch_api'
export * from './net/fetch_api_http'
export * from './net/api_error'
export * from './net/http'
export * from './net/api_client'
export * from './net/oauth_api_client'
export * from './di/dependency'

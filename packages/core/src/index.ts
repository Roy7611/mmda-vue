/*
 * @Author: kuayue 1594492894@qq.com
 * @Date: 2024-09-18 19:16:04
 * @LastEditors: kuayue 1594492894@qq.com
 * @LastEditTime: 2025-04-24 10:58:22
 * @FilePath: /mmda-vue/packages/core/src/index.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export { DateTime, Duration, Interval } from 'luxon'
/**
 * 元模型驱动架构核心（@mmda/core）
 */
//工具类
export * from './utils/is'
export * from './utils/platform'
export * from './utils/formatter'
export * from './utils/localdb'
export * from './utils/pluralize'
export * from './utils/date_range'
export * from './utils/tools'

//基础类型扩展
export * from './extensions/string_extensions'
export * from './extensions/datetime_extensions'
export * from './extensions/number_extensions'
export * from './extensions/array_extensions'
//实体模型框架 entity
export * from './models/entity'
export * from './models/file'
export * from './models/module'
export * from './models/metamodel'
export * from './models/pagination'
//元界面 metaui
export * from './metaui/datatype'
export * from './metaui/metaui_dialog'
export * from './metaui/metaui_action'
export * from './metaui/metaui_field'
export * from './metaui/metaui_group'
export * from './metaui/metaui_filter'
export * from './metaui/metaui_sort'
export * from './metaui/metaui_search'
export * from './metaui/metaui_service'
//前端交互逻辑
export * from './logic/field_search_options'
export * from './logic/validation'
export * from './logic/ui_context'
export * from './logic/ui_logic'
//网络 http & api_client
export * from './net/api_error'
export * from './net/http'
export * from './net/api_client'
export * from './net/oauth_api_client'
//依赖注入框架
export * from './di/dependency'

import type { ApiClient, LocalAsyncDb, MetaUiService } from '@mmda/core'
import type { InjectionKey } from 'vue'
import type { UiViewContext } from './ui_context'
import type { UiBuilder } from './ui_builder'
import type { MmdaApplication } from './ui_app'

export type ApiClientConstrutor = (repository?: string) => ApiClient

export const API_CLIENT_KEY = Symbol('ApiClient') as InjectionKey<ApiClientConstrutor>
export const LOCAL_DB_KEY = Symbol('LocalDb') as InjectionKey<LocalAsyncDb>
export const META_UI_SERVICE_KEY = Symbol(
  'MetaUiService',
) as InjectionKey<MetaUiService>
/** 当前实体表单的 Vue 交互会话。 */
export const UI_CONTEXT_KEY = Symbol(
  'UiViewContext',
) as InjectionKey<UiViewContext>
/** 注入 UiBuilder；皮肤包提供具体实现。 */
export const UI_BUILDER_KEY = Symbol('UiBuilder') as InjectionKey<UiBuilder>
export const UI_APP_KEY = Symbol('MmdaApplication') as InjectionKey<MmdaApplication>

import {
  UI_APP_KEY as CORE_UI_APP_KEY,
  type ApiClient,
  type LocalAsyncDb,
  type MetaUiService,
  type MmdaApplication,
} from '@mmda/core'
import type { InjectionKey } from 'vue'
import type { VuiContext } from '../contexts/vue_ui_context'

export type ApiClientConstrutor = (repository?: string) => ApiClient

export const API_CLIENT_KEY = Symbol('ApiClient') as InjectionKey<ApiClientConstrutor>
export const LOCAL_DB_KEY = Symbol('LocalDb') as InjectionKey<LocalAsyncDb>
export const META_UI_SERVICE_KEY = Symbol(
  'MetaUiService',
) as InjectionKey<MetaUiService>
/** 当前实体表单的 Vue 交互会话。 */
export const UI_CONTEXT_KEY = Symbol(
  'VuiContext',
) as InjectionKey<VuiContext>
/** 注入应用壳。符号本体在 core（`ui/app_keys.ts`），这里只做 Vue 的 InjectionKey 包装。 */
export const UI_APP_KEY = CORE_UI_APP_KEY as InjectionKey<MmdaApplication>

import type { VNode } from 'vue'
import type { UiEntityViewFn, UiViewFn } from '@mmda/core'
import { hostedEntityView, hostedView } from '@mmda/vui'
import type { AppPlugin } from './host'

// 适配层住 vui（Vue 运行时），这里只再导出，方便宿主侧引用。
export { hostedEntityView, hostedView }

type HostedPluginSource = Omit<AppPlugin, 'home' | 'placeholderView'> & {
  /** 页面视图：框架无关的 `UiViewFn`（core 契约）。 */
  home: UiViewFn<VNode>
  placeholderView?: UiViewFn<VNode>
}

/**
 * 业务插件（页面是框架无关视图）→ 宿主插件（页面是 Vue 组件）。
 * 插件自己的 `resolveCustomView`（老，Vue 组件）原样带过去；宿主渲染实体屏时会优先认
 * `resolveEntityView`（框架无关）。
 */
export function hostedPlugin(plugin: HostedPluginSource): AppPlugin {
  return {
    ...plugin,
    home: hostedView(plugin.home),
    placeholderView: plugin.placeholderView
      ? hostedView(plugin.placeholderView)
      : undefined,
  }
}

export type { HostedPluginSource, UiEntityViewFn, UiViewFn }

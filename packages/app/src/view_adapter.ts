import { defineComponent, inject, type Component, type VNode } from 'vue'
import { useRouter } from 'vue-router'
import type { UiNodeProps, UiViewDeps, UiViewFn } from '@mmda/core'
import { UI_APP_KEY, type MmdaVueApp } from '@mmda/vui'
import type { AppPlugin } from './host'

/**
 * 把**框架无关**的页面视图（core `UiViewFn`）包成宿主的 Vue 组件。
 *
 * 「由视图层注入」就落在这一处：壳（`app`）、路由适配、最底层渲染器在这里一次装配好，
 * 业务包（如 `@mmda/base`）因此只 import `@mmda/core`。
 *
 * 返回的渲染函数在 Vue 的渲染 effect 里跑 —— 视图里读 `app.state.todoCount` 一样会被追踪，
 * 业务侧不需要写任何响应式代码。
 */
export function hostedView(view: UiViewFn<VNode>): Component {
  return defineComponent({
    name: 'MmdaHostedView',
    setup() {
      const app = inject(UI_APP_KEY) as MmdaVueApp
      const router = useRouter()
      const deps: UiViewDeps<VNode> = {
        app,
        render: (tag, props, children) =>
          app.ui.layout.render(
            tag,
            (props ?? {}) as UiNodeProps,
            (children ?? []) as VNode[],
          ),
        router: {
          push: (path) => void router.push(path),
          resolve: (path) => router.resolve(path).href,
        },
      }
      return () => view(deps)
    },
  })
}

type HostedPluginSource = Omit<AppPlugin, 'home' | 'placeholderView'> & {
  /** 页面视图：框架无关的 `UiViewFn`（core 契约）。 */
  home: UiViewFn<VNode>
  placeholderView?: UiViewFn<VNode>
}

/**
 * 业务插件（页面是框架无关视图）→ 宿主插件（页面是 Vue 组件）。
 * 还没搬迁的业务包（如 `@mmda/mes`，页面仍是 Vue 组件）直接 `as AppPlugin` 注册即可。
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

import { defineComponent, h, inject, type Component, type VNode } from 'vue'
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

      /**
       * 代管锚点点击：业务视图用 `factory.link` 吐真实 `<a href>`（中键 / 右键 / 复制链接都能用），
       * 但普通左键必须走 SPA，不能整页刷新。拦截放在宿主这一层，业务侧不用知道路由库。
       */
      const onHostedClick = (event: MouseEvent): void => {
        if (event.defaultPrevented || event.button !== 0) return
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
        const anchor = (event.target as HTMLElement | null)?.closest?.(
          'a[href]',
        ) as HTMLAnchorElement | null
        if (!anchor || anchor.target === '_blank') return
        const href = anchor.getAttribute('href') ?? ''
        // 只接管站内绝对路径（`/BASE/...`）；外链与 `//cdn` 原样交给浏览器。
        if (!href.startsWith('/') || href.startsWith('//')) return
        event.preventDefault()
        void router.push(href)
      }

      // 壳用 `display: contents`：只做事件委托，不参与布局（视图里的 height:100% 仍按它的父级算）。
      return () =>
        h(
          'div',
          {
            class: 'mmda-hosted-view',
            style: { display: 'contents' },
            onClick: onHostedClick,
          },
          [view(deps)],
        )
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

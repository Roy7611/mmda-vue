/*
 * 「业务中性视图 → Vue 组件」的适配层（vui = Vue 运行时，所以放这里）。
 *
 * 业务包（base / mes / 其它插件包）只 import `@mmda/core`：页面写成 `UiViewFn` /
 * `UiScreenViewFn`，由这里一次性把依赖装配好（壳 / 渲染器 / 路由 / 该屏会话），
 * 业务侧不写响应式代码、也不 import 路由库。
 */
import { defineComponent, h, inject, type Component, type VNode } from 'vue'
import { useRouter } from 'vue-router'
import type {
  UiNodeProps,
  UiScreenViewDeps,
  UiScreenViewFn,
  UiViewDeps,
  UiViewFn,
} from '@mmda/core'
import type { MmdaVueApp } from '../app/app'
import { UI_APP_KEY } from '../app/keys'

/** 站内链接的点击代管：真 `<a href>` 也要走 SPA，不整页刷新。 */
function onHostedClick(event: MouseEvent, push: (path: string) => void): void {
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
  push(href)
}

/** 壳用 `display: contents`：只做事件委托，不参与布局（视图里的 height:100% 仍按它的父级算）。 */
function shell(rendered: VNode, push: (path: string) => void): VNode {
  return h(
    'div',
    {
      class: 'mmda-hosted-view',
      style: { display: 'contents' },
      onClick: (event: MouseEvent) => onHostedClick(event, push),
    },
    [rendered],
  )
}

/**
 * 页面级视图（模块首页 / 占位页这类非实体屏）→ Vue 组件。
 * 返回值在 Vue 的渲染 effect 里跑，所以视图里读 `app.state.*` 一样会被追踪。
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
      return () => shell(view(deps), (path) => void router.push(path))
    },
  })
}

/**
 * 实体屏自定义页（列表 / 详情）→ Vue 组件。
 * 比 {@link hostedView} 多一个 `ctx` prop：该屏的会话由宿主传进来（重页面都走
 * `builder.buildGantt(context, props)` 这类会话接口）。
 */
export function hostedScreenView(
  view: UiScreenViewFn<VNode>,
): Component {
  return defineComponent({
    name: 'MmdaHostedScreenView',
    props: { ctx: { type: Object, required: true } },
    setup(props) {
      const app = inject(UI_APP_KEY) as MmdaVueApp
      const router = useRouter()
      return () => {
        const deps: UiScreenViewDeps<VNode> = {
          app,
          context: props.ctx as UiScreenViewDeps<VNode>['context'],
          render: (tag, props2, children) =>
            app.ui.layout.render(
              tag,
              (props2 ?? {}) as UiNodeProps,
              (children ?? []) as VNode[],
            ),
          router: {
            push: (path) => void router.push(path),
            resolve: (path) => router.resolve(path).href,
          },
        }
        return shell(view(deps), (path) => void router.push(path))
      }
    },
  })
}

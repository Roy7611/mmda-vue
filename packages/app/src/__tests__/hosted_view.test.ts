/**
 * 宿主适配的接线证明：框架无关的 `@mmda/base` 首页，由 Vue 宿主包一层后**真的渲染出来**。
 *
 * 验三件事：
 * 1. `UiViewDeps` 装配对：壳 / 渲染器 / 路由都到位（模块卡片的 href 来自 adapter 的
 *    `router.resolve`，不是视图自己拼的）；
 * 2. 视图只读 `app.*`，不写响应式代码 —— `state.todoCount` 变了照样重渲（宿主渲染函数里追踪）；
 * 3. 业务包不 import 任何框架（`@mmda/base/src` 里 vue 系列 import 为 0）。
 */
import { describe, expect, it } from 'vitest'
import { createApp, h, nextTick, reactive, type VNode } from 'vue'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import type { MmdaApplication } from '@mmda/core'
import { UI_APP_KEY } from '@mmda/vui'
import { basePlugin } from '@mmda/base/src/plugin'
import { hostedView } from '../view_adapter'

type StubApp = {
  state: { todoCount: number }
  modules: unknown[]
  user: { username?: string }
  translate: (key: string) => string
  ui: {
    layout: {
      render: (
        tag: string,
        props: { class?: string; style?: Record<string, unknown> },
        children: VNode[],
      ) => VNode
    }
    factory: {
      icon: (props: { iconClass?: string }) => VNode
      link: (
        props: { href?: string; class?: string; style?: Record<string, unknown> },
        slots?: { default?: () => VNode[] },
      ) => VNode
    }
  }
}

function moduleTree() {
  return [
    {
      moduleType: 'SYSTEM',
      subModules: [
        {
          moduleType: 'MODULE',
          moduleLabel: '基础数据',
          subModules: [
            {
              moduleType: 'FEATURE',
              moduleLabel: '物料',
              description: '物料主数据',
              moduleIcon: 'fas fa-box',
              moduleUrl: '/BASE/Materials',
              allowOps: 1,
            },
          ],
        },
      ],
    },
  ]
}

async function mountHome() {
  const app: StubApp = {
    state: reactive({ todoCount: 3 }),
    modules: moduleTree(),
    user: { username: 'admin' },
    translate: (key: string) => `t:${key}`,
    ui: {
      layout: {
        render: (tag, props, children) =>
          h(tag, { class: props?.class, style: props?.style }, children),
      },
      factory: {
        icon: (props) => h('i', { class: props?.iconClass }),
        link: (props, slots) =>
          h(
            'a',
            { href: props?.href, class: props?.class, style: props?.style },
            slots?.default?.() ?? [],
          ),
      },
    },
  }
  const router: Router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }],
  })
  await router.push('/BASE/')
  await router.isReady()

  const host = document.createElement('div')
  document.body.append(host)
  const vueApp = createApp(hostedView(basePlugin.home as never))
  vueApp.use(router)
  // 键的类型是 InjectionKey<MmdaApplication>；桩只需要 ui/state/modules/user/translate 这几项。
  vueApp.provide(UI_APP_KEY, app as unknown as MmdaApplication)
  vueApp.mount(host)
  return { host, vueApp, app, router }
}

describe('hostedView(base 首页)', () => {
  it('渲染出标题 / 模块数 / 用户，且模块卡片是 router.resolve 出来的真链接', async () => {
    const { host, vueApp } = await mountHome()

    expect(host.textContent).toContain('t:home.workbench')
    expect(host.textContent).toContain('admin')
    expect(host.textContent).toContain('物料')

    const link = host.querySelector('a.home-card') as HTMLAnchorElement | null
    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBe('/BASE/Materials')

    vueApp.unmount()
    host.remove()
  })

  it('卡片是真实 <a href>，但普通左键由宿主接管走 SPA（不整页刷新）', async () => {
    const { host, vueApp, router } = await mountHome()
    const link = host.querySelector('a.home-card') as HTMLAnchorElement

    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    link.dispatchEvent(event)
    // router.push 是异步导航，等一个宏任务再断言。
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()

    // 默认行为被拦下 → 浏览器不会整页跳走；路由自己变。
    expect(event.defaultPrevented).toBe(true)
    expect(router.currentRoute.value.path).toBe('/BASE/Materials')

    vueApp.unmount()
    host.remove()
  })

  it('带修饰键的点击不拦（照旧交给浏览器新标签打开）', async () => {
    const { host, vueApp, router } = await mountHome()
    const link = host.querySelector('a.home-card') as HTMLAnchorElement

    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
      metaKey: true,
    })
    link.dispatchEvent(event)
    await nextTick()

    expect(event.defaultPrevented).toBe(false)
    expect(router.currentRoute.value.path).toBe('/BASE/')

    vueApp.unmount()
    host.remove()
  })

  it('视图不写响应式代码，app.state 变化照样重渲', async () => {
    const { host, vueApp, app } = await mountHome()
    expect(host.textContent).toContain('3')

    app.state.todoCount = 7
    await nextTick()

    expect(host.textContent).toContain('7')
    expect(host.textContent).not.toContain('3')

    vueApp.unmount()
    host.remove()
  })
})

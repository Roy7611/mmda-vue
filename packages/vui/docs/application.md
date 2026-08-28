# 应用壳

`MmdaApplication` 是 Vue 应用入口：鉴权、元数据服务、DI、locale，以及把 toast / confirm 转给当前 `UiBuilder`。

## 主要内容

- `MmdaApplication`：`OAuth2ApiClient`（`FetchApi`）、`MetaUiService`、模块目录、登录态。
- `setupI18n`：vue-i18n 实例；内置 zh / en / zh-Hant。
- inject keys：`UI_APP_KEY`、`UI_BUILDER_KEY`、`UI_CONTEXT_KEY`。
- 弹层 API：`toast` / `confirm` / `confirmDialog`，实现在 Builder，不在 core。

```ts
import { MmdaApplication, setupI18n, UI_APP_KEY } from '@mmda/vui'
```

## 启动

```ts
const i18n = setupI18n({ zh, en }, 'zh')
const mmda = new MmdaApplication(apiUrl, 'base', builder, i18n, {
  clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
  clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET,
})

vueApp.use(i18n)
vueApp.use(mmda)
vueApp.provide(UI_BUILDER_KEY, builder)

await mmda.signinAuto()
vueApp.mount('#app')
```

HTTP 走 `FetchApi` + `OAuth2ApiClient`，错误为 `ApiProblem`。详见 [core net 文档](../../core/docs/net.md)。

`vueApp.use(mmda)` 会：

- 把 `$app` 挂到 `globalProperties`；
- `provide(UI_APP_KEY, mmda)`；
- 用应用内的 `DependencyContainer` 提供 `ApiClient` / `MetaUiService`。

组件里取应用：

```ts
import { inject } from 'vue'
import { UI_APP_KEY } from '@mmda/vui'

const app = inject(UI_APP_KEY)!
```

## 鉴权

| 方法 | 作用 |
|---|---|
| `signin` / `signinAuto` | 密码登录 / 本地已存会话恢复 |
| `signout` | 清会话 |
| `canAccess` | 当前是否已认证 |
| `syncAuthState` | 把当前用户写回 localDB / cookie，开新窗口前调用 |

未登录时路由守卫应跳登录页。新窗口打开关联实体前先 `await app.syncAuthState()`，否则子窗口可能读到空会话。

## 与 core DI 的分工

core 的 `createDependencyContainer` 管 **Logic / ApiClient / MetaUiService** 这类跨组件单例。

Vue 的 `provide/inject` 管 **当前屏**：`UI_CONTEXT_KEY` 是这一次打开的 `UiViewContext`，不要把屏级会话放进应用级 DI。

业务 Logic 在启动时 `mmda.di.provide('MaterialsLogic', factory)`，页面按仓库名取出。

## 边界

以下不属于应用壳：

- 一屏字段只读/隐藏：`MetaUiFieldLogic`（core）+ `UiLogic.beforeEdit`；
- 列表查询参数：`UiViewContext.searchParam`；
- 控件怎么画：`UiBuilder` / 皮肤包。

`MmdaApplication` 可以没有 PrimeVue；playground 用 `HtmlUiBuilder` 即可跑通登录以外的拼屏。

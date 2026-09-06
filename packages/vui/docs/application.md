# 应用壳

core **`MmdaApplication`** 是 abstract class（鉴权 / SSO / 模块）。vui **`MmdaVueApp extends MmdaApplication`**：`install`、vue-i18n、overlay、需要追踪的 `state` 字段。

弹层只走 **`app.ui`**（即 `context.uiBuilder`）：`toast` / `confirm` / `dialog`。壳上不再转发这些方法。

```ts
import { MmdaApplication, MmdaVueApp, setupI18n, UI_APP_KEY } from '@mmda/vui'
```

## 启动

```ts
const i18n = setupI18n({ zh, en }, 'zh')
const mmda = new MmdaVueApp(apiUrl, 'base', builder, i18n, {
  clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
  clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET,
})

vueApp.use(i18n)
vueApp.use(mmda)
```

业务读 `app.state.modules` / `app.state.user`。inject 类型用 core `MmdaApplication`。`loginLoading` 不在 `state` 上。

`changeLocale`：Vue 先切 i18n，再 `super.changeLocale`（只动 meta）。401 进 `signinPath`。

弹层用法见 [core UiBuilder](../../core/docs/ui/ui_builder_usage.md)。本轮改名 [refactor_ui_app.md](../../core/docs/refactor_ui_app.md)。


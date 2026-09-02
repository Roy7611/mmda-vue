# mmda

基于元数据驱动架构（Metadata Model Driven Architecture）的前端 monorepo。

## 包

```text
packages/
  core/          @mmda/core          框架无关：元数据、实体、交互接口、HTTP、DI
  vui/           @mmda/vui           Vue 3 运行时
  vui-primevue/  @mmda/vui-primevue  PrimeVue 皮肤
  vui-syncfusion/ @mmda/vui-syncfusion Syncfusion EJ2 Vue 3 皮肤（BASE / MES）
  playground/    vui-agnaive 假数据把玩（仿 app 壳）
  app/           @mmda/app           统一应用壳、Router 与部署入口
  base/          @mmda/base          基础数据业务插件
  mes/           @mmda/mes           制造执行业务插件
```

计划中：`rui`（React 运行时，只依赖 core）。

来源：`D:\vue\mmda-vue`。

## 快速开始

需要 Node.js `>=20.19.0`（Vite 8）、pnpm `>=9`。

```bash
pnpm install
pnpm test
pnpm build
pnpm dev:vui    # playground 假数据（vui-agnaive，http://127.0.0.1:5173/）
pnpm dev:app    # 统一 SPA：http://127.0.0.1:5174/ （/api 由 Vite 代理到 8001）
```

### 统一应用网址（BASE + MES）

现在是单个 SPA。开发直接开 Vite，不必再跑 Node 网关：

```bash
# packages/app/.env 建议：
#   VITE_BASE_API=/api
pnpm dev:app
```

然后打开：

- 入口：http://127.0.0.1:5174/ → `/BASE/`（未登录进 `/Signin`）
- 登录 / 注销：`/Signin`、`/Signout`
- MES：http://127.0.0.1:5174/MES/
- API：`/api` 由 Vite 代理到 `127.0.0.1:8001`

生产反代示例：[`deploy/nginx.mmda.conf`](deploy/nginx.mmda.conf)。`scripts/dev-gateway.mjs` 仅作可选兼容，日常开发不需要。

现在只有一个 Vue 根、一个 Router 和一个 `MmdaApplication`。BASE/MES
以业务插件形式注册路由、API service、Logic 和自定义页面，系统切换使用
客户端路由，不再重新加载 SPA。详见[统一应用壳架构](docs/unified-app.md)。

## 分层

```text
utils / extensions → metaui → models → logic → net / di     (@mmda/core)
                                              ↘
                                          Vue 运行时          (@mmda/vui)
                                              ↘
                                          控件皮肤            (vui-primevue / vui-syncfusion)
```

细节见 [packages/core/README.md](packages/core/README.md)、
[packages/vui/README.md](packages/vui/README.md) 和
[packages/vui-primevue/README.md](packages/vui-primevue/README.md)。

业务应用 `AppShell` 调用 `UiBuilder.buildAppScaffold`，chrome 走 `UiFactory` 和 `--mmda-*` token；
具体皮肤只在 `main.ts` 装配 Builder / Plugin。Syncfusion 的开发期主题别名由
`@mmda/vui-syncfusion/vite` 统一提供。

从旧仓迁过来的设计问题、不兼容点和后续路径见 [REFACTOR.md](REFACTOR.md)。

## 文档

- [重构说明](REFACTOR.md)
- [统一应用壳架构](docs/unified-app.md)
- [core 总览](packages/core/README.md)
- [界面元数据](packages/core/docs/metaui.md)
- [数据模型](packages/core/docs/models.md)
- [前端交互逻辑](packages/core/docs/logic.md)
- [HTTP / OAuth](packages/core/docs/net.md)
- [依赖注入](packages/core/docs/dependency-injection.md)
- [工具函数](packages/core/docs/utils.md)
- [原型扩展](packages/core/docs/extensions.md)
- [vui 总览](packages/vui/README.md)
- [应用壳](packages/vui/docs/application.md)
- [仓库逻辑](packages/vui/docs/logic.md)
- [会话上下文](packages/vui/docs/context.md)
- [Builder 与皮肤](packages/vui/docs/builder.md)
- [列表与过滤](packages/vui/docs/list.md)
- [PrimeVue 4.5 皮肤](packages/vui-primevue/README.md)
- [Syncfusion EJ2 皮肤](packages/vui-syncfusion/README.md)
- [基础数据验证应用](packages/base/README.md)
- [制造执行系统](packages/mes/README.md)
- [同域开发网关](scripts/dev-gateway.mjs)
- [生产 nginx 示例](deploy/nginx.mmda.conf)

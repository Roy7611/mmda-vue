# mmda

基于元数据驱动架构（Metadata Model Driven Architecture）的前端 monorepo。

## 包

```text
packages/
  core/          @mmda/core          框架无关：元数据、实体、交互接口、HTTP、DI
  vui/           @mmda/vui           Vue 3 运行时
  vui-primevue/  @mmda/vui-primevue  PrimeVue 4.5 控件皮肤
  vui-syncfusion/ @mmda/vui-syncfusion Syncfusion EJ2 Vue 3 皮肤
  playground/    假数据对照
  base/          @mmda/base          基础数据人工验证应用（统一网关）
  mes/           @mmda/mes           制造执行系统（统一网关）
```

计划中：`rui`（React 运行时，只依赖 core）。

来源：`D:\vue\mmda-vue`。

## 快速开始

需要 Node.js `>=20.19.0`（Vite 8）、pnpm `>=9`。

```bash
pnpm install
pnpm test
pnpm build
pnpm dev:vui    # playground 假数据（PrimeVue）
pnpm dev:vui:sf # playground 假数据（Syncfusion）
pnpm dev:base   # 基础数据（Syncfusion），需配置 packages/base/.env 的 VITE_BASE_API
pnpm dev:mes    # 制造执行，需配置 packages/mes/.env 的 VITE_BASE_API
```

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

# mmda

基于元数据驱动架构（Metadata Model Driven Architecture）的前端 monorepo。

## 包

```text
packages/
  core/          @mmda/core          框架无关：元数据、实体、交互接口、HTTP、DI
  vui/           @mmda/vui           Vue 3 运行时
  vui-primevue/  @mmda/vui-primevue  PrimeVue 4.5 控件皮肤
  playground/    假数据对照
  base/          @mmda/base          基础数据人工验证应用（统一网关）
```

计划中：`rui`（React 运行时，只依赖 core）。

来源：`D:\vue\mmda-vue`。

## 快速开始

需要 Node.js `>=20.19.0`（Vite 8）、pnpm `>=9`。

```bash
pnpm install
pnpm test
pnpm build
pnpm dev:vui    # playground 假数据
pnpm dev:base   # 基础数据，需配置 packages/base/.env 的 VITE_BASE_API
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
- [Vue 运行时](packages/vui/docs/vui.md)
- [PrimeVue 4.5 皮肤](packages/vui-primevue/README.md)
- [基础数据验证应用](packages/base/README.md)

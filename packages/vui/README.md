# @mmda/vui

Vue 3 运行时：把 `@mmda/core` 的元数据、实体和 `UiContext` 接到 Vue。

**不包含** PrimeVue 控件。包内提供 `HtmlUiBuilder` 作为可运行的零依赖
HTML 皮肤；PrimeVue 4.5 皮肤由 `@mmda/vui-primevue` 实现。

## 已迁入

- 应用壳 `MmdaApplication`（DI、鉴权、locale、弹层转发 Builder）
- `UiLogic` / `beforeEdit` 装配到 `UiViewContext`
- `UiViewContext`：引用字段读写、校验、筛选、主从树、关联选择和子表 CRUD
- `UiBuildContext`：CRUD、动作钩子、路由、附件/模板会话、上传及导入导出调用链
- `AbstractUiBuilder` 默认拼屏、完整动作工厂、`HtmlUiBuilder`
- 登录注册 props、`FileIcons`、`UiSelector`

## 依赖

```text
@mmda/core
    ↑
@mmda/vui          Vue 运行时（本包）
    ↑
@mmda/vui-primevue PrimeVue 4.5 控件皮肤
```

## 开发

```bash
pnpm --filter @mmda/vui test
pnpm --filter @mmda/vui typecheck
pnpm --filter @mmda/vui build
pnpm dev:vui
```

# 实体交互逻辑（vui）

业务怎么写见 core [EntityLogic 用法](../../core/docs/logic/entity_logic_usage.md) 与 [设计](../../core/docs/logic/entity_logic_design.md)。本文只写 **Vue 壳** 多出来的部分。

## 壳里的类

- 业务：`XxxLogic extends EntityLogic`（core）。vui 再导出 `EntityLogic` / `SubEntityLogic` / `EntityLogicInit`。
- 无定制：`GenericEntityLogic.resolve(di, token, defineEntity, init)`（core）。**不要**再引入已删除的 `GenericUiLogic`。
- 搜索表单状态只在 `VuiContext`，Logic 不留 `searchForm`。业务不要继承壳类。

```ts
import { EntityLogic, type EntityLogicInit } from '@mmda/vui'
import { GenericEntityLogic } from '@mmda/core'
```

## 谁 new Logic

[`EntityView`](../src/components/EntityView.ts) 打开仓库页：

1. `app.di.injectAsync('${service}:${repository}Logic')` → 业务 `MaterialLogic`
2. 未注册 → `GenericEntityLogic.resolve(di, token, defineEntity, init)`

`init` 只有 `metaUiService` / `repository` / `module` / `apiService`。`useRouter()` 的结果进 **`VuiContext({ router })`**，不进 Logic。

跨仓库 `context.select({ repository })`、分类树同样：有 DI 用业务类，否则 `GenericEntityLogic`。

## 路由

`context.index()` / `edit` / `details` / `create` 由 core `AbstractUiContext` 的 `routeTo*` 统一实现；`vue-router` 实例在构造 `VuiContext` 时经 `vueRouter` 适配成 core `UiRouter`。动作 `redirectTo` 同样走 `context.navigate` / `router.push`。

## 搜索响应式

列表 `init()`：先 `applyTo` 得到 `customSearchFields`，再 `configureSearch(filters, { customSearchFields })`。

界面用的 `searchParam` 在 Context 上已经 `rx`。业务 Logic 的 `beforeSearch` 返回 `{ fields, groups, customActions, customSearchFields }`。搜索表单状态只在 `VuiContext`，Logic 不留 `searchForm`。

## 国际化

用户可见字符串：`context.t('invalid.required')`。实现是 `VuiContext` 接到应用 i18n。

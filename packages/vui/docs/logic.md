# 实体交互逻辑（vui）

业务怎么写见 core [EntityLogic 用法](../../core/docs/logic/entity_logic_usage.md) 与 [设计](../../core/docs/logic/entity_logic_design.md)。本文只写 **Vue 壳** 多出来的部分。

## 壳里的类

- 业务：`XxxLogic extends EntityLogic`（core）。vui 再导出 `EntityLogic` / `SubEntityLogic` / `EntityLogicInit`。
- 无定制：`new VueEntityLogic(defineEntity, init)`。**不要**再引入已删除的 `GenericUiLogic`。
- `VueEntityLogic` 只覆盖搜索表单 `rx`。业务不要继承它。

```ts
import { EntityLogic, VueEntityLogic, type EntityLogicInit } from '@mmda/vui'
```

## 谁 new Logic

[`EntityView`](../src/components/EntityView.ts) 打开仓库页：

1. `app.di.injectAsync('${service}:${repository}Logic')` → 业务 `MaterialLogic`
2. 未注册 → `new VueEntityLogic(defineEntity, init)`

`init` 只有 `metaUiService` / `repository` / `module` / `apiService`。`useRouter()` 的结果进 **`VueUiContext({ router })`**，不进 Logic。

跨仓库 `context.select({ repository })`、分类树同样：有 DI 用业务类，否则 `VueEntityLogic`。

## 路由

`context.index()` / `edit` / `details` / `create` 在 [`navigate.ts`](../src/contexts/mixins/navigate.ts)，使用 `this.router`（会话上的 vue-router）。动作 `redirectTo` 同样 `context.router.push`。

## 搜索响应式

列表 `init()`：`configureSearch(filters, logic.beforeSearch())`。

界面用的 `searchParam` 在 Context 上已经 `rx`。业务 Logic 的 `beforeSearch` 返回普通对象即可。只有 `VueEntityLogic` 会在 `createSearchForm` 里再 `rx`。

## 国际化

用户可见字符串：`context.t('invalid.required')`。实现是 `VueUiContext` 接到应用 i18n。

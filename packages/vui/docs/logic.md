# 实体交互逻辑

`EntityLogic` 是**实体在 UI 层的交互逻辑**：按视图声明字段/组/动作，并调用 `ApiClient` 做 load/save/search。它绑定该实体的仓库（`repository`，通常为实体模型的复数）和一份 `MetaUi`。

## 主要内容

- `EntityLogic<E>`（`@mmda/core`）：CRUD + 视图钩子装配，**无 Vue**。业务 `XxxLogic extends EntityLogic`。不要叫 `EntityManager` / `RepositoryLogic`。
- `VueEntityLogic<E>`（仅 vui）：搜索表单响应式包装。**业务不要继承**。
- `GenericUiLogic<E>`：无定制时的默认实现（继承 `VueEntityLogic`），通用 CRUD 页和跨服务 `select` 使用。
- `SubEntityLogic<G, P>`（core）：子表 Logic，挂在主表 Logic 上。
- `createRepositoryLogic(repository)`：按仓库名取出 Logic 的工厂函数（名字保留）。
- `beforeIndex` / `beforeDetails` / `beforeEdit` / `beforeSearch`：按视图装配。
- `viewOptions`：按 `UiViewType` 登记拼屏选项。Builder 按 `context.view` 精确查找。
- `beforeSave` / `afterLoad` 等钩子：CRUD 前后拦截。
- 面向用户文案用 `context.t()`（vui 由 `VueUiContext` 实现）。路由在 `VueUiContext.router`，不在 Logic 上。

```ts
import { EntityLogic, GenericUiLogic, type EntityLogicInit } from '@mmda/vui'
import type { UiContext } from '@mmda/core'
```

```ts
export class OrderLogic extends EntityLogic<Order> {
  constructor(init: EntityLogicInit) {
    super(defineOrder, init)
  }
}
```

大型 Logic 按视图拆文件时，调用基类须 `EntityLogic.prototype.beforeIndex.call(this)`。

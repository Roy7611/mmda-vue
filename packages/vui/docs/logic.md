# 仓库逻辑

`UiLogic` 绑定一个仓库（repository）和一份 `MetaUi`。它声明 **这一实体在各视图上的字段/组逻辑**，并调用 `ApiClient` 做 load/save/search。

## 主要内容

- `UiLogic<E>`：主表仓库。
- `GenericUiLogic<E>`：无定制逻辑时的默认实现，通用 CRUD 页和跨服务 `select` 使用。
- `UiGroupLogic<G, P>`：子表仓库，挂在主表 Logic 上。
- `beforeIndex` / `beforeDetails` / `beforeEdit` / `beforeCreate` / `beforeSearch`：按视图装配。
- `beforeSave` / `afterLoad` 等钩子：CRUD 前后拦截。

```ts
import { UiLogic, GenericUiLogic, type UiLogicInit } from '@mmda/vui'
```

## 装配到会话

```text
UiLogic.beforeEdit()
        │  fields / groups / customActions
        ▼
UiViewContext.bindLogics(...)
```

`applyTo(context, view)` 根据 `view` 调用对应 `beforeXxx`，把结果写进当前会话。`UiBuildContext` 构造和 `init()` 时会再调一次，确保 `initMetadata` 之后定制 `field()` / `group()` 能拿到 `metaui`。

## 业务 Logic

```ts
export class MaterialLogic extends UiLogic<Material> {
  constructor(init: UiLogicInit) {
    super(defineMaterial, init)
    this.addRelativeLogic('partNos', (master) => new MaterialPartnerLogic(this, master))
  }

  beforeIndex() {
    const { fields, groups, customActions } = super.beforeIndex()
    if (fields.length === 0) {
      fields.push(
        this.field('status').searchable(true),
        this.field('materialType').searchable(true),
      )
    }
    return { fields, groups, customActions }
  }

  beforeEdit() {
    const { fields, groups, customActions } = super.beforeEdit()
    if (fields.length === 0) {
      fields.push(
        this.field('categoryID').onChange((context, model, newVal) => {
          /* ... */
        }),
      )
    }
    return { fields, groups, customActions }
  }
}
```

`this.field(name)` 返回 core 的 `MetaUiFieldLogic`。hide / lock / validate / customRenderer 都写在 Logic 实例上，不要改共享的 `MetaUiField`。

无定制时：

```ts
mmda.di.provide('NotesLogic', () => new GenericUiLogic(defineNote, init))
```

## 子表 Logic

```ts
class MaterialPartnerLogic extends UiGroupLogic<MaterialPartner, Material> {
  constructor(parent: MaterialLogic, master: Material) {
    super(defineMaterialPartner, parent, master, 'partNos')
  }
}
```

主表 `addRelativeLogic('partNos', factory)` 后，行会话可以通过 `createRelativeLogic` 拿到子表 Logic。子表元数据来自 `group.groupUi`，不是另一次 `getPack`。

## 数据访问

| 方法 | 作用 |
|---|---|
| `getAll` / `search` | 列表；内部走 `ApiClient.searchEntities` |
| `load` / `create` / `save` / `delete` | 单对象 |
| `doAction` | 实体动作（打印、审核等） |
| `initMetadata` | `MetaUiService.getPack` |

列表请求参数是 `EntitySearchParam`，不要在 Logic 里另拼一套 query。见 [列表与过滤](./list.md)。

## 边界

`UiLogic` 不画控件。自定义单元格用 `setCustomRenderer`，返回的是 VNode，真正的 Input/Table 仍由 `fldFactory` 提供。

不要在 Logic 里 `import` PrimeVue。需要皮肤能力时通过 `context.uiBuilder` 或 `context.app.ui`。

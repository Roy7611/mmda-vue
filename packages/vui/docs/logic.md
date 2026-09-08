# 实体交互逻辑

`UiLogic` 是**实体在 UI 层的交互逻辑**：按视图声明字段/组/动作，并调用 `ApiClient` 做 load/save/search。它绑定该实体的仓库（`repository`，通常为实体模型的复数）和一份 `MetaUi`。

## 主要内容

- `EntityLogic<E>`：core 基类，无 Vue 的 ApiClient + MetaModel CRUD。不要叫 `EntityManager` / `RepositoryLogic`。
- `UiLogic<E>`：该实体的交互逻辑（vui，继承 `EntityLogic`）。`repository` 只是 API 路径字符串。
- `GenericUiLogic<E>`：无定制逻辑时的默认实现，通用 CRUD 页和跨服务 `select` 使用。
- `UiGroupLogic<G, P>`：子表 Logic，挂在主表 Logic 上。
- `createRepositoryLogic(repository)`：按仓库名取出 Logic 的工厂函数（名字保留）。
- `beforeIndex` / `beforeDetails` / `beforeEdit` / `beforeCreate` / `beforeSearch`：按视图装配。
- `viewOptions`：按 `UiViewType` 登记拼屏选项。任意 view 都可登记；Builder 按 `context.view` 精确查找，不自动套用别的 view。
- `beforeSave` / `afterLoad` 等钩子：CRUD 前后拦截。

```ts
import { UiLogic, GenericUiLogic, type UiLogicInit } from '@mmda/vui'
import type { UiContext } from '@mmda/core'
```

## 装配到会话

```text
UiLogic.beforeEdit()
        │  fields / groups / customActions
        ▼
VueUiContext.bindLogics(...)
```

`applyTo(context, view)` 根据 `view` 调用对应 `beforeXxx`，把结果写进当前会话。`VueUiContext` 构造和 `init()` 时会再调一次，确保 `initMetadata` 之后定制 `field()` / `group()` 能拿到 `metaUi`。

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

## 拼屏选项

```ts
viewOptions?: Partial<
  Record<
    UiViewType,
    (ctx: UiContext) =>
      | UiListViewPropsType
      | UiTreeListViewPropsType
      | UiGanttViewProps
      | UiViewPropsType
  >
>
```

`viewOptions` **只返回选项**，不 `h()`。业务动作可以 `context.uiBuilder.factory` / `dialog` / `select`。`selectOne` / `selectMany` / `edit` / `details` / `create` 与 `index` 一样允许登记。未登记才走默认表/表单。要共用同一套左树右表，显式登记同一工厂。

```ts
viewOptions = {
  index: () => ({
    viewKind: UiViewManyKind.categoryList,
    foreignKey: 'categoryID',
    showTreeSearchBar: true,
    treeOption: () => ({
      repository: 'MaterialCats',
      loadMode: 'lazy',
      preloader: () => this.preloadCats(),
      editMode: 'contextMenu',
      fields: {
        id: 'categoryID',
        label: 'categoryName',
        parentId: 'parentCatID',
        children: 'children',
        childrenCount: 'childrenCount',
      },
      selectedNode: this.currentCategory,
      footerContent: (cat) => /* 编码 / 名称 / 用途 / 子节点数 */,
      onNodeSelect: (node) => {
        this.currentCategory = node
      },
    }),
  }),
}
```

`treeOption` 是 `UiTreeViewPropsType`（左栏走 `buildTreeView`）。`listOption` 是右表，与纯 list 页相同。`showTreeSearchBar` 在左树右表选项上，内部变成树的 `showSearchBar`。`foreignKey` 是列表外键：点树写入后走 `getAll`，不考虑 `SearchParam`。工具栏模糊搜索和字段过滤清掉此外键，按 `SearchParam` 查全部。折叠不改查询。不要整页重挂树。有 `repository` 时 TreeView 自己向分类 Logic 取数，不要在列表 Logic 里预载整树。

`UiLogic` 不画控件。自定义单元格用 `setCustomRenderer`，返回的是 VNode，真正的 Input/Table 仍由 `fldFactory` 提供。

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
| `getAll` / `search` | 列表；内部走 `ApiClient.searchAll` |
| `load` / `create` / `save` / `delete` | 单对象 |
| `doAction` | 实体动作（打印、审核等） |
| `initMetadata` | `MetaUiService.getPack` |

列表请求参数是 `EntitySearchParam`，不要在 Logic 里另拼一套 query。见 [列表与过滤](./list.md)。

跨仓库 / 跨服务：用 `this.getAllOf` / `this.loadOf` / `this.searchRelative`，或 **`this.apiClient` / `context.apiClient`**（同一实例，带 `repository` / `service`）。通用读写不必在 Logic 再包一层。不要掏 `globalProps.$api`：

```ts
// 不要
await context.globalProps.$api.getOne(id, { repository: 'Orders' })

// 要
await this.load(id)
await context.apiClient.getOne(id, { repository: 'Orders', service: 'mes' })
await this.getAllOf<Order>('Orders', param, { service: 'mes' })
await this.doAction(model, action)
```

`$api` 只是 Vue `globalProperties` 的传递袋，极少用。日常走 `context.apiClient` / `context.uiBuilder` / `context.app`。见 [ARCHITECTURE.md](../../../ARCHITECTURE.md)。

## 边界

不要在 Logic 里 `import` PrimeVue。弹层/Toast 走 `context.uiBuilder`。业务钩子类型是 core `UiContext`，不要写成 vui `VueUiContext` 类。

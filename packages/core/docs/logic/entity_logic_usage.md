# EntityLogic：程序员怎么写

从 `@mmda/core` 或 `@mmda/vui` 导入（vui 再导出 core 的类）。不要 `@mmda/core/src/...`。设计见 [entity_logic_design.md](./entity_logic_design.md)。字段 [field_logic.md](./field_logic.md)。会话 [ui_context_usage.md](./ui_context_usage.md)。弹层 [ui_builder_usage.md](../ui/ui_builder_usage.md)。

## 业务类

```ts
import { EntityLogic, type EntityLogicInit, type UiContext } from '@mmda/core'
import { defineMaterial, type Material } from '../../models/Material'

export class MaterialLogic extends EntityLogic<Material> {
  constructor(init: EntityLogicInit) {
    super(defineMaterial, init)
  }

  beforeEdit() {
    const { fields, groups, customActions } = super.beforeEdit()
    fields.push(
      this.field('code').lockIf((m) => !!m.id),
      this.field('status').refWhere((m, ctx) => /* SQL 片段 */ ''),
    )
    return { fields, groups, customActions }
  }

  beforeSave = async (ctx: UiContext, model: Material) => {
    if (!model.code) {
      await ctx.uiBuilder?.toast(ctx, { message: ctx.t('invalid.required'), severity: 'error' })
      return false
    }
    return true
  }
}
```

- 只认 `UiContext`，不要 `VueUiContext`。
- 文案：`ctx.t(...)`。不要 vui `translateMessage`。
- 跳转：`ctx.index()` / `ctx.edit(row)`。不要 `this.router`。
- 读写：`this.getAll` / `this.load` / `this.save` / `this.apiClient`。不要再包一层 HTTP。

`EntityLogicInit`：`metaUiService`、`repository`、`module?`、`apiService?`、`meta?`。没有 `router`。

DI token 按仓库：`${service}:${repository}Logic`，例如 `base:MaterialsLogic` → 类 `MaterialLogic`。

## 无定制仓库

壳里不要空 `XxxLogic`。vui：

```ts
import { VueEntityLogic } from '@mmda/vui'

new VueEntityLogic(defineNote, init)
```

业务包不要 `extends VueEntityLogic`。

## 子表

```ts
import { SubEntityLogic } from '@mmda/core'

export class MaterialPartnerLogic extends SubEntityLogic<MaterialPartner, Material> {
  constructor(parent: MaterialLogic, master: Material) {
    super(defineMaterialPartner, parent, master, 'partNos')
  }
}

// 主表
this.addRelativeLogic('partNos', (master) => new MaterialPartnerLogic(this, master))
```

`SubEntityLogic` 的 `getAll` / `save` 操作主表内存数组，不是独立 HTTP 仓库。组行为仍用 `this.group('partNos')`（`MetaUiGroupLogic`）。

## 按视图拆文件

大 Logic 用 `viewLogicLoaders`。`create` 加载 `edit`；`selectOne` 默认 `index`。

```ts
export class OrderLogic extends EntityLogic<Order> {
  viewLogicLoaders = {
    index: () => import('./OrderIndexLogic'),
    edit: () => import('./OrderEditLogic'),
  }
}
```

```ts
export function beforeIndex(this: OrderLogic) {
  const result = EntityLogic.prototype.beforeIndex.call(this)
  result.fields.push(this.field('status'))
  return result
}
```

必须 `EntityLogic.prototype.beforeIndex.call(this)`，不能 `this.beforeIndex()`（加载后该方法就是当前函数）。

## 钩子与装配

| 时机 | 方法 |
|---|---|
| 列表 / 编辑 / 详情字段组 | `beforeIndex` / `beforeEdit` / `beforeDetails` |
| 搜索栏 | `beforeSearch`（返回表单描述；vui 会话再 `rx`） |
| CRUD 前后 | `beforeSave` / `afterLoad` / `beforeDelete` … |

`applyTo` 由壳在 `context.init()` 里调用，把 Field/Group Logic 绑进当前会话。不要自己改共享 `MetaUiField`。

## 不要

- `extends VueEntityLogic`（业务）
- `UiLogic` / `UiLogicInit` / `GenericUiLogic` / `UiGroupLogic`
- Logic 里写厂商控件、拼 URL、改元数据 `reference.where`
- `field()` 错误信息走 i18n（那是装配期英文 throw）

# 前端交互逻辑

`logic` 实现一屏界面运行时，依赖 `metaui`、`models`，需要加载数据时也可依赖 `net`。

## 主要内容

- `UiContext`：Logic 与字段回调的统一入口，含 `model` 和字段读写。运行时行为由
  `view` 决定，不再按 Index/Edit/Details 拆接口。
- `MetaUiFieldLogic`：字段只读、隐藏、校验、搜索和自定义渲染。
- `MetaUiGroupLogic`：子表行为、导入导出、聚合和自定义操作。
- `UiValidation` / `validateField`：校验状态和执行。
- `FieldSearchOptions`：关联字段查询、过滤和候选项的操作缓存。

## 按视图拆分 Logic

业务 Logic 较大时，把 Index、Edit、Details 配置放在独立文件，并由
`UiLogic.viewLogicLoaders` 按当前视图动态加载。这样进入列表页不会执行编辑页的
字段校验、自定义渲染和子表配置。这与 Context **类型**无关。

```ts
export class OrderLogic extends UiLogic<Order> {
  viewLogicLoaders = {
    index: () => import('./OrderIndexLogic'),
    edit: () => import('./OrderEditLogic'),
    details: () => import('./OrderDetailsLogic'),
  }
}
```

视图文件导出对应的命名函数。调用基类实现时必须直接调用 prototype，不能调用
`this.beforeIndex()`，因为加载后该方法就是当前函数。

```ts
export function beforeIndex(this: OrderLogic) {
  const result = UiLogic.prototype.beforeIndex.call(this)
  result.fields.push(this.field('status').searchable(true))
  return result
}
```

`create` 复用 `edit`，`selectOne` 默认复用 `index`；`selectMany` 未提供独立实现时
也复用 `index`。小型 Logic 可以继续把 `beforeIndex` / `beforeEdit` 直接写在类中。
回调参数使用 `UiContext`。

## UiContext

`UiContext` 带 `model`。列表、详情、编辑共用这一类型；vui 实现里：

- 索引 / 选择器：`model` 为分页列表，浅响应，不为只读行建上下文
- 详情：浅响应；in-place 编辑的 `setFieldValue` 仍校验并触发 `onChange`
- 编辑：深层绑定、校验、主从 `with()` 树

实体选择 `select()` 属于表单会话；真正打开、关闭弹层是各生态 Application
的公共能力，不属于 core。

```ts
import {
  type FieldSearchOptions,
  type UiContext,
  MetaUiFieldLogic,
} from '@mmda/core'
```

## FieldSearchOptions

它代替旧名 `MetaUiFieldOptions`：

```ts
interface FieldSearchOptions {
  searching?: boolean
  searchParam: EntitySearchParam
  selectOptions: any[]
  cachedSelectOption?: any
  currentSelectOption?: any
  pagination: Pagination
}
```

该对象属于具体会话上下文，不能放回 `MetaUiField`。否则多个界面共享同一份
元数据时，会互相污染搜索词、候选项和分页状态。

关联过滤器同样挂在 `MetaUiFieldLogic.filterFn`（`refFilter`）。`buildSearchFilter`
优先用传入的 `filterFn`，没有时才回退 `reference.filterFn`（旧代码兼容）。

旧实现的 `SearchForRelativeOptions` 暂不作为第三套会话缓存迁入；关联搜索过程
统一先使用 `FieldSearchOptions`。若后续仍需要防抖或请求取消，只扩展该类型。

旧名称 `MetaUiFieldOptions`、`defaultFieldOptions` 和
`isDefaultFieldOptions` 暂时保留为 deprecated 别名。

## 依赖约束

```text
metaui ─┐
        ├─→ logic
models ─┘
```

`metaui` 和 `models` 不反向依赖 `logic`。交互入口是 `logic/ui_logic`。
旧的 `models/validation` 路径仅作兼容转发。

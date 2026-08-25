# 前端交互逻辑

`logic` 实现一屏界面运行时，依赖 `metaui`、`models`，需要加载数据时也可依赖 `net`。

## 主要内容

- `UiContext`：当前模型、元数据、选中项、弹窗、权限和加载入口。
- `MetaUiFieldLogic`：字段只读、隐藏、校验、搜索和自定义渲染。
- `MetaUiGroupLogic`：子表行为、导入导出、聚合和自定义操作。
- `UiValidation` / `validateField`：校验状态和执行。
- `FieldSearchOptions`：关联字段查询、过滤和候选项的操作缓存。

## UiContext

`UiContext` 是单个实体表单的跨生态交互会话约定，不是 Vue 类型：

```text
主表 UiContext
├─ 子表集合 UiContext
└─ 子表行 UiContext（每行一份）
```

每个行上下文独享校验与 `FieldSearchOptions`，通过 `prev` / `root` 回到父级；
字段和组的逻辑定义可以由这些上下文共享。Vue、React 和小程序可使用不同的
响应式机制实现该约定。

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

该对象属于具体 `UiContext`，不能放回 `MetaUiField`。否则多个界面共享同一份
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
旧的 `metaui/metaui_logic`、`logic/metaui_logic`、`models/validation` 路径仅作兼容转发。

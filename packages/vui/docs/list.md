# 列表与过滤

列表页的查询状态只有一份：`UiViewContext.searchParam`（core 的 `EntitySearchParam`）。皮肤负责画出 chips / 搜索框 / 表头菜单，不要自己拼 URL。表格对外接口见 [表格契约](../../vui-syncfusion/docs/sf-grid.md)；Syncfusion 落地见 [SfGrid 设计](../../vui-syncfusion/docs/sf-grid-design.md)。

core 设计与用法：[entity_search.md](../../core/docs/models/entity_search.md) · [entity_query_usage.md](../../core/docs/logic/entity_query_usage.md)

## 主要内容

- `buildListView`：工具栏、搜索栏、表、分页。
- 左树右表是 Builder 组合（`buildTreeListView`），见 [Builder](./builder.md)；树契约见 [树](./tree.md)；Logic 用 `viewOptions` 挂接，见 [仓库逻辑](./logic.md)。
- `UiFilter`：快捷过滤，编译进 `queryParams.filter`（兼容路径）。
- `filterModel`：表头结构化 `EntityFilterModel`。
- `UiSelector`：弹层里选实体，渲染走 `$app.ui.factory`。

```ts
import type { UiListViewPropsType } from '@mmda/vui'
```

## 查询状态

```text
searchParam
├─ pager          页码、页大小、sorts（唯一排序）
├─ searchWord     关键词
├─ queryParams    GET：模块、快捷过滤 SQL（兼容）
└─ filterModel    POST body：表头 / 搜索栏复杂条件
```

`UiBuildContext.search()` 先同步搜索字段和快捷过滤，再 `ApiClient.searchAll()`：没有 `filterModel` 走 GET `getAll`，有则 POST `.../searchAll`。左树右表例外：点树只 `getAll`（类别外键）；右侧模糊搜索和字段过滤清外键后走同一套 `searchAll`。

打开列表时套用 pack 的 `lastQuery`（一整份 `EntityQuery`），否则 `Module.defaultSort`。命名查询芯片来自 `Module.defaultFilter`（`queryID;queryName|…`），不是 FilterModel JSON。

## 工具栏

列表工具栏三部分：

| 位置 | 内容 |
|---|---|
| 左 | 面包屑 |
| 中 | 搜索框、搜索按钮、刷新 |
| 右 | 创建、批量删除（或批量操作菜单）、More |

More 收纳导入、导出、打印和其它低频列表动作。批量模式（`SelectMany` / `EditMany`）只显示取消 / 确认。

关掉工具栏时（`showToolbar: false`）搜索栏仍可单独出现在 header。

## 快捷过滤

`MetaUiFilter` 是纯元数据。vui 的 `UiFilter` 保存当前选中的 condition，编译成 `queryParams.filter`：

- 同一组已选条件 OR，不同组 AND；
- 展示成 SelectButton 还是 MultiSelect 由皮肤决定，core 不声明 chips/tabs。

重置走 `context.resetFilters()`。

## 表头过滤

`filterModel` ↔ `searchParam.filterModel`。皮肤用各自的弹出层和编辑器。应用条件后页码回到 1。表头运算符是 `EntityFilterOperator`（i18n `matcher.${op}`，来自 `getFieldFilterOps`）。不要再依赖 SearchOp。

## 选择与勾选

`EntityView` 默认 Index 为多选（批量删除）。`SelectOne` 为单选。DataTable 的 `selection` 必须用 `context.selectedItems`，变更写回同一数组，避免每轮 render 新建 `ref` 导致递归更新。

## UiSelector

```ts
h(UiSelector, {
  repository: 'Partners',
  service: 'base',
  multiple: true,
  onSelectionChange: (rows) => { /* ... */ },
})
```

内部：`meta.getPack` + `api.searchAll`，列表/分页/搜索框全部 `factory.*`。跨服务选择不要引用对方模型包，`ctor` 可缺省。

表单里 `context.select({ repository, selectionMode, searchParam })` 打开的也是同一套选择会话。选择器里的字段约束同样进 `filterModel`。

## 边界

- 不要在页面组件里维护第二份 `pageNo` / `searchWord`。
- 自定义列表页可以 `props.content` 换掉表格，但仍应复用 `searchParam`。
- `UiSelector` 依赖已注入的 `$app`（`MmdaApplication`），不能在没有 Application 的环境单独挂。
- 持久化列表布局时把 `lastQuery: toEntityQuery(searchParam)` 一并写入 pack，不要单存 sorts。

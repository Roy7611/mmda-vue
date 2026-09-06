# 列表与过滤

列表页的查询状态只有一份：`UiViewContext.searchParam`（core 的 `EntitySearchParam`）。对外契约叫 **list**（`ui/factory/list.ts`、`buildListView`）；桌面子表走 **table**（`factory.table`）；皮肤实现用 **grid**（`SfGrid` / `AgGrid`）。命名见仓库 [list、table、grid](../../docs/naming.md#listtablegrid)。皮肤负责画出 chips / 搜索框 / 表头菜单，不要自己拼 URL。表格能力见 [表格契约](../../vui-syncfusion/docs/sf-grid.md)；Syncfusion 落地见 [SfGrid 设计](../../vui-syncfusion/docs/sf-grid-design.md)。

core 设计与用法：[entity_search.md](../../core/docs/models/entity_search.md) · [entity_query_usage.md](../../core/docs/logic/entity_query_usage.md) · [date_filter_usage.md](../../core/docs/logic/date_filter_usage.md)

## 主要内容

- `buildListView`（`ui/builder/list.ts`）：工具栏、搜索栏、表、分页；表本身由 `factory.table` 生产皮肤组件。
- 左树右表是 Builder 组合（`buildTreeListView`），见 [Builder](./builder.md)；树契约见 [树](./tree.md)；Logic 用 `viewOptions` 挂接，见 [实体交互逻辑](./logic.md)。
- `UiFilter`：快捷过滤，编译进 `queryParams.filter`（兼容路径）。
- `filterModel`：表头结构化 `EntityFilterModel`。
- 实体选择：`context.select(field)` 或 `select({ repository })`；视图仍是 `selectOne` / `selectMany`。不要独立 `UiSelector`，不要 `buildSearchForRelativeContent`。

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

日期列（agnaive）是 **multi 两页**，不要第三套下拉：

| 页 | 控件 | 写出 |
|---|---|---|
| 条件 | Date Filter：比较 + `dateRange.*` 语义（本月、今天…） | `date` + `dateKind`，或两段 `join` |
| 列表 | Set Filter `treeList`，选项 `getPivotDates` | `set` 周期 token（`YYYY` / `YYYY-MM` / `YYYY-MM-DD`） |

选「本月」走条件页 kind，POST 原样带 `dateKind`。勾树上的「2026年9月」是绝对九月。`loadPivotDates` 默认 `logic.getPivotDates`。设计与写法：[date_filter.md](../../core/docs/models/date_filter.md) · [date_filter_usage.md](../../core/docs/logic/date_filter_usage.md)。

## 远程排序 / 过滤（皮肤契约）

三套皮肤共用 vui `UiListProps`：`onSort` / `onFilterModelChange` / `searchRelative` / `scene`。

1. 只改 `searchParam`（`pager.sorts` + `filterModel`），不要另存一套表格 state。
2. 回调必须 **return** `search()` 的 Promise。
3. 需要回写 `dataSource` 的皮肤（Syncfusion custom binding）等 Promise 完成后再写。

Builder 已用 `writeListSorts` / `writeListFilterModel`。Prime / Naive 的表格事件同样 `return` 该 Promise，不要只在 SF 里等。

## 选择与勾选

`EntityView` 默认 Index 为多选（批量删除）。`SelectOne` 为单选。DataTable 的 `selection` 必须用 `context.selectedItems`，变更写回同一数组，避免每轮 render 新建 `ref` 导致递归更新。

## 实体选择（特殊 Index）

表单弹层：`context.select({ repository, selectionMode, searchParam })` → `UiBuildContext` + Logic + `buildListView`。

路由选择：`EntityView` 认 `?view=selectOne|selectMany`，复用 `beforeIndex`，弹层里允许创建。

关联字段远程联想：`context.searchRelative(field, searchWord)` → Logic `searchRelative`；范围 SQL 用 `reference.where` + Logic `refWhere`（`queryParams.filter`），关键字用 `searchWord`。列筛 hasOne 直接调同一路径（列表 prop `searchRelative`）。

## 边界

- 不要在页面组件里维护第二份 `pageNo` / `searchWord`。
- 自定义列表页可以 `props.content` 换掉表格，但仍应复用 `searchParam`。
- 不要新增独立 Selector 组件旁路；选择一律走 Index / `select()`。
- 持久化列表布局时把 `lastQuery: toEntityQuery(searchParam)` 一并写入 pack，不要单存 sorts。

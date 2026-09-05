# 表格使用说明（通用契约）

本文是 **vui Grid 的对外接口**：`scene`、`metaui`、`dataSource`、开关、回调、Logic 钩子。**不出现任何厂商类型、模块名或列配置对象。** Syncfusion 的 `SfGrid` 与日后 AgGrid 包装层实现 **同一套 props / 事件 / 方法**；Builder 只调 `factory.grid`。

- **本包皮肤：** [`SfGrid.ts`](../src/components/SfGrid.ts)。列映射、控件模块是皮肤内部，业务不要 import。
- **实现笔记（本皮肤）** 见 [sf-grid-design.md](./sf-grid-design.md)。现网仍走 `factory.table`；日后 `factory.grid` 接线。

表格 **不持有** `UiContext`。传入行对象 + 回调。查询见 vui [列表与过滤](../../vui/docs/list.md)。enum / ref / hasOne 只走 `valueOf` / `labelOf`。

**TreeGrid：** 树表只 **复用列映射**（MetaUiField → 该皮肤的列配置），不要把表格 Vue 组件嵌进树表。树列缩进由树表自己叠。

## 何时用

| 场景 | `scene` | `dataSource` |
|---|---|---|
| 列表页 | `'index'` | 当前业务页（外挂分页） |
| 选记录弹窗 | `'selector'` | 同 index |
| 编辑页子表 | `'edit'` | `EntityArray`（本地） |
| 详情页子表 | `'details'` | 同 edit，只读 |

不要把 `UiContext` 塞进 `dataSource`。`allowPaging` 表示 **外挂业务分页**（`searchParam.pager`），不是控件自带页脚翻页。

## 最小用法

下列示例用本包组件名 `SfGrid` / `SfGridLayout`。其它皮肤换组件名即可，**props 不变**。

```ts
import { h, ref } from 'vue'
import { SfGrid, SfGridLayout } from '@mmda/vui-syncfusion'
import type { EntityFilterModel, Sort } from '@mmda/core'

h(SfGrid, {
  scene: 'index',
  metaui,
  dataSource: rows,
  height: 480, // 必须静态高度（或父级静态高 + '100%'），否则 virt 无效
  filterModel: searchParam.filterModel,
  onFilterModelChange: (model: EntityFilterModel) => {
    searchParam.filterModel = Object.keys(model).length ? model : undefined
    searchParam.pager.pageNo = 1
    return search()
  },
  onSort: (sorts: Sort[]) => {
    searchParam.pager.sorts = sorts
    searchParam.pager.pageNo = 1
    return search()
  },
  onSelect: (selection) => {
    context.selectedItems = selection
  },
  rowActions: extraBusinessActions,
})
```

子表（闭包整表 `groupCtx`，不要给每行预建 context）：

```ts
const groupCtx = page.subGroupContext(group)
const rows = page.model[group.groupName] ?? []

h(SfGrid, {
  scene: page.editing ? 'edit' : 'details',
  metaui: group.groupUi,
  dataSource: rows,
  height: 360,
  canEditCell: (row, field) => {
    const rowCtx = groupCtx.with(row)
    return row.editable !== false && !rowCtx.isFieldReadonly(field)
  },
  onCellSave: (row, field, value) => {
    groupCtx.with(row).setFieldValue(field, value)
  },
  onDelete: (row) => page.deleteSubGroupItem(group, row),
  onAdd: () => page.addSubGroupItem(group),
  onOpenEditor: (row) => page.subGroupItem(group, row),
})
```

布局 / 自动列宽：**表格上不放按钮**。表格始终允许拖列和 `autoFitColumns()`；要不要「表格设置」，只看有没有挂布局伴侣、工具栏有没有 `open`。

```ts
const gridRef = ref<InstanceType<typeof SfGrid>>()
const layoutRef = ref<InstanceType<typeof SfGridLayout>>()

h(SfGrid, { ref: gridRef, scene: 'index', metaui, dataSource: rows, height: 480 })
h(SfGridLayout, { ref: layoutRef })

layoutRef.value?.open(metaui)
gridRef.value?.autoFitColumns()
```

没有 `layoutEnabled` / `autoFitEnabled`。也**不必传 `layoutRev`**：那是旧 `factory.table` 用组件 key 逼表格重建列的版本号；新表格内部 watch `listed` / `frozen` / `listPos`（或 Layout 确认后重建）。

## 配置：`scene` 默认值

显式 props **覆盖** scene 默认。四种 scene 都默认可调列宽、可换列序。列显隐走伴侣 Layout，不走各厂商自带的列选择器。

| | index | selector | edit | details |
|---|---|---|---|---|
| 就地编辑 | 关 | 关 | 开（单元格就地编） | 关 |
| 分页 | 外挂；`allowPaging` 开 | 同左 | `allowPaging` 关 | 关 |
| 虚拟滚动 | `enableVirtualization` 开 | 同左 | 关 | 关 |
| 排序 | `allowSorting` 开（服务端） | 同左 | 关 | 开（客户端） |
| 过滤 | `allowFiltering` 开（服务端） | 同左 | 关 | 关 |
| 选择 | 单行 | `multiple`（可改 `single`） | 单元格 | 默认无 |
| 操作列 | 右冻结：内置 CRUD + `rowActions` 业务项 | 同 index，可关 | 右冻结，默认删除 | 无 |
| `persistLayout` | 开（拖列写 MetaUi） | 开 | **关**（拖列不写） | 开 |
| `persistFilter` / `persistSort` | 开 | 开 | 无 | 排序不回写 |
| 合计 footer | 关 | 关 | 子表 `aggregates` | 同 edit；有 `defaultGroupBy` 则分组 |

自动列宽四种 scene 点一下都写 `listSize`，不跟 edit 的 `persistLayout: false`。

## 分页 / 虚拟滚动 / 排序 / 过滤：都有开关

`scene` 只给默认值，四个能力都可以用 props **打开或关掉**。列能否排序还跟 `field.sortable`。

| 能力 | Prop | index / selector | edit | details | 关掉之后 |
|---|---|---|---|---|---|
| 分页 | `allowPaging` | **开** | 关 | 关 | 不要外挂 Pager；`dataSource` 当全量 |
| 虚拟滚动 | `enableVirtualization` | **开** | 关 | 关 | 普通滚动；行少或就地编时保持关 |
| 排序 | `allowSorting` | **开**（服务端） | 关 | **开**（客户端） | 列头不能点排；列还跟 `field.sortable` |
| 多列排序 | `allowMultiSorting` | 开（Ctrl+点列头） | 同 `allowSorting` | 同左 | 只能单列 |
| 过滤 | `allowFiltering` | **开**（服务端） | 关 | 关 | 列头无过滤 |

```ts
// 覆盖 scene：例如 details 关掉排序；edit 临时开客户端过滤
h(SfGrid, {
  scene: 'details',
  allowSorting: false,
})

h(SfGrid, {
  scene: 'edit',
  allowFiltering: true,
  allowSorting: true, // edit 默认关；打开后是客户端排，仍不分页、不 virt
})
```

含义：

- **`allowPaging`**：业务分页，**外挂分页器**（`searchParam.pager`）。index 开分页时 `dataSource` 只有当前页。皮肤 **不要**再用控件内置分页去切这一页（与行虚拟滚动冲突）。
- **`enableVirtualization`**：行虚拟滚动（列多再开 `enableColumnVirtualization`）。须静态 `height`。与单元格选择、lazy 主从不兼容，故 edit 默认关。`scrollMode: 'infinite'` 与行虚拟滚动互斥。
- **`allowSorting`**：列头排序总开关。index/selector 只发 `onSort(sorts)` → 写入 `pager.sorts` 再查，**禁止**对本页再排一遍。details 才是控件本地排。edit 默认关（保持录入顺序）；需要时再开，也是客户端。单列还看 `field.sortable`。
- **`allowMultiSorting`**：默认 `true`。单击改一列；**Ctrl+点列头** 追加/切换 ASC/DESC。写出框架的 `{ sortBy, sortOrder }[]`。
- **`allowFiltering`**：列头过滤（文本 / 数字 / 日期 / 集合）。index/selector 发 `onFilterModelChange` → `filterModel` 再查。edit 若打开则滤本地 `EntityArray`。

`persistSort` / `persistFilter` 是「当前排/滤要不要写回 MetaUi」，只有 index/selector 有意义。和「能不能点列头」不是一回事。

## 自定义列渲染

默认：皮肤按 `MetaUi` listed 字段生成列（显示 `labelOf`、格式化、对齐）。**index 大数据不要给数据列挂 Vue 单元格模板**，否则虚拟滚动失效。

业务侧用框架 Logic：

```ts
this.field('status').setCustomCellRenderer((field, ctx, props) =>
  h('span', row.overdue ? `⚠ ${display}` : display),
)
```

显示侧继续用 **`setCustomCellRenderer`**（与表单格子同一钩子族；大表慎用 Vue 模板）。不要再引入已删除的 `GridCell*` / `setGridCellRenderer`。

表格 **不持有 Context**，读不到 Logic。可选 prop **`customCellRenderers`**：给 **Builder / factory** 把函数灌进列。有 Logic 就别在页面再写一遍。

函数里 **不要** `with(row)`。引用列不要猜字段、不要做成厂商外键列。

## 自定义单元格编辑器

默认按字段类型就地编（仅 `scene === 'edit'` 真正进格）：enum/ref/hasOne 下拉（`valueOf`/`labelOf`）；布尔勾选；日期/日期时间；数值；其它文本。主键列不可改。各皮肤自己映射到内部编辑器，**业务 API 不出现厂商列编辑配置**。

### 框架接口（必须适配）

业务侧只认 Logic：

```ts
// 轻量表格就地编（推荐）
this.field('colorCode').setCustomCellEditor((field, ctx, props) =>
  h(MyColorPicker, { ... }),
)

// 表单 / 对话框编辑器；表格无 customCellEditor 时回退到它
this.field('colorCode').setCustomEditor((field, ctx, props) =>
  h(MyColorPicker, { ... }),
)
```

| API | 用途 |
|---|---|
| `fieldLogic.setCustomCellEditor(Function)` | **轻量表格单元格编辑器**。`tableCell` 优先用它 |
| `fieldLogic.setCustomEditor(UiFieldRenderer)` | **表单 / 对话框**编辑器；表格无 `customCellEditor` 时回退 |
| `customCellEditors` | 可选。Builder 把函数灌进列。有 Logic 时页面不必传 |

**任何皮肤的 `factory.grid` 都必须适配 `setCustomCellEditor`（并回退 `setCustomEditor`）：** edit 进格时优先 `customCellEditor`，否则 `customEditor`（进格 `groupCtx.with(row)`，离格 `release`）；都没有则用默认类型。不要让业务写各厂商的 cell editor 生命周期。

`index` 默认不可编。edit 行少、通常无行虚拟滚动，才适合 Vue 编辑器进格。

能不能进格：`metaui` + `canEditCell`。行 `editable === false` 整行不能编。

## 行操作：内置 CRUD、业务 `rowActions`、右键

右冻结 **操作列**（不是行内保存/取消）。

**标准 CRUD 由表格自己提供**，不要写进 `rowActions`：详情、打开编辑器对话框（`onOpenEditor`）、删除（`onDelete`）、子表新增（`onAdd`）。是否出现看 scene 和该行 `editable` / `deletable`。

**Excel 导出不进操作列、不进行右键。** index 导出走页面外挂；子表才可能调 `exportExcel()`（导出当前内存行）。

| Prop | 说明 |
|---|---|
| `showActionColumn` | 操作列开关。index/selector 默认开；edit 默认开（至少删除）；details 默认关 |
| `rowActions` | `UiAction[]`。**只放额外业务操作**。用框架的 `visible` / `canDo`（`Predicate`）判断这一行有没有、能不能点。声明一次，Grid 对每行求值 |
| `allowContextMenu` | **右键开关**。开则弹出**全部**：内置 CRUD + `rowActions`。index 默认开；selector 仅选择时关；edit/details 默认关，可开 |

```ts
import type { Predicate } from '@mmda/core'
import type { UiAction } from '@mmda/vui'

const isDraft: Predicate = (row) => row.status === 'draft'

const rowActions: UiAction[] = [
  {
    name: 'submit',
    label: t('action.submit'),
    visible: isDraft,                          // 没有这项
    canDo: (row) => row.editable !== false,    // 有但不可点
    onAction: () => { /* 点击时 Grid 带上当前行 */ },
  },
  {
    name: 'print',
    label: t('action.print'),
    visible: (row) => row.id != null,
  },
]

h(SfGrid, {
  scene: 'index',
  metaui,
  dataSource: rows,
  height: 480,
  rowActions,
  allowContextMenu: true,
})
```

皮肤用 `isActionVisible(action, row)` / `isActionEnabled(action, row)`。不要在 Predicate 里 `with(row)`。

模块权限里的 `ModuleAction.executableExpression`（如 `editable && !closed`、`status=='draft'`）在 **建成 UiAction 时** 解析成 `canDo`。`EntityAction` 是服务端元数据，**不要**加 `canDo`。手写 `rowActions` 可以直接给 `canDo` Predicate。

edit 不要靠操作列进就地编，仍点单元格。打开实体编辑对话框走 `onOpenEditor`。

selector 只做选择时：`showActionColumn: false`，`allowContextMenu: false`，不传 `rowActions`。

## Props

### 必填

| Prop | 类型 | 说明 |
|---|---|---|
| `scene` | `'index' \| 'selector' \| 'edit' \| 'details'` | 只改默认开关 |
| `metaui` | `MetaUi` | 列来自 `getListedFields()` |
| `dataSource` | `object[]` | **行对象**。index = 当前页；子表 = EntityArray |

### 外观与滚动

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `height` | `string \| number` | — | index/selector **必须**静态高度 |
| `rowHeight` | `number` | `36` | 行高一致，不要换行 |
| `scrollMode` | `'virtual' \| 'infinite'` | `'virtual'` | 仅 virt 开时有意义；infinite 与 row virt 互斥 |
| `enableVirtualization` | `boolean` | **scene 开关**，见上表 | 覆盖默认 |
| `enableColumnVirtualization` | `boolean` | 列多时再开 | 须先开行 virt；列宽必须 px |
| `enableHover` | `boolean` | index 为 `false` | 大表关掉行 hover 减开销 |

### 选择

| Prop | 类型 | 说明 |
|---|---|---|
| `selectionMode` | `'single' \| 'multiple'` | selector 默认 `multiple`；index 固定单行 |
| `allowSelection` | `boolean` | details 默认 `false` |
| `selectedItems` | `T[]` | 绑定会话数组，**不要**每次 `ref([])` |

### 排序 / 过滤

| Prop | 类型 | 说明 |
|---|---|---|
| `allowPaging` | `boolean` | **开关**。开 = 外挂业务分页 |
| `allowSorting` | `boolean` | **开关**。列还跟 `field.sortable` |
| `allowMultiSorting` | `boolean` | **开关**。默认 `true`：Ctrl+点列头多列 |
| `allowFiltering` | `boolean` | **开关**。列头过滤，模型为 `EntityFilterModel` |
| `filterModel` | `EntityFilterModel` | 框架共用模型（各皮肤双向映射） |
| `loadFilterOptions` | `(field) => Promise<unknown[]>` | 引用列打开筛选项 |
| `persistSort` | `boolean` | 仅 index/selector；排序条件是否写回 MetaUi（默认开） |
| `persistFilter` | `boolean` | 仅 index/selector；过滤条件是否写回 MetaUi（默认开） |

index/selector：**禁止**让表格只对当前页再滤/再排。改条件后换 `dataSource`。

### 编辑

| Prop | 类型 | 说明 |
|---|---|---|
| `editable` | `boolean` | edit 默认 true |
| `inplaceEditStart` | `'excel' \| 'click' \| 'dblclick'` | 默认 `excel`（点选后键入即改，像电子表） |
| `canEditCell` | `(row, field) => boolean` | 行级 / Logic 闸门。**仅此回调**里 `with(row)` |
| `customCellEditors` | `Record<string, Function>` | Builder 从 `setCustomCellEditor` 灌入 |
| `confirmDelete` | `boolean` | 删前确认 |

### 自定义渲染 / 操作列

| Prop | 类型 | 说明 |
|---|---|---|
| `customCellRenderers` | `Record<string, Function>` | Builder 从 Logic 灌入；业务请用 `setCustomCellRenderer` |
| `showActionColumn` | `boolean` | 操作列开关 |
| `rowActions` | `UiAction[]` | 额外业务操作；`visible` / `canDo` 按行求值 |
| `allowContextMenu` | `boolean` | 行右键开关；开则 CRUD + `rowActions` 全部弹出 |

### 布局

| Prop | 类型 | 说明 |
|---|---|---|
| `persistLayout` | `boolean` | 拖列宽/换列序是否写 `listSize`/`listPos`。edit 默认 false |

Layout **不含**过滤/排序。写回只有 `listSize` / `listPos` / `listed` / `frozen`。不要传 `layoutEnabled`、`autoFitEnabled`、`layoutRev`。

### 其它

| Prop | 类型 | 说明 |
|---|---|---|
| `hierarchyMode` | `'default' \| 'lazy' \| 'eager'` | **仅 index**，第一个 `many` 子表。lazy 关 virt |
| `locale` | `string` | 跟随 vui i18n；皮肤映射到控件文化包 |

## 事件

| 事件 | 签名 | 调用方做什么 |
|---|---|---|
| `onFilterModelChange` | `(model: EntityFilterModel) => void \| Promise` | index：写入 `filterModel`，`pageNo=1`，`search()` |
| `onSort` | `(sorts: Sort[]) => void \| Promise` | index：写入 `pager.sorts`，再查 |
| `onSelect` | `(selection: T[]) => void` | `context.selectedItems` |
| `onCellSave` | `(row, field, value, previous?) => boolean \| void` | `with(row).setFieldValue`；`false` 则取消离格 |
| `onAdd` | `() => void` | 末尾 `addSubGroupItem` |
| `onDelete` | `(row) => void` | `EntityArray.deleteItem` |
| `onOpenEditor` | `(row) => void` | 打开实体编辑对话框（`subGroupItem`） |
| `onAction` | `(action, row) => void` | `rowActions` 里未自带 `onAction` 的项 |
| `onAggregatesChange` | `(values) => void` | `SUM(x)=>masterField` 写主表 |

`Sort`：`{ sortBy, sortOrder }`，`ASC` \| `DESC`。

## 实例方法

| 方法 | 说明 |
|---|---|
| `autoFitColumns(fieldNames?: string[])` | 解析 `180px` 写回 `listSize`。不要每次绑定后自动跑 |
| `refresh()` | 少用。改一行优先刷该行 |
| `exportExcel()` | 仅导出 **当前 `dataSource`**（子表）。**index 不要用**（只有当前页） |

## 表格布局伴侣

不是表格内部模块。不挂这个伴侣 = 用户没有列显隐对话框；表格本身仍可拖列宽/列序。本包为 `SfGridLayout`；其它皮肤用等价组件、**同一套 `open(metaui)`**。

```ts
layout.open(metaui) // 确认后写 listed、frozen、listPos；Grid 内部重建列
```

对齐 vui `ListSettingView`：拖排序、显隐、左右冻结、永久保存、恢复默认。四种 scene 都由**页面菜单**打开。

## 程序员注意

1. **index 必须静态 `height` + 当前页 `dataSource`。** 虚拟滚动的缓冲行数不是业务 pageSize。
2. **Context：** index/selector/details 渲染禁止 `with(row)`。edit 只在 `canEditCell` / `onCellSave` / 删行里 `with`。对话框用 `subGroupItemContext`。
3. **自定义单元格：** 列表显示用 `setCustomCellRenderer`；Vue 显示模板会打 virt。就地编优先 `setCustomCellEditor`，可回退 `setCustomEditor`。
4. **过滤**是 `EntityFilterModel`，不是各厂商内部 filter 对象。
5. **合计：** index 不要用本页 footer 冒充全库 `aggregationSet`。子表用 `EntityArray.sum/count`。
6. **导出：** index 走 Java `searchAll` 同条件流式导出。不要为了导出把全量行塞进表格。
7. **插入行**未做；edit 只末尾追加，故默认不排序。
8. **皮肤职责：** 把本文 props / 事件 / 方法映射到具体控件；业务与 Builder 只依赖本文，不出现厂商类型名。

## 本包实现备注（非契约）

仅 Syncfusion 皮肤内部约束，AgGrid 包装不必照搬：

- index 行虚拟滚动需要静态 `height`；缓冲行数不是业务 `pageSize`。
- 列工厂、控件 culture 包、TreeGrid 依赖 Grid 列映射，均不导出给业务。

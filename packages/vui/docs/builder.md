# Builder 与皮肤

`UiBuilder` 负责 **怎么把会话画成 VNode**。vui 定义契约和默认拼屏；具体按钮、表格、输入框由皮肤实现。

## 主要内容

- `UiBuilder`：拼屏接口。
- `AbstractUiBuilder`：列表页/详情页默认结构、动作工厂、单元格解析。
- `UiFactory` / `UiFieldFactory`：原子控件（button、table、textInput…），含 `menu` / `dialog` / `drawer`。
- `UiOverlay`：命令式 toast / confirm / dialog；皮肤提供 `overlayHost`，`MmdaApplication.install` 自动挂载。
- `UiLayout`：行列栅格，与控件库无关。
- `UiAction` / `UiActionFactory`：刷新、创建、保存、导入导出等。

```ts
import { AbstractUiBuilder, type UiFactory } from '@mmda/vui'
```

## 依赖方向

```text
页面  →  context.ui.build(ctx) / buildListView / buildView
              ↓
       AbstractUiBuilder（结构）
              ↓
       UiFactory / UiFieldFactory（控件）+ UiOverlay
              ↓
       PrimeVueUiBuilder / SyncfusionUiBuilder / AgNaiveUiBuilder
```

Factory 用短名（`list`、`tree`、`ganttChart`）。Builder 组合用 `XxxView`（`listView`、`treeView`、`treeListView`、`ganttView`）。`treelist` 不是皮肤控件，没有 `factory.treelist`。

`build(ctx, extra?)` 读 `ctx.logic.viewOptions[ctx.view](ctx)`（精确 key，不走 `resolveLogicView`），再按返回的 `viewKind` 分发。未登记则 many → `buildListView`，one → `buildView`。

| viewKind | Builder |
|---|---|
| `list` 或未设 | `buildListView` |
| `categoryList` | `buildTreeListView`（左 `buildTreeView` + 右表） |
| `treeGrid` | `buildTreeGridView`（树形表格，见 [treegrid.md](./treegrid.md)） |
| `gantt` | `buildGanttView` |
| `scheduler` | 后做 |

`UiTreeListViewProps` 三块分开：`treeOption`（左树，`UiTreeViewPropsType` 或工厂）、`listOption`（右表，与 `buildListView` 同一套）、`foreignKey`（列表外键，对应 `treeOption.fields.id`）。左栏走 `buildTreeView`：默认打开树顶搜索和树底栏。点树按 `foreignKey` 走 `getAll`，不考虑 `SearchParam`。工具栏模糊搜索和字段过滤清掉类别外键，按 `SearchParam` 查全部：有关键词走 GET `getAll`，有字段过滤才 POST `searchAll`。折叠只改布局，不听、不改查询。左栏 `collapsible: true`，折叠用皮肤 Splitter 的 `paneSettings`（[SF expand-collapse](https://ej2.syncfusion.com/vue/documentation/splitter/expand-collapse)）。

`UiSplitterPane` 对齐 SF `paneSettings`：`size` / `min` / `max` / `collapsible` / `collapsed` / `resizable` / `cssClass`。

vui **不** import `primevue/*` 或 `@syncfusion/*`。皮肤包实现 `UiFactory` 与 `UiOverlay`。

## 拼屏入口

| 方法 | 用途 |
|---|---|
| `build` | 按 `viewOptions` + `viewKind` 分发整页 |
| `buildListView` | 列表：工具栏 + 搜索 + 表 + 分页 |
| `buildTree` | 薄包 `factory.tree` |
| `buildTreeView` | 顶栏（`header()` 或 `factory.input`）+ `factory.tree` + 底栏 |
| `buildTreeListView` | 工具栏 + `factory.splitter`（左树右表）+ 分页 |
| `buildGanttView` | 甘特（皮肤实现） |
| `buildView` | 单对象：工具栏 + 分组表单 |
| `buildTable` / `buildList` | 只有数据区 |
| `buildBpmnDiagram` | BPMN 图（Prime 用 bpmn-js；Syncfusion 用 EJ2 Diagram） |

列表工具栏分三截：左面包屑，中搜索+刷新，右主操作；导入/导出/打印收进 More。详见 [列表与过滤](./list.md)。

## 字段渲染

```text
buildField
  ├─ editing → fldFactory[field.editor] / fallbackInput
  └─ display → fldFactory[field.renderer] / fallbackDisplay

表格单元格
  ├─ 主表 linkable → factory.link（进详情）
  └─ 其余 → tableCell → renderer（HAS_ONE 常用 externalLink）
```

`customRenderer` / `customCellRenderer` / `customEditor` / `customCellEditor` 在 Field Logic 上覆盖默认映射。

表格级 props（`rowStyle`、`selectionMode`、`renderCell`…）必须经 `cleanTableCellProps` 滤掉，禁止透传到单元格 DOM。

## 皮肤要实现什么

`UiFactory` 至少覆盖：

- 布局：`layout.row` / `column` / `cell`
- 动作：`button`、`badge`、`actionButton`、`menu`、`panelMenu`、`menubar`、`buttonGroup`
- 列表：`table`、`treeGrid`、`list`、`paginator`
- chrome：`dialog`、`drawer`、`searchForRelative`
- 弹层：`UiOverlay`（toast / confirm / `dialog` 队列）；不要把 toast 写进 Factory

`UiFieldFactory` 用字段 `editor` / `renderer` 名做索引（`textInput`、`dropdown`、`HasOneText`…）。PrimeVue / Syncfusion / Naive 皮肤映射到各自控件。

vui **不**提供默认 HTML 皮肤或 `HtmlUiBuilder`。页面和 Logic 只依赖 `UiBuilder` / `UiFactory`；换皮肤不用改页面。

## 边界

- 应用 `AppShell` 直接调用 `builder.buildAppScaffold` / `buildAppSideBar`；不要再包一层皮肤壳组件。
- 侧栏菜单：Syncfusion 用自己的 Sidebar + Accordion：顶层 `moduleCode` 不含 `.`（如 `B`、`M`）时左侧系统轨切换一级，右侧 Accordion 展二/三级；否则只渲染 Accordion。无控件库皮肤用 `@mmda/vui` 的 `AppSideMenu`。
- 应用自定义 chrome 走 `UiFactory`，样式使用 `--mmda-*` token。
- 暗色模式调用 `builder.setColorScheme()`，不要在应用里直接写 `p-dark` / `e-dark`。
- 皮肤可以读 `context`，不要在 factory 里 `new UiViewContext`。
- DataTable 的 `selection` 必须绑定会话的 `selectedItems`，不要在每次 `table()` 里 `ref([])`。
- `rowStyle` 对可见行返回 `undefined`，不要每次 `return {}`。

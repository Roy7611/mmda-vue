# Builder 与皮肤

`UiBuilder` 是 core 契约，负责 **怎么把会话画成节点**。vui 里一定是 **`VueUiBuilder`**：抽象类，用模板方法填好共用拼屏；皮肤包再具体扩展和落地。不要再叫 `AbstractUiBuilder`，不要另造 `VueUiBuilderHost`。

```text
UiBuilder              core 契约（框架无关）
    ↑ implements
VueUiBuilder           vui 抽象类：模板方法填共用拼屏（取代 AbstractUiBuilder）
    ↑ extends
SyncfusionUiBuilder / PrimeVueUiBuilder / …
                       皮肤：控件与壳的具体落地
```

| 名字 | 包 | 干什么 |
|---|---|---|
| `UiBuilder<TNode>` | `@mmda/core` | 接口。Logic / `context.uiBuilder` 只认这个 |
| `VueUiBuilder` | `@mmda/vui` | `implements UiBuilder<VNode>`。`build()` 分发、列表/表单/树共用结构、`UiActionFactory`。注入 `UI_BUILDER_KEY` 的类型 |
| `SyncfusionUiBuilder` 等 | `@mmda/vui-*` | `extends VueUiBuilder`。壳、overlay、factory 接到厂商控件 |

产品分层真源：[ARCHITECTURE.md](../../../ARCHITECTURE.md)。

元数据驱动的 UI 构造是三层，不要把皮肤控件写进 vui：

```text
MetaUi + Logic
      ↓
UiViewContext（会话）
      ↓
VueUiBuilder（拼复杂视图）
      ↓
UiFactory 契约  →  皮肤 factory（生产控件）
      ↓
皮肤 components（SfGrid / AgGrid / NaiveTree）
```

| 层 | 干什么 | 放哪 |
|---|---|---|
| **Component** | 一块控件，吃 props，不拼整页 | 皮肤 `components/`。vui `src/components/` 只有无厂商壳（ListSettingView、GroupCard） |
| **Factory** | 用 `MetaUi` + 列表/字段 props **生产**组件 | 皮肤 `factory/`、`field_factory/`。vui 契约在 [`ui/factory/factory.ts`](../src/ui/factory/factory.ts) / [`field_factory.ts`](../src/ui/factory/field_factory.ts) |
| **Builder** | 用 Factory 原子件拼工具栏、搜索、分组、分页、确认框 | vui `VueUiBuilder`；皮肤 Builder 只补壳/覆盖 |

`buildTable` 只补齐会话（`filterModel`、`loadFilterOptions`、`searchRelative`）再调 `factory.table`。列怎么画、虚拟滚动、列筛控件都在皮肤组件里（如 `SfGrid`、`AgGrid`）。

vui **不要**再建 `ui/factories/`：那会让人以为 vui 在生产 `SfGrid`。`UiActionFactory` 是 Builder 的标准按钮接线，在 `ui/builder/actions.ts`。

以后加控件：皮肤 `components/` 写组件 → 皮肤 `factory/` 用元数据生产（`factory.table` / `tree` / 字段 editor）→ vui Builder 只决定何时分页、分组、弹选择器，**不** import EJ2 / ag-grid / primevue。

## 源码位置（`packages/vui/src/`）

```text
app/                MmdaVueApp、inject keys、主题
logic/              UiLogic
contexts/           UiViewContext / UiBuildContext（会话）
components/         无厂商壳
ui/layout/          UiLayout
ui/factory/         一控件一文件的 props；factory.ts + field_factory.ts
ui/builder/         VueUiBuilder、form/list/tree mixin、overlay
```

`context.uiBuilder` 的类型是 core `UiBuilder`（值为 `app.ui`）。对外仍从 `@mmda/vui` 导入 `VueUiBuilder`、`UiFactory`、`UiActionFactory`。

## 主要内容

- `UiBuilder`：core 拼屏接口（无 Vue）。从 `@mmda/core` 导入，不要从 vui 再 export 同名。
- `VueUiBuilder`：vui 抽象实现；列表页/详情页默认结构、动作工厂、单元格解析。皮肤 `extends` 它。
- `UiFactory` / `UiFieldFactory`：原子控件（button、table、textInput…），含 `menu` / `dialog` / `drawer`。
- `UiOverlay`：命令式 toast / confirm / dialog；皮肤提供 `overlayHost`，**`MmdaVueApp.install`** 自动挂载。
- `UiLayout`：行列栅格，与控件库无关。
- `UiAction` / `UiActionFactory`：刷新、创建、保存、导入导出等。

```ts
import { VueUiBuilder, type UiFactory } from '@mmda/vui'
```

## 依赖方向

```text
页面  →  context.ui.build(ctx) / buildListView / buildView
              ↓
       VueUiBuilder（结构）
              ↓
       UiFactory / UiFieldFactory（控件）+ UiOverlay
              ↓
       皮肤 factory → SfGrid / AgGrid / …
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

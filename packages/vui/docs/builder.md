# Builder 与皮肤

`UiBuilder` 负责 **怎么把会话画成 VNode**。vui 定义契约和默认拼屏；具体按钮、表格、输入框由皮肤实现。

## 主要内容

- `UiBuilder`：拼屏接口。
- `AbstractUiBuilder`：列表页/详情页默认结构、动作工厂、单元格解析。
- `UiFactory` / `UiFieldFactory`：原子控件（button、table、textInput…），含 `menu` / `dialog` / `drawer`。
- `UiOverlay`：命令式 toast / confirm / dialog；皮肤提供 `overlayHost`，`MmdaApplication.install` 自动挂载。
- `UiLayout`：行列栅格，与控件库无关。
- `HtmlUiBuilder`：零控件库的 HTML 皮肤。
- `UiAction` / `UiActionFactory`：刷新、创建、保存、导入导出等。

```ts
import { AbstractUiBuilder, HtmlUiBuilder, type UiFactory } from '@mmda/vui'
```

## 依赖方向

```text
页面  →  context.ui.buildListView / buildView
              ↓
       AbstractUiBuilder（结构）
              ↓
       UiFactory / UiFieldFactory（控件）+ UiOverlay
              ↓
       HtmlUiBuilder 或 PrimeVueUiBuilder / SyncfusionUiBuilder
```

vui **不** import `primevue/*` 或 `@syncfusion/*`。皮肤包实现 `UiFactory` 与 `UiOverlay`。

## 拼屏入口

| 方法 | 用途 |
|---|---|
| `buildListView` | 列表：工具栏 + 搜索 + 表 + 分页 |
| `buildView` | 单对象：工具栏 + 分组表单 |
| `buildTable` / `buildList` | 只有数据区 |
| `buildBpmnDiagram` | BPMN 图（Html 为列表；Prime 用 bpmn-js；Syncfusion 用 EJ2 Diagram） |

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

`customRenderer` / `customCellRenderer` / `customEditor` 在 Field Logic 上覆盖默认映射。

表格级 props（`rowStyle`、`selectionMode`、`renderCell`…）必须经 `cleanTableCellProps` 滤掉，禁止透传到单元格 DOM。

## 皮肤要实现什么

`UiFactory` 至少覆盖：

- 布局：`layout.row` / `column` / `cell`
- 动作：`button`、`badge`、`actionButton`、`menu`、`panelMenu`、`menubar`、`buttonGroup`
- 列表：`table`、`list`、`paginator`
- chrome：`dialog`、`drawer`、`searchForRelative`
- 弹层：`UiOverlay`（toast / confirm / `dialog` 队列）；不要把 toast 写进 Factory

`UiFieldFactory` 用字段 `editor` / `renderer` 名做索引（`textInput`、`dropdown`、`HasOneText`…）。HTML 皮肤给简化实现；PrimeVue / Syncfusion 皮肤映射到各自控件。

## HtmlUiBuilder

用于 playground 和单测，不依赖控件库。列表过滤的 fallback 是原生 `<details>` 表头菜单。生产应用换 `PrimeVueUiBuilder` 或 `SyncfusionUiBuilder` 时，**页面和 Logic 不用改**。

## 边界

- 应用 `AppShell` 直接调用 `builder.buildAppScaffold` / `buildAppSideBar`；不要再包一层皮肤壳组件。
- 侧栏菜单：无控件库的皮肤（`HtmlUiBuilder`）用 `@mmda/vui` 的 `AppSideMenu`。Syncfusion 用自己的 Sidebar + Accordion：顶层 `moduleCode` 不含 `.`（如 `B`、`M`）时左侧系统轨切换一级，右侧 Accordion 展二/三级；否则只渲染 Accordion。
- 应用自定义 chrome 走 `UiFactory`，样式使用 `--mmda-*` token。
- 暗色模式调用 `builder.setColorScheme()`，不要在应用里直接写 `p-dark` / `e-dark`。
- 皮肤可以读 `context`，不要在 factory 里 `new UiViewContext`。
- DataTable 的 `selection` 必须绑定会话的 `selectedItems`，不要在每次 `table()` 里 `ref([])`。
- `rowStyle` 对可见行返回 `undefined`，不要每次 `return {}`。

# core `src/ui/`（契约，无实现）

core **不是没有 UI**，是 **没有 UI 实现**。程序员对着这些接口写 Logic：方法名和参数类型都从 `@mmda/core` 来。

四职拆分设计：[ui/ui_four_roles_design.md](./ui/ui_four_roles_design.md)；怎么写：[ui/ui_four_roles_usage.md](./ui/ui_four_roles_usage.md)。

## 四职

```text
Logic 只认 @mmda/core
  UiLayout                   怎么排（页内 + 应用壳 scaffold）
  UiFieldFactory             一个 MetaUiField → 控件行 / 裸 renderer
  UiFactory                  一个 chrome 控件（table / button / sidebar …）
  UiBuilder                  组装多块 + Overlay（模块页、Explorer、SideMenu、登录）
```

| 职 | 文件 | 要点 |
|---|---|---|
| layout | `layout.ts` | `layoutField` / `layoutPage` / `scaffold`；字段默认 `fieldVertical`；组间距 `gap` |
| fieldFactory | `field_factory.ts` | `render` / `editFor` / `displayFor` + 具名 renderer；无 `timeline` |
| factory | `factory.ts` | chrome；无 `dialog` / `signinForm` |
| builder | `builder.ts` | Overlay + 模块 *View + Explorer / FieldGroup / SubGroup + `buildSigninForm` |

```text
框架包（vui / 以后 rui）：把 TNode 钉成框架节点
  VueUiLayout
  type VueUiFactory = UiFactory<VNode>
  abstract class VueUiBuilder implements UiBuilder<VNode>

厂商皮肤
  Syncfusion* / Prime* / AgNaive* 实现 factory / fieldFactory / Builder 覆盖
```

| 层 | 包 | 命名 |
|---|---|---|
| 契约 | `@mmda/core` | `Ui*`（泛型 `TNode`） |
| 框架 | `@mmda/vui` | `VueUi*`；无扩展则 `type` 别名 |
| 厂商 | `@mmda/vui-*` | `Syncfusion*` / `Prime*` / `AgNaive*` |

不要在 vui 再声明一份与 core 同名的 `interface UiFactory`。不要把 vui 实现 alias 成 `UiBuilder`。

## 主接口

| 文件 | 接口 |
|---|---|
| `builder.ts` | `UiBuilder`：Overlay + `buildIndexView` / `buildEntityView` / `buildFieldGroup` / `buildExplorerView` … |
| `factory.ts` | `UiFactory`：chrome（`button` / `table` / `sidebar` …） |
| `field_factory.ts` | `UiFieldFactory`：`render` / `editFor` / `displayFor` + 具名字段 renderer |
| `layout.ts` | `UiLayout` / `AbstractUiLayout`（含 `scaffold`）。设计 [layout.md](./ui/layout.md) |
| `context.ts` | `UiContext`（`searchRelative` / `select` …） |
| `view.ts` | `UiViewProps`（单对象屏 extras） |
| `builder/list_view.ts` | `UiListViewProps`（Index / Select extras） |
| `builder/explorer.ts` | `UiExplorerViewProps`（左树右表） |
| `builder/dialog.ts` | Overlay props |
| `app_side_menu.ts` | `UiAppSideMenuProps` |
| `factory/*.ts` | 各控件 `Ui*Props`（无 Vue） |

插件页（Gantt / Timeline / Scheduler / Kanban / Diagram）方法在 **Builder**，不进 `UiFactory`。选记录走 `context.select`。

## Props 进 core 的规则

- `VNode` / slots → `TNode` / `() => TNode`
- **不要** `import from 'vue'`
- 所有交互 props 用具名 `Ui*Props`，不要 `Record` 糊弄
- 列筛加载器、列布局等会话标准由 Builder 注入皮肤 extras，**不进**程序员日常 `UiTableProps` 表面（除非契约已公开）

## 怎么生产控件

```text
程序员    MetaUi（列/字段） + Ui*Props（交互）
                ↓
皮肤      factory.table(rows, metaUi, props)
                ↓
          defineVendorProps(metaUi, props)   // 只在皮肤
                ↓
          h(VendorTable, vendorProps)
```

字段行：

```text
fieldFactory.render(field, context)
  → 选 editor/renderer
  → layout.layoutField({ label, control, message })
```

## 程序员怎么拿

```ts
const ui = context.uiBuilder
const factory = ui.factory
const fld = ui.fieldFactory

factory.button({ label: '保存' })
fld.render(field, context)
await ui.confirm(context, { title: '删除', message: '确定？' })
```

细则：[ui_four_roles_usage.md](./ui/ui_four_roles_usage.md)。命名：[docs/naming.md](../../../docs/naming.md)。继承图：[ARCHITECTURE.md](../../../ARCHITECTURE.md)。

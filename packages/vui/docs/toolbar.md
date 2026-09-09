# Toolbar

chrome 三栏壳，走 `factory.toolbar`。[PrimeVue Toolbar](https://primevue.org/toolbar/) 就是这个控件（`start` / `center` / `end`）。

程序员用法：[toolbar_usage.md](./toolbar_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

**不是** EJ2 `items` 命令条。**不是** `factory.buttonGroup`。模块页顶栏 `buildModuleToolbar` 只填槽，壳走本控件。没有 `fldFactory.toolbar`。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/toolbar.ts` | `UiToolbarProps` / `UiToolbarSlots`；`UiHorzAlign` 在 core layout |
| 皮肤 `factory/toolbar.ts` | SF / Naive 三栏 grid；Prime `primevue/toolbar` |

槽名 **`start` / `center` / `end`**。不要 `left` / `right`。不要 `ToolbarComponent` / `ejs-toolbar` 当 vui 名。

## 属性

| 属性 | 说明 |
|---|---|
| `layout` | `full`（缺省）/ `medium` / `compact`。不要 `size` / `variant` / `collapsed` |
| `align.start` / `align.center` / `align.end` | 槽内横对齐，类型 [`UiHorzAlign`](../../core/src/ui/layout.ts)：`left` / `center` / `right`。缺省左 / 中 / 右。竖向写死居中 |
| 槽 `start` `center` `end` | `() => VNodeChild`。事件写在槽里的 button / input 上，不要条级 `onClick` |

整条 grid `1fr auto 1fr`，不要根上 `around`。槽对齐只用 `UiHorzAlign` 的 `left` / `center` / `right`，不要 `between` / `around` / `evenly`。

钩子 class：`mmda-toolbar`；`--full` / `--medium` / `--compact`；有 center 时 `--with-center`；槽 `--left` / `--center` / `--right`。

## 模块栏 layout

| layout | start | center | end |
|---|---|---|---|
| `full` | 面包屑 | 搜索条 | 动作按钮组 |
| `medium` | 面包屑 | 搜索条 | `factory.moreMenuButton` |
| `compact` | 横条下拉 | 标题 | 放大镜；点击进搜索页 |

`ModuleToolbarProps.showSearchBar` 控制 full/medium 的中间搜索、compact 的放大镜。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 壳 | 三栏 grid（不用 EJ2 Toolbar items） | `Toolbar` 三槽 + 槽内 flex | 同 SF 三栏 |
| `align` | `justify-content` | 槽内 flex | 同左 |

## 源码

- vui：[`toolbar.ts`](../src/ui/factory/toolbar.ts)
- 皮肤：各包 `factory/toolbar.ts`

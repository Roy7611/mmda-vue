# Sidebar 与 Drawer

chrome 侧栏走 `factory.sidebar`。[EJ2 Vue Sidebar](https://ej2.syncfusion.com/vue/documentation/sidebar/vue-3-getting-started) 就是这个控件。

`factory.drawer` **不是**另一套实现：它是同一控件的 **`type: Over` 特化**（覆盖弹层，默认遮罩）。Prime `Drawer`、Naive `NDrawer` 只覆盖这一档。

程序员用法：[sidebar_usage.md](./sidebar_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

- vui `ui/factory/sidebar.ts`：`UiSidebarProps`；EJ2 词
- 皮肤 `factory/sidebar.ts`：`createSidebar` / `createDrawer`（drawer 补默认再调同一渲染）
- 不是字段控件：没有 `fieldFactory.sidebar`

应用壳 `SfAppMenu` 仍直接用 `SidebarComponent`，不经过 chrome。

## 属性

- `isOpen`：也认 `modelValue`。不要 vui 主名 `visible` / `show`（只在 drawer 入口翻译旧词）
- `position`：`Left` / `Right`，缺省 Left
- `type`（仅 sidebar）：`Over` / `Push` / `Slide` / `Auto`，缺省 Auto
- `width`：缺省 280
- `showBackdrop`：sidebar 缺省 false；drawer 缺省 true
- `enableDock` / `dockSize`：停靠。见 [Docking](https://ej2.syncfusion.com/vue/documentation/sidebar/docking-sidebar)
- `target`：挂到哪个容器
- `mediaQuery`：`string | MediaQueryList`。见 [Auto Close](https://ej2.syncfusion.com/vue/documentation/sidebar/auto-close)
- `enableGestures`：触摸滑动，未写时 true（跟 SF）
- `onChange(isOpen: boolean)`，以及 `onUpdate:modelValue` / `onUpdate`

钩子 class：`mmda-sidebar`；`mmda-sidebar--over` 等按 type；drawer 加 `mmda-sidebar--drawer`；dock 加 `mmda-sidebar--dock`。

## 皮肤映射

| vui | SF | Prime | Naive |
|---|---|---|---|
| `isOpen` | `isOpen` | `visible` | `show` |
| `position` | `Left`/`Right` | `left`/`right` | `placement` |
| `type` | 原样 | 只有 overlay，挂 class | 同 Prime |
| `showBackdrop` | `showBackdrop` | `modal` | `mask` |
| `enableDock` / `dockSize` / `target` / `mediaQuery` / `enableGestures` | 原样 | 忽略 | 忽略 |
| `onChange` | `open` / `close` | `update:visible` | `update:show` |

Push / dock 只在 SF 上真有效。

## 源码

- vui：[`sidebar.ts`](../src/ui/factory/sidebar.ts)
- 皮肤：各包 `factory/sidebar.ts`

# ContextMenu 设计

chrome 右键菜单，走 `factory.contextMenu`。EJ2 见 [ContextMenu getting started](https://ej2.syncfusion.com/vue/documentation/context-menu/vue-3-getting-started)。

程序员用法：[context_menu_usage.md](./context_menu_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

与 `factory.menu` / `menubar` / `panelMenu`（静态导航）、`factory.dropDownButton`（按钮弹出）不同：本控件挂在 **target 的右键/长按**。

Tree 内嵌右键（SfTree / PrimeTree / NaiveTree）本轮不改；后续可切到本 chrome。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/context_menu.ts` | `UiContextMenuProps`：`items` / `target`；`contextMenuItemsOf` |
| 皮肤 `factory/context_menu.ts` | SF `ContextMenuComponent`；Prime `ContextMenu`；Naive `NDropdown` |

## 属性

| 属性 | 说明 |
|---|---|
| `items` | `UiMenuItem[]`（`UiAction` + 子菜单 `items`）。支持 `divider` / `icon` / `disabled` / `visible` / `canDo` |
| `target` | CSS 选择器。对应 EJ2 `target` |
| `disabled` | 不响应打开 |
| `onSelect` | 选中一项时。条目自身 `onAction` / `command` 优先执行 |
| `onBeforeOpen` | 打开前。返回 `false` 可取消 |

钩子 class：`mmda-context-menu`。

不暴露 EJ2 `showItemOnClick`、动画名。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `items[].label` | `text` | `label` | `label` |
| `items[].icon` | `iconCss` ← `resolveIcon` | `icon` | `icon` |
| `items[].divider` | `separator: true` | `separator: true` | `type: 'divider'` |
| `items[].items` | 嵌套 `items` | `items` | `children` |
| `target` | `target` | `target` | 监听 `contextmenu`，`NDropdown` `trigger: 'manual'` |
| `onSelect` | `select` | `command` / `onSelect` | `onSelect` |
| `onBeforeOpen` | `beforeOpen` | `onBeforeShow` | 打开前回调 |

## 源码

- vui：[`context_menu.ts`](../src/ui/factory/context_menu.ts)
- SF：[`vui-syncfusion/src/factory/context_menu.ts`](../../vui-syncfusion/src/factory/context_menu.ts)
- Prime：[`vui-primevue/src/factory/context_menu.ts`](../../vui-primevue/src/factory/context_menu.ts)
- Naive：[`vui-agnaive/src/factory/context_menu.ts`](../../vui-agnaive/src/factory/context_menu.ts)

# Toolbar

原生命令条，走 `factory.toolbar`。不是页头 [Topbar](./topbar.md)。

| MMDA | [EJ2 Toolbar](https://ej2.syncfusion.com/vue/documentation/api/toolbar/index-default) | [Prime Toolbar](https://primevue.org/toolbar/) | Naive |
|---|---|---|---|
| 槽 `start` / `center` / `end` | `Item.align` Left / Center / Right，`type: Input` + template | `#start` `#center` `#end` | `role="toolbar"` 三区 |
| 槽 `default` | 无 named 时当作 start | 无 named 时进 `#start` | 无 named 时直接当子节点 |
| `overflow` | `overflowMode`：Popup / Scrollable / MultiRow / Extended | 忽略 | 忽略 |
| `disabled` | `aria-disabled` + `--disabled` | 同左 | 同左 |

不暴露 EJ2 `items` ItemModel、`allowKeyboard`、`scrollStep`；不暴露 Prime `pt`。Naive 没有 Toolbar 控件。

程序员用法：[toolbar_usage.md](./toolbar_usage.md)。

## 属性

| 属性 | 说明 |
|---|---|
| `overflow` | `popup`（缺省）/ `scroll` / `multirow` / `none` |
| `disabled` | 整条不可用 |
| 槽 `start` / `center` / `end` | 左 / 中 / 右 |
| 槽 `default` | 无 named 槽时当作 `start` |

钩子 class：`mmda-toolbar`；槽 `mmda-toolbar__start` / `__center` / `__end`。

## 源码

- 契约：[`core/src/ui/factory/toolbar.ts`](../../core/src/ui/factory/toolbar.ts)
- vui：[`factory/toolbar.ts`](../src/ui/factory/toolbar.ts)
- 皮肤：各包 `factory/toolbar.ts`

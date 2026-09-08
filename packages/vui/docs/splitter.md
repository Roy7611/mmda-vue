# Splitter 设计

chrome 分隔栏走 `factory.splitter(panes, props)`。[EJ2 Vue Splitter](https://ej2.syncfusion.com/vue/documentation/splitter/vue3-getting-started) / [API](https://ej2.syncfusion.com/documentation/api/splitter/) 就是这个控件。

参数名是 **pane**，不是 Prime `SplitterPanel` 的 panel。不要 vui 主名 `layout` / `direction` / `paneSettings`。

程序员用法：[splitter_usage.md](./splitter_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

- vui `ui/factory/splitter.ts`：`UiSplitterPane` / `UiSplitterProps`
- 皮肤：SF `SfSplitter` + `SplitterComponent`；Prime / Naive 各包 `factory/splitter.ts`
- 不是字段控件

树列表左栏折叠走 `collapsible` + `collapseTick`（vui 扩展）。不要把 `collapsed` 写回 EJ2 `paneSettings`，否则查询重渲会把右栏算成 0。

## 属性

- `orientation`：`Horizontal`（默认）/ `Vertical`
- `width` / `height`：缺省 `100%`
- `separatorSize`：分隔条厚度
- `enabled`：缺省 true
- `enableReversePanes`：栏序对调（SF 真有效）
- pane：`content`、`size`、`min`、`max`、`collapsible`、`collapsed`、`resizable`、`cssClass`
- `collapseTick`：程序化收起第 0 栏

嵌套：没有第二个 chrome。`pane.content` 可以再放 `factory.splitter(...)`。见 [Different layouts](https://ej2.syncfusion.com/vue/documentation/splitter/different-layouts)。

钩子 class：`mmda-splitter`；`--horizontal` / `--vertical`；`--reverse`。

## 事件

| vui | SF | Prime | Naive |
|---|---|---|---|
| `onCollapsed` / `onExpanded` | `collapsed` / `expanded` | 无 | 无 |
| `onResizeStart` / `onResizing` / `onResizeStop` | 同名 | `resizeend` → stop | `update:size` → stop |

## 源码

- vui：[`splitter.ts`](../src/ui/factory/splitter.ts)
- SF：[`packages/vui-syncfusion/src/factory/splitter.ts`](../../vui-syncfusion/src/factory/splitter.ts)

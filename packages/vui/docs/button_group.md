# ButtonGroup 设计

chrome **容器**：只出厂商按钮组壳，不解析子节点。EJ2 是纯 CSS（[`e-btn-group`](https://ej2.syncfusion.com/vue/documentation/button-group/selection-and-nesting)）。

程序员用法：[button_group_usage.md](./button_group_usage.md)。分段选值不要用容器，走 [select_button_group.md](./select_button_group.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `UiButtonGroupProps` | `orientation` + `htmlAttributes` / `class` |
| 皮肤 `factory/buttonGroup.ts` | SF `div.e-btn-group`；Prime `ButtonGroup`；Naive `NButtonGroup` |

签名：`factory.buttonGroup(() => VNode[], props?)`。子项由调用方造好再塞：`factory.button`、`actionButton`、`splitButton` / `dropDownButton`。

不要再包 `selectButtonGroup`（会双层壳）。vertical + Split 官方不保证。

钩子 class：`mmda-button-group`。

## 源码

- 皮肤：各包 `factory/buttonGroup.ts`

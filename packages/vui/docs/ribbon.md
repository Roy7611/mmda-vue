# Ribbon 插件

Ribbon 不进 chrome `factory`。vui 只定 [`UiRibbonPlugin`](../src/ui/factory/ribbon.ts)；应用 `setRibbonPlugin` 才挂引擎。皮肤 Builder **默认不挂**。

与 [`factory.toolbar`](./toolbar.md)（三栏壳）无关。不要用 `tabs` + `button` 拼假 Ribbon。

程序员用法：[ribbon_usage.md](./ribbon_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/ribbon.ts` | `UiRibbonProps` / tabs→groups→collections→items；未安装 stub |
| `VueUiBuilder.ribbonPlugin` | 默认 `unimplementedRibbonPlugin`；`setRibbonPlugin`；`buildRibbon` 转调插件 |
| `@mmda/vui-syncfusion/ribbon` | `createSfRibbonPlugin`，EJ2 `RibbonComponent` |

不要 `factory.ribbon`。Logic 不画 Ribbon。core `UiBuilder` 不加 Ribbon 方法。Prime / Naive 无对等控件，本轮不实现皮肤 stub。

## 失败

| 情况 | 错误 |
|---|---|
| 未 `setRibbonPlugin` | `ribbon plugin not installed` |

## 属性

| 属性 | 说明 |
|---|---|
| `tabs` | `{ header, groups: { header?, collections: { items }[] }[] }[]` |
| `items[].type` | `button`（默认）/ `dropDown` / `splitButton` / `checkBox` |
| `items[].label` / `icon` / `onClick` | 命令文案、图标、点击 |
| `items[].items` | 下拉 / 拆分钮菜单项 |
| `items[].checked` | 勾选项 |
| `layout` | `classic`（默认）/ `simplified` |
| `activeTab` | 选中页签下标，默认 `0` |
| `options` | 引擎逃逸（FileMenu、BackStage、Gallery…） |

钩子 class：`mmda-ribbon`。皮肤 `style.css` 不写长相。

不进本轮一等：FileMenu、BackStage、Gallery、ComboBox、ColorPicker、GroupButton、contextual tabs → `options`。

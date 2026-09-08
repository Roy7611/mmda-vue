# Tooltip 设计

chrome 提示气泡，走 `factory.tooltip`。[EJ2 Vue Tooltip](https://ej2.syncfusion.com/vue/documentation/tooltip/vue-3-getting-started)。

程序员用法：[tooltip_usage.md](./tooltip_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

vui 名是 **`tooltip`**。不要 `ejs-tooltip` / `TooltipComponent` / Prime `v-tooltip` / Naive `n-tooltip`。

按钮上的 `props.tooltip`（映射原生 `title`）**保留**，那是轻量提示。要厂商气泡、`opensOn`、控制器时用本控件包一层。

没有 `target` 选择器、没有 fldFactory；目标是 `slots.default`。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/tooltip.ts` | `UiTooltipProps` / slots / controller；position / opensOn 映射 |
| 皮肤 `factory/tooltip.ts` | SF `TooltipComponent`；Prime 指令包 span；Naive `NTooltip` |

## 属性

| 属性 | 说明 |
|---|---|
| `content` | 文案。也可用 `slots.content` |
| `position` | `UiPosition`：`top`（缺省）/ `bottom` / `left` / `right` |
| `opensOn` | `auto`（缺省）/ `hover` / `click` / `focus` / `custom` |
| `showPointer` | 箭头。对应 EJ2 `showTipPointer`。缺省 true |
| `openDelay` / `closeDelay` | 毫秒 |
| `disabled` | 关提示，只渲染子节点 |
| `onReady` | `UiTooltipController`：`open` / `close` / `refresh` |

slots：`default`（目标）、可选 `content`。

`position` 映到 EJ2 四边中点（`TopCenter` 等），不做十二角。

钩子 class：`mmda-tooltip`；`--top` / `--bottom` / …；`--disabled`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | `TooltipComponent` | `v-tooltip` 包 `span` | `NTooltip` |
| `content` | `content` | 指令 `value`（字符串） | default 槽 |
| `position` | `TopCenter` 等 | 指令 modifiers | `placement` |
| `opensOn` | `opensOn` | hover 默认；`focus` 用 modifier；click/custom 弱 | `trigger` |
| `showPointer` | `showTipPointer` | 忽略 | `show-arrow` |
| controller | EJ2 `open`/`close`/`refresh` | no-op | `setShow` / `syncPosition` |

## 源码

- vui [`tooltip.ts`](../src/ui/factory/tooltip.ts)
- Syncfusion [`factory/tooltip.ts`](../../vui-syncfusion/src/factory/tooltip.ts)
- Prime [`factory/tooltip.ts`](../../vui-primevue/src/factory/tooltip.ts)
- Naive [`factory/tooltip.ts`](../../vui-agnaive/src/factory/tooltip.ts)

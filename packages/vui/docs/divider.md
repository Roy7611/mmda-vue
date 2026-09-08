# Divider 设计

chrome 分隔线，走 `factory.divider`。不要写成 `separator`（那是 breadcrumb / splitter），也不要复用菜单 `UiAction.divider`。

程序员用法：[divider_usage.md](./divider_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/divider.ts` | `UiDividerProps`：`orientation` / `label` |
| 皮肤 `factory/divider.ts` | SF `e-separator`；Prime `Divider`；Naive `NDivider` |

EJ2 没有独立 Divider 控件，Syncfusion 皮肤用 `div.e-separator` + `mmda-divider`。

卡标题与内容之间的一条线用 `factory.card({ divider: true })`，见 [Card](./card.md)。

## 属性

| 属性 | 说明 |
|---|---|
| `orientation` | `horizontal`（缺省）/ `vertical` |
| `label` | 线中间文案。竖线时皮肤能画则画 |

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 根 | `e-separator` + `mmda-divider` | `Divider` + `mmda-divider` | `NDivider` + `mmda-divider` |
| `vertical` | `mmda-divider--vertical` | `layout: 'vertical'` | `vertical: true` |
| `label` | `mmda-divider__label` + `--labeled` | 默认槽 | 默认槽 |

## 源码

- vui [`divider.ts`](../src/ui/factory/divider.ts)
- Syncfusion [`factory/divider.ts`](../../vui-syncfusion/src/factory/divider.ts)
- Prime [`factory/divider.ts`](../../vui-primevue/src/factory/divider.ts)
- Naive [`factory/divider.ts`](../../vui-agnaive/src/factory/divider.ts)

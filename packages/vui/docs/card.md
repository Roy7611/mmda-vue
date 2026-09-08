# Card 设计

chrome 内容面板，走 `factory.card`。[EJ2 Card Image](https://ej2.syncfusion.com/vue/documentation/card/card-image) 的封面与标题旁小图在同一套 props 上。

程序员用法：[card_usage.md](./card_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/card.ts` | `UiCardProps`：`title` / `surface` / `image` / `headerImage` / `divider` |
| 皮肤 `factory/card.ts` | SF CSS `e-card`；Prime `Card`；Naive `NCard` |

**不是**表单分组：`MmdaGroupCard` / `buildGroupCard` 仍管 MetaUi 组外壳（可折叠 master/sub）。本控件给 dashboard、自定义视图用。

EJ2 Card 是纯 CSS，Syncfusion 皮肤不要造 `SfCard.vue`。

## 属性

| 属性 | 说明 |
|---|---|
| `title` / `subtitle` | 标题行文案。`slots.header` 覆盖整块 |
| `colorRole` | 只挂 `mmda-card--{role}` 钩子 |
| `surface` | `filled`（缺省）/ `outlined` / `elevated` |
| `image` / `imageAlt` / `imageTitle` | 封面。`imageTitle` 叠在封面上 |
| `headerImage` | 标题行左侧圆图，不是封面 |
| `divider` | 标题与内容之间一条分隔。SF：`e-card-separator`；Prime/Naive：卡内 `factory.divider` |

槽：`default` 内容；`image` 覆盖封面（优先于 `image`）；`header` 覆盖标题块；`actions` 标题栏右侧；`footer`。

没有 `toggleable`。内容中间再切用 `factory.divider`，不自动在 footer 前再画一条。不做横向卡（`e-card-horizontal`）。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 根 | `div.e-card` + `mmda-card` | `Card` + `mmda-card` | `NCard` + `mmda-card` |
| `outlined` | `mmda-card--outlined` | 同左钩子 | `bordered: true` + 钩子 |
| `elevated` | `mmda-card--elevated`（不补 box-shadow） | 同左钩子 | 同左钩子 |
| `image` / `slots.image` | `div.e-card-image`；`imageTitle` → `e-card-title` | `#header` 里 `<img>` 或 slot | `cover` 槽 |
| `headerImage` | `e-card-header-image` | `img.mmda-card-header-image` | 同 Prime |
| `divider: true` | `div.e-card-separator` | 内容区嵌 `factory.divider` | 同 Prime |

## 源码

- vui [`card.ts`](../src/ui/factory/card.ts)
- Syncfusion [`factory/card.ts`](../../vui-syncfusion/src/factory/card.ts)
- Prime [`factory/card.ts`](../../vui-primevue/src/factory/card.ts)
- Naive [`factory/card.ts`](../../vui-agnaive/src/factory/card.ts)

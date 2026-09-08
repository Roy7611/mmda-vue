# Badge 设计

chrome 计数/状态标记，走 `factory.badge`。EJ2 类型见 [Syncfusion Badge types](https://ej2.syncfusion.com/vue/documentation/badge/types)；语义对齐 [Material 3](https://m3.material.io/)。

程序员用法：[badge_usage.md](./badge_usage.md)。chrome 参数约定：[factory.md](./factory.md)（含 `htmlAttributes` 透传）。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/badge.ts` | `UiBadgeProps`：`value` / `shape` / `colorRole` / `overlay` / `position` |
| 皮肤 `factory/badge.ts`（或 factory 内联调用） | 映射厂商：SF CSS `e-badge-*`；Prime `Badge`；Naive `NBadge` |
| 字段 `tag` / `chips` | 表元数据展示，**不是** `factory.badge` |

EJ2 Badge 是纯 CSS，Syncfusion 皮肤不要造 `SfBadge.vue`。

## 属性

| 属性 | 说明 |
|---|---|
| `value` | 文案或数字。`shape: 'dot'` 不渲染文字 |
| `shape` | `default` / `circle` / `pill` / `dot` |
| `colorRole` | `UiColorRole` 加 `light` / `dark`（EJ2 预置色）。唯一填色字段 |
| `overlay` | 角标：叠在父元素角落。父级 `position: relative` |
| `position` | 仅 overlay：`topRight`（默认，MD3 top-end）/ `topLeft` / `bottomRight` / `bottomLeft` |

没有 `size`：MD3 small → `shape: 'dot'`；large 计数 → `overlay` + `value`（可截成 `99+`）。

没有 `href`：要跳转用 `factory.link` 包一层或 `onClick`。没有 `overlap` / `notification`：开 `overlay` 时 SF 内部加 `e-badge-notification` + `e-badge-overlap`。

`position` 不复用 `UiPosition`（那是 tooltip 单边）。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `colorRole` | `e-badge-{role}` | `severity`（`warning`→`warn`，`dark`→`contrast`，`light`→`secondary`） | `type`（`danger`→`error`，`secondary`/`light`/`dark`→`default`） |
| `circle` / `pill` / `dot` | `e-badge-circle` 等 | `mmda-badge--*` | 同左；`dot` 另开 `NBadge.dot` |
| `overlay` | `e-badge-notification` + `e-badge-overlap` | class `mmda-badge--overlay`；不包 `OverlayBadge`（调用方已叠在按钮上） | 同 Prime |
| `bottomRight` | `e-badge-bottom` | `mmda-badge--bottom-right` 钩子 | 同左 |
| `topLeft` / `bottomLeft` | `mmda-badge--top-left` 等钩子。EJ2 无左右角，**不写 CSS 补**，可以没有视觉效果 | 同左 | 同左 |

## 源码

- vui：[`badge.ts`](../src/ui/factory/badge.ts)
- SF：[`vui-syncfusion/src/factory/badge.ts`](../../vui-syncfusion/src/factory/badge.ts)
- Prime：[`vui-primevue/src/factory/badge.ts`](../../vui-primevue/src/factory/badge.ts)
- Naive：[`vui-agnaive/src/factory/badge.ts`](../../vui-agnaive/src/factory/badge.ts)

# Factory 控件契约

vui [`ui/factory/`](../src/ui/factory/) 只定 **chrome 控件怎么叫、props 叫什么**。皮肤 `factory/` 生产厂商节点。拼整页仍走 [Builder 与皮肤](./builder.md)。

字段单元格（`tag` / `chips` / `statusLight`）在 `UiFieldFactory`，不是这套 chrome 参数。

## 组件参数约定

chrome 控件（button、badge、link…）对外只认下面四个几何/语义名。皮肤内部再映射到厂商属性（Prime `severity`、Naive `type`、EJ2 CSS 类），**不要**把厂商名写进 vui 契约。

| 中文 | vui 属性 | 含义 | 不要写成 |
|---|---|---|---|
| 形状 | `shape` | 轮廓：圆、胶囊、方… | `variant`、`type`、`rounded` |
| 大小 | `size` | 尺寸档：`small` / `large`（控件按自己的联合类型收窄） | `scale`、厂商 `xlarge` 直接暴露 |
| 颜色 | `colorRole` | MD3 语义色 [`UiColorRole`](../src/app/material.ts)：`primary` / `secondary` / `success` / `info` / `warning` / `danger` | `severity`、`type`、`color`、`role` |
| 位置 | `position` | 相对锚点的摆放。单边（tooltip）用 [`UiPosition`](../src/app/material.ts)：`top` / `bottom` / `left` / `right`。四角（角标）用控件自己的联合类型，如 `UiBadgePosition` | 混用 `severity`；角标不要复用 `UiPosition` |

有就写这四个名；没有的能力不要硬造（例如 Badge 的「MD3 小点 / 大计数」用 `shape: 'dot'` 和 `overlay`，不另开 `size`）。控件还可以有自己的业务字段（`value`、`label`、`overlay`、`buttonType`）。

`toast` / 校验仍可用 `severity`（error / warn），那是结果轻重，不是控件填色。

## 一控件一文件

| 文件 | 契约 |
|---|---|
| [`button.ts`](../src/ui/factory/button.ts) | `shape`、`size`、`colorRole`；另有 `buttonType` |
| [`badge.ts`](../src/ui/factory/badge.ts) | `shape`、`colorRole`、`position`；角标见 [Badge 设计](./badge.md)、[怎么写](./badge_usage.md) |
| [`factory.ts`](../src/ui/factory/factory.ts) | `UiFactory` 方法表 |

新 chrome 控件：先在 vui 定 props（沿用上表），再在三套皮肤实现 `factory.xxx()`。

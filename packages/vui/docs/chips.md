# Chips 设计

chrome 芯片列表，走 `factory.chips`。EJ2 见 [Chip 类型](https://ej2.syncfusion.com/vue/documentation/chips/types)、[定制](https://ej2.syncfusion.com/vue/documentation/chips/customization)。

程序员用法：[chips_usage.md](./chips_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

字段多枚标签走 `fldFactory.tags` / `fldFactory.chips`（自由文本）。枚举多值走 `enumChipSet`，按位勾选走 `bitChipSet`。单枚 `tag` 不是这条路。不要 `enumSetTags` / `BitTags`。横排位勾选仍是 `bitCheckBoxList`，下拉位掩码仍是 `multiBitSelect`。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/chips.ts` | `UiChipsProps`；`chipsPropsFromField` / `enumChipSetPropsFromField` / `bitChipSetPropsFromField` |
| 皮肤 `factory/chips.ts` | SF `ChipListComponent`；Prime `Chip` 列表；Naive `NTag` 列表 |
| 字段 `tags` / `chips` | 自由文本标签 |
| 字段 `enumChipSet` | 枚举多值（`value_array` / `join_text`） |
| 字段 `bitChipSet` | 按位勾选（`or_bits`） |

## 类型 `kind`

| kind | 说明 |
|---|---|
| `action` | 默认。点一下做事 |
| `choice` | 单选一枚 |
| `filter` | 多选 |
| `input` | 带删除的芯片，不是文本框 |

## 定制

`colorRole`、`icon`（前置）、`avatarSrc` / `avatarLabel`、`trailingIcon`、`outlined`。前置槽：`avatarSrc` → `icon` → `avatarLabel`。

钩子：`mmda-chips`；`mmda-chips--choice|filter|input`；`mmda-chips--removable`；条目 `mmda-chips__item--{colorRole}` / `--outlined`。

不暴露 `selection: 'Single'`、`e-primary`、`leadingIconCss`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `choice` / `filter` | `selection` Single / Multiple | 选中 class | `NTag` `checkable` |
| `input` / `removable` | `enableDelete` | `removable` | `closable` |
| `colorRole` | `e-{role}`（`secondary` 仅钩子） | 仅钩子 | `type`（`danger`→`error`） |
| `icon` | `leadingIconCss` | `icon` | icon 插槽 |

## 源码

- vui：[`chips.ts`](../src/ui/factory/chips.ts)
- SF：[`vui-syncfusion/src/factory/chips.ts`](../../vui-syncfusion/src/factory/chips.ts)
- Prime：[`vui-primevue/src/factory/chips.ts`](../../vui-primevue/src/factory/chips.ts)
- Naive：[`vui-agnaive/src/factory/chips.ts`](../../vui-agnaive/src/factory/chips.ts)

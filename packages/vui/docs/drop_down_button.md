# DropDownButton 设计

chrome **整钮点开菜单**，走 `factory.dropDownButton`。按钮 chrome 只走 Factory；Builder **没有** `dropdownMenuButton` / `moreMenuButton`。

程序员用法：[drop_down_button_usage.md](./drop_down_button_usage.md)。主段点击、箭头才开菜单走 [split_button.md](./split_button.md)。封闭选项列表走 [drop_down_list.md](./drop_down_list.md)，不要混名。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/drop_down_button.ts` | `UiDropDownButtonProps`：`UiButtonProps` + `hideCaret` / `popupPlacement` |
| 皮肤 `factory/dropDownButton.ts` | SF `DropDownButton`（上弹用 `SfDropupMenuButton`）；Prime 用 SplitButton+`model` 当整钮菜单；Naive `NDropdown`+按钮 |

`factory.moreMenuButton` **不是**第三套厂商控件：皮肤只给 `dropDownButton` 加上 `mmda-more-menu-button`。文案由调用方传入（`label: context.t('action.more')`），factory 不吃 `UiContext`。

不要 `factory.menuButton`、`factory.dropDownMenu`、`builder.buildDropDownButton`。

## 属性

钮 chrome（`label` / `icon` / `onAction` / `buttonType` / `colorRole`）在 **props**。菜单项是第二个参数 `UiAction[]`（vui 界面动作，不是 core `EntityAction`，也不是厂商 `items`）。

| 属性 | 说明 |
|---|---|
| `hideCaret` | 藏箭头。图标钮 / `shape: 'circle'` 时皮肤也会藏 |
| `popupPlacement` | `bottom` / `bottom-end` / `top` / `top-end`。SF 上弹走上弹壳 |

菜单项常用：`name` / `label` / `icon` / `onAction`（`command` 旧同义）/ `disabled` / `divider` / `items`（子菜单）。不要把厂商 `text` / `iconCss` / `separator` 写进 vui。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 整钮菜单 | EJ2 DropDownButton | SplitButton + `model`（不是真 Split） | `NDropdown` + `NButton` |
| `top` / `top-end` | `SfDropupMenuButton` | 同左钩子 | 同左 |
| `moreMenuButton` | 委托 `dropDownButton` | 同左 | 同左 |

## 源码

- vui：[`drop_down_button.ts`](../src/ui/factory/drop_down_button.ts)
- 皮肤：各包 `factory/dropDownButton.ts`

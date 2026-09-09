# FloatingActionButton 设计

chrome 浮在页面/容器上的主动作，走 `factory.floatingActionButton`。[EJ2 Vue FAB](https://ej2.syncfusion.com/vue/documentation/floating-action-button/vue-3-getting-started)。

程序员用法：[floating_action_button_usage.md](./floating_action_button_usage.md)。chrome 参数约定：[factory.md](./factory.md)。点开一圈相关动作是 EJ2 SpeedDial，本控件不做。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/floating_action_button.ts` | `UiFloatingActionButtonProps`：`UiButtonProps` + `position` / `target` / `iconPosition` |
| 皮肤 `factory/floating_action_button.ts` | SF `FabComponent`；Prime / Naive 降级为圆钮 + `mmda-fab` 钩子 |

钮 chrome（`label` / `icon` / `onAction` / `colorRole` / `buttonType` / `size` / `disabled` / `tooltip`）在 props。没有 `actions`。不要 `builder.buildFab`。

## 属性

| 属性 | 说明 |
|---|---|
| `label` / `icon` / `onAction` | 来自 `UiButtonProps`。只有 `icon` 就是图标钮 |
| `colorRole` | 缺省 `primary`。不要 `isPrimary` / `cssClass: 'e-primary'` |
| `position` | 九宫格：`topLeft` … `bottomRight`（默认 `bottomRight`）。不要写 EJ2 `TopLeft` |
| `target` | CSS 选择器，相对该容器定位；无则相对视口。对应 EJ2 `target` |
| `iconPosition` | 有 label 时图标 `left`（默认）/ `right` |

钩子 class：`mmda-fab`、`mmda-fab--bottomRight`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | `FabComponent` | 圆钮降级 | 圆钮降级 |
| `label` | `content` | `label` | `label` |
| `icon` | `iconCss` | `icon` | 图标槽 |
| `position` | `BottomRight` 等 | `mmda-fab--{position}` 钩子 | 同左 |
| `target` | `target` | `data-mmda-fab-target` | 同左 |

Prime / Naive 没有原生 FAB，不在皮肤 `style.css` 用像素补定位。

## 源码

- vui：[`floating_action_button.ts`](../src/ui/factory/floating_action_button.ts)
- 皮肤：各包 `factory/floating_action_button.ts`

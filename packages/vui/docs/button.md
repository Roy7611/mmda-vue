# Button 设计

chrome 动作按钮，走 `factory.button`。EJ2 类型见 [Button types and styles](https://ej2.syncfusion.com/vue/documentation/button/types-and-styles)。

程序员用法：[button_usage.md](./button_usage.md)。chrome 参数约定：[factory.md](./factory.md)。并排多个动作：[button_group.md](./button_group.md)。分段选值：[select_button_group.md](./select_button_group.md)。整钮菜单：[drop_down_button.md](./drop_down_button.md)。主段+箭头：[split_button.md](./split_button.md)。浮钮：[floating_action_button.md](./floating_action_button.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/button.ts` | `UiButtonProps`：`UiAction` + `buttonType` / `shape` / `size` / `colorRole` |
| 皮肤 `factory/button.ts` | SF `ButtonComponent`；Prime `Button`；Naive `NButton` |

`UiAction`（`label` / `icon` / `onAction` / `command` / `disabled` / `tooltip`）就能构造按钮。原生 HTML 走 `htmlAttributes`，不要 `extends ButtonHTMLAttributes`。

## 属性

| 属性 | 说明 |
|---|---|
| `label` / `icon` / `onAction` | 来自 `UiAction` |
| `buttonType` | 表面：`filled`（默认）/ `outlined` / `text` / `link` / `tonal` / `elevated` |
| `colorRole` | MD3 语义色。SF 映射 `e-primary` / `e-success` / `e-info` / `e-warning` / `e-danger`（可与 `e-outline` / `e-flat` 叠用） |
| `shape` | `square` / `round` / `circle` |
| `size` | `small` / `large` |
| `type` | 原生 submit：`button` / `submit` / `reset` |

不要写厂商 `severity` / `isPrimary` / `cssClass: 'e-success'`。颜色只传 `colorRole`。

钩子 class：`mmda-button`、`mmda-button--danger`、`mmda-button--outlined`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `colorRole: 'danger'` | `e-danger` | `severity: 'danger'` | `type: 'error'` |
| `buttonType: 'outlined'` | `e-outline` | `variant: 'outlined'` | `ghost` |
| `buttonType: 'text'` / `link` | `e-flat` | `variant: 'text'` | `text` |
| `shape: 'circle'` | `e-round` | `rounded` | `circle` |

## 源码

- vui：[`button.ts`](../src/ui/factory/button.ts)
- 皮肤：`vui-syncfusion` / `vui-primevue` / `vui-agnaive` 的 `factory/button.ts`

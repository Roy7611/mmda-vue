# SplitButton 设计

chrome **主段点击 + 箭头开菜单**，走 `factory.splitButton`。对照 [EJ2 Vue 3 SplitButton Getting Started](https://ej2.syncfusion.com/vue/documentation/split-button/vue-3-getting-started) 的能力，vui 名见本文；不要把厂商 API 写进调用方。整钮点开菜单走 [drop_down_button.md](./drop_down_button.md)。封闭选项列表走 [drop_down_list.md](./drop_down_list.md)。

程序员用法：[split_button_usage.md](./split_button_usage.md)。chrome 参数约定：[factory.md](./factory.md)。钮表面： [button.md](./button.md)。

没有 `fieldFactory.splitButton`。不要 `builder.buildSplitButton`。不要 `import SplitButtonComponent`。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/split_button.ts` | `UiSplitButtonProps`：`UiButtonProps` + `actions` |
| 皮肤 `factory/split_button.ts` | SF `SplitButtonComponent`；Prime `SplitButton`；Naive **无原生，降级**为 `dropDownButton` |

签名是 **一个 props 对象**。主段点 `props.onAction`（`command` 旧同义）。箭头菜单才走 `props.actions`（vui `UiAction[]`，不是 core `EntityAction`）。不要第二个参数（那是 `dropDownButton`）。

表格行内若仍 `h(SplitButtonComponent)`（列表单元格），本控件不替代。

## 属性

钮 chrome 在 props，继承 `UiButtonProps`。菜单在 `actions`。

| 属性 | 说明 |
|---|---|
| `label` / `icon` | 主段文案与图标。图标走 `factory.resolveIcon`，不要厂商 `iconCss` |
| `onAction` | 点主段。`command` 旧同义 |
| `actions` | 箭头菜单。`UiAction[]` |
| `buttonType` / `colorRole` / `shape` / `size` | 同 Button |
| `disabled` | 整钮（主段+箭头）不可点 |
| `htmlAttributes` | 透传到根 / EJ2 `htmlAttributes` |

菜单项常用：`name` / `label` / `icon` / `onAction`（`command` 旧同义）/ `disabled` / `divider` / `items`（子菜单）。不要把厂商 `text` / `iconCss` / `separator` 写进 vui。

## EJ2 对照（不是 vui API）

| EJ2 Getting Started | vui |
|---|---|
| `content` | `label` |
| `iconCss` | `icon`（`factory.resolveIcon`） |
| `items` | `actions` |
| 主钮 `click` | `onAction` |
| 菜单 `select` | 该项 `onAction` |
| `disabled` | `disabled` |
| `cssClass` | `class` / `colorRole` / `buttonType` |

不要在调用方写 `content`、`items`、`iconCss`、`select`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 主段 + 箭头 | EJ2 `SplitButtonComponent` | Prime `SplitButton`：`model` + `onClick` | 降级：整钮 `dropDownButton`（主段与箭头不再分开） |
| `actions` | EJ2 `items`（皮肤内映射） | `model` | 下拉项 |
| 主段 `onAction` | 组件 `onClick` | `onClick` | **不单独触发**（只开菜单） |

## 源码

- vui：[`split_button.ts`](../src/ui/factory/split_button.ts)
- 皮肤：各包 `factory/split_button.ts`

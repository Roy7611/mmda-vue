# 勾选设计

chrome 勾选，走 `factory.checkBox`。EJ2 见 [CheckBox getting started](https://ej2.syncfusion.com/vue/documentation/check-box/getting-started)。

程序员用法：[checkbox_usage.md](./checkbox_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

表单布尔格走 `fieldFactory.checkbox(field, context)`：翻译 `MetaUiField` 后调本控件。SigninForm、表格勾选列不是这条路。横排多勾见 [CheckBoxList](./check_box_list.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/checkbox.ts` | `UiCheckBoxProps`：`checked` / `label` / `indeterminate`；`checkBoxPropsFromField` |
| 皮肤 `factory/checkbox.ts` | SF `CheckBoxComponent`；Prime `Checkbox`；Naive `NCheckbox` |
| 字段 `fieldFactory.checkbox` | 译字段，调 `createCheckBox` |

## 属性

| 属性 | 说明 |
|---|---|
| `checked` | 是否勾选。也认 `modelValue` |
| `label` | 文案。`''` 表示不显示 |
| `indeterminate` | 半选。默认 `false`；省略即未半选 |
| `disabled` | 不可点 |
| `onChange` | `(checked: boolean)`。也认 `onUpdate:modelValue` / `onUpdate` |

钩子 class：`mmda-checkbox`；仅 `indeterminate === true` 时 `mmda-checkbox--indeterminate`。

不暴露 `labelPosition`、`e-small`、Prime `binary`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `checked` | `checked` | `modelValue` + 皮肤内 `binary: true` | `checked` |
| `onChange` | `change` → `args.checked` | `onUpdate:modelValue` | `onUpdate:checked` |
| `label` | `label` | 旁挂 `<label>` | 默认插槽 |
| `indeterminate` | 仅 `true` 时传 | 仅 `true` 时传 | 仅 `true` 时传 |

## 源码

- vui：[`checkbox.ts`](../src/ui/factory/checkbox.ts)
- SF：[`vui-syncfusion/src/factory/checkbox.ts`](../../vui-syncfusion/src/factory/checkbox.ts)
- Prime：[`vui-primevue/src/factory/checkbox.ts`](../../vui-primevue/src/factory/checkbox.ts)
- Naive：[`vui-agnaive/src/factory/checkbox.ts`](../../vui-agnaive/src/factory/checkbox.ts)

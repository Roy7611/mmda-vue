# RadioButtonGroup 设计

chrome 单选按钮组，走 `factory.radioButtonGroup`。[EJ2 Vue RadioButton](https://ej2.syncfusion.com/vue/documentation/radio-button/vue-3-getting-started) 是单枚控件，同组靠共享 `name`；vui 只暴露**一组**。

**定位：DropDownList 的平铺形态。** 同一套单选绑定（enum / ref、`valueOf` / `labelOf`）。选项少用圆点组；选项多或要过滤仍用 [`dropDownList`](./drop_down_list.md)。`hasOne` 不灌 `refOptions`，不走本控件。

程序员用法：[radio_button_group_usage.md](./radio_button_group_usage.md)。chrome 参数：[factory.md](./factory.md)。

表单字段走 `fieldFactory.radioButtonGroup`。Pascal 别名 `RadioButtonGroup`。enum 缺省仍是下拉，须显式 `editor: RadioButtonGroup`。

vui 名是 **`radioButtonGroup`**。不要 `ejs-radiobutton` / `radioGroup` / `factory.radioButton`。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/radio_button_group.ts` | `UiRadioButtonGroupProps`；选项解析；`radioButtonGroupPropsFromField` |
| 皮肤 `factory/radio_button_group.ts` | SF 多项 `RadioButtonComponent`；Prime 多项 `RadioButton`；Naive `NRadioGroup` + `NRadio` |
| 字段 `fieldFactory.radioButtonGroup` | 译字段，调 `createRadioButtonGroup` |

## 不要拿它当

| 场景 | 用 |
|---|---|
| 选项多 / 要过滤 | `factory.dropDownList` |
| 分段按钮皮 | `factory.selectButtonGroup` |
| 横排多选 | `factory.checkBoxList` |
| hasOne 挑整份实体 | `searchBox` / pick |

## 属性

| 属性 | 说明 |
|---|---|
| `value` | 当前选项 value。也认 `modelValue`。空 → `null` |
| `options` | 字段译完是 `{ value, label }[]`。Logic 手写可用任意对象 + `optionLabel` / `optionValue` |
| `optionLabel` / `optionValue` | MES 手写选项字段名（如 `text` / `value`） |
| `orientation` | `horizontal`（缺省）或 `vertical`。只挂钩子 class |
| `disabled` | 整组禁用 |
| `name` | 同组 HTML name。省略则生成。字段用 `fieldName` |
| `onChange` | `(value)`。也认 `onUpdate:modelValue` / `onUpdate` |

钩子 class：`mmda-radiobuttongroup`；竖排 `--vertical`；禁用 `--disabled`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | 多项 `RadioButtonComponent` | 多项 `RadioButton` | `NRadioGroup` + `NRadio` |
| 组名 | 每项同一 `name` | 同一 `name` | 组 `name` |
| 选中 | `checked` | `modelValue` | 组 `value` |
| 变更 | 项 `change` | `onUpdate:modelValue` | `onUpdate:value` |

皮肤 `style.css` 不写长相。

## 源码

- vui [`radio_button_group.ts`](../src/ui/factory/radio_button_group.ts)
- Syncfusion [`factory/radio_button_group.ts`](../../vui-syncfusion/src/factory/radio_button_group.ts)
- Prime [`factory/radio_button_group.ts`](../../vui-primevue/src/factory/radio_button_group.ts)
- Naive [`factory/radio_button_group.ts`](../../vui-agnaive/src/factory/radio_button_group.ts)

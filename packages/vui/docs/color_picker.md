# ColorPicker 设计

chrome 取色，走 `factory.colorPicker`。[EJ2 Mode and Value](https://ej2.syncfusion.com/vue/documentation/color-picker/mode-and-value)：`mode` 是 Picker / Palette，`value` 是 hex。

程序员用法：[color_picker_usage.md](./color_picker_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

表单字段走 `fieldFactory.colorPicker(field, context)`：翻译 `MetaUiField` 后调本控件。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/color_picker.ts` | `UiColorPickerProps`：`value` / `mode` / `showModeSwitcher`；`colorPickerPropsFromField` |
| 皮肤 `factory/color_picker.ts` | SF `ColorPickerComponent`；Prime `ColorPicker`；Naive `NColorPicker` |
| 字段 `fieldFactory.colorPicker` | 译字段，调 `createColorPicker` |

**不是** `colorRole`（那是 button/badge 语义填色）。值一律 **hex**；rgba / hsb 调用方自己转。

## 属性

| 属性 | 说明 |
|---|---|
| `value` | hex。3/6 位；含透明度 4/8 位。可带或不带 `#`。也认 `modelValue` |
| `mode` | `picker`（缺省）/ `palette` |
| `showModeSwitcher` | 是否显示 Picker↔Palette 切换。缺省 `true`。vui 名，不是厂商 `modeSwitcher` |
| `disabled` | 不可开 |
| `onChange` | `(hex: string)`。也认 `onUpdate:modelValue` / `onUpdate` |

钩子 class：`mmda-colorpicker`；`mode: 'palette'` 时 `mmda-colorpicker--palette`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `value` | `value` hex | `modelValue` + `format: 'hex'` | `value` hex |
| `mode: palette` | `mode: 'Palette'` | 只挂钩子（无厂商 Palette） | 只挂钩子 |
| `showModeSwitcher: false` | `modeSwitcher: false` | 无对等 API | 无对等 API |
| `onChange` | `change` → `currentValue.hex`（没有则从 rgba 转 hex） | `onUpdate:modelValue` 转 hex | `onUpdate:value` 转 hex |

## 源码

- vui [`color_picker.ts`](../src/ui/factory/color_picker.ts)
- Syncfusion [`factory/color_picker.ts`](../../vui-syncfusion/src/factory/color_picker.ts)
- Prime [`factory/color_picker.ts`](../../vui-primevue/src/factory/color_picker.ts)
- Naive [`factory/color_picker.ts`](../../vui-agnaive/src/factory/color_picker.ts)

# Switch 设计

chrome 滑动开关，走 `factory.switch`。[EJ2 Vue Switch](https://ej2.syncfusion.com/vue/documentation/switch/vue-3-getting-started)。API：[switch](https://ej2.syncfusion.com/vue/documentation/api/switch/)。

程序员用法：[switch_usage.md](./switch_usage.md)。chrome 参数约定：[factory.md](./factory.md)。勾选格仍是 `factory.checkBox`，不要互相替代。

表单走 `fldFactory.switch`。vui 名是对象属性 **`switch`**。不要 `function switch` / `import { switch }`。实现函数 `createSwitch`。不要 `SwitchComponent` / `ejs-switch` / `NSwitch` 当 vui 名。

字段层 `switcher` / `Switcher` 仍是别名。chrome 不要写 `toggleSwitch`。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/switch.ts` | `UiSwitchProps`；`switchCheckedOf` / `switchPropsFromField` |
| 皮肤 `factory/switch.ts` | SF `SwitchComponent`；Prime `ToggleSwitch`；Naive `NSwitch` |
| 字段 `fldFactory.switch` | 译字段，调 `createSwitch` |

## 属性

| 属性 | 说明 |
|---|---|
| `checked` | 是否开。也认 `modelValue` |
| `onLabel` / `offLabel` | 对应 EJ2。Prime / Naive 忽略 |
| `disabled` | 不可点 |
| `onChange` | `(checked: boolean)`。也认 `onUpdate:modelValue` / `onUpdate` |

钩子 class：`mmda-switch`；`--checked` / `--disabled`。

不要 `trueValue` / `falseValue`（调用方在 `onChange` 里自己转）。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | `SwitchComponent` | `primevue/toggleswitch` | `NSwitch` |
| `checked` | `checked` | `modelValue` | `value` |
| `onChange` | `change` → `args.checked` | `onUpdate:modelValue` | `onUpdate:value` |
| `onLabel` / `offLabel` | 原样 | 忽略 | 忽略 |

## 源码

- vui [`switch.ts`](../src/ui/factory/switch.ts)
- Syncfusion [`factory/switch.ts`](../../vui-syncfusion/src/factory/switch.ts)
- Prime [`factory/switch.ts`](../../vui-primevue/src/factory/switch.ts)
- Naive [`factory/switch.ts`](../../vui-agnaive/src/factory/switch.ts)

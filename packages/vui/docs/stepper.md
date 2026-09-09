# Stepper 设计

chrome 步骤条，走 `factory.stepper`。[EJ2 Vue Stepper](https://ej2.syncfusion.com/vue/documentation/stepper/vue-3-getting-started)。

程序员用法：[stepper_usage.md](./stepper_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

字段走 `fldFactory.stepper`：字段整数是当前步；`items` 从 extra 传入。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/stepper.ts` | `UiStepperProps`；`*Field` 绑定；`stepperItemsOf` 规范化；取值、emit、字段翻译 |
| 皮肤 `factory/stepper.ts` | 只吃规范化后的 `UiStepperItem`；SF `StepperComponent`；Prime `Steps`；Naive `NSteps` |
| 字段 `fldFactory.stepper` | 译字段，调 `createStepper` |

vui 名是 **`stepper`**。不要 `ejs-stepper` / `StepperComponent` / Prime `Stepper` / `NSteps` 当 vui 名。

值 **`value` 是当前步索引**（对应 EJ2 `activeStep`）。空 → `0`。vui 用小写 `orientation` / `display`，皮肤再转 EJ2 PascalCase。

`orientation` 类型是共享的 **`UiOrientation`**（`horizontal` | `vertical`）。不要再造 `UiStepperOrientation`。Splitter 的 `'Horizontal' | 'Vertical'` 除外。`UiDirection` 已弃用。

## 属性

| 属性 | 说明 |
|---|---|
| `items` | 任意行（可子表实体）。不必先建成 `UiStepperItem` |
| `labelField` 等 | 字段名或 `(item, index) => …`。见下 |
| `value` | 当前索引。也认 `modelValue` |
| `orientation` | `UiOrientation`：`horizontal`（缺省）/ `vertical` |
| `display` | `default` / `indicator` / `label`。对应 EJ2 `stepType` |
| `labelPosition` | `top` / `bottom` / `start` / `end` |
| `linear` | 必须按序走。对应 EJ2 `linear` |
| `readOnly` | 不可点选 |
| `showTooltip` | EJ2 `showTooltip`。非 SF 忽略 |
| `persist` / `locale` / `rtl` / `animation` | EJ2 全量。非 SF 忽略 |
| `onChange(value)` | 对应 `stepChanged` |
| `onChanging(args)` | 对应 `stepChanging`，可 `cancel`。非 SF 忽略 |
| `onReady` | 拿到 `UiStepperController` |

### 子表绑定

照 multiSelect 的 `labelField`：`items` 是任意行，用 `*Field` 抽显示字段。

| 绑定 | 缺省直读行上的 |
|---|---|
| `keyField` | `key` |
| `labelField` | `label` |
| `textField` | `text` |
| `iconField` | `icon` |
| `optionalField` | `optional` |
| `disabledField` | `disabled` |
| `validField` | `valid` |
| `statusField` | `status`（`notStarted` / `inProgress` / `completed`） |
| `cssClassField` | `cssClass` |

`stepperItemsOf(props)` 在 vui 里解析一次 → `UiStepperItem[]`。皮肤不要自己读 `*Field`。

Controller：`next` / `previous` / `reset` / `refresh`（EJ2 `nextStep` / `previousStep` / `reset` / `refreshProgressbar`）。

钩子 class：`mmda-stepper`；`--horizontal` / `--vertical`；`--linear` / `--readonly`；`display` 非 default 时 `--indicator` / `--label`。

## 皮肤映射

SF **全做**。Prime / Naive 能对上的做，对不上的忽略 / no-op。

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | `StepperComponent` | `Steps` | `NSteps` / `NStep` |
| `value` | `activeStep` | `activeStep` | `current` |
| `items` | `steps`（经 `stepperItemsOf`） | `model` | 子 `NStep` |
| `orientation` | `Horizontal` / `Vertical` | 忽略（横排） | `vertical` |
| `display` | `stepType` | 忽略 | 忽略 |
| `linear` | `linear` | 禁点后续步 + `readonly` | 忽略 |
| `readOnly` | `readOnly` | `readonly` | `pointer-events: none` |

## 源码

- vui [`stepper.ts`](../src/ui/factory/stepper.ts)
- Syncfusion [`factory/stepper.ts`](../../vui-syncfusion/src/factory/stepper.ts)
- Prime [`factory/stepper.ts`](../../vui-primevue/src/factory/stepper.ts)
- Naive [`factory/stepper.ts`](../../vui-agnaive/src/factory/stepper.ts)

# ProgressBar 设计

chrome 进度条，走 `factory.progressBar`。[EJ2 Vue ProgressBar](https://ej2.syncfusion.com/vue/documentation/progressbar/vue-3-getting-started)。

程序员用法：[progress_bar_usage.md](./progress_bar_usage.md)。chrome 参数约定：[factory.md](./factory.md)。整页忙碌指示仍是 `factory.loading`，不要当成进度条。

字段走 `fldFactory.progressBar`：翻译 `MetaUiField` 后调本控件。展示控件，**没有** `onChange`。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/progress_bar.ts` | `UiProgressBarProps`；`progressBarModifierClasses` / `progressBarPropsFromField` |
| 皮肤 `factory/progress_bar.ts` | SF `ProgressBarComponent`；Prime `ProgressBar`；Naive `NProgress` |
| 字段 `fldFactory.progressBar` | 译字段，调 `createProgressBar` |

vui 名是 **`progressBar`**。不要 `ProgressBarComponent` / `ejs-progressbar` / `NProgress` 当 vui 名。

值是 **0–100**，对齐 EJ2 `value`。不要按 `percentage` 显示字段那样 `* 100`。空值 → `0`。

粗细只走 `size: 'small' | 'large'`（省略 = 中档）。不要把 EJ2 `height` / `trackThickness` 像素写进 vui。

## 属性

| 属性 | 说明 |
|---|---|
| `value` | `number`。也认 `modelValue`。空 → `0` |
| `min` / `max` | 缺省 `0` / `100`。SF 映射 `minimum` / `maximum`；Prime / Naive 假定 0–100 |
| `kind` | `linear`（缺省）或 `circular`。Prime 无环形，降级线性并挂钩子 class |
| `size` | `small` / `large`。省略 = 中档 |
| `indeterminate` | 不确定进度。对应 EJ2 `isIndeterminate` |
| `showValue` | 是否显示数值。缺省 `false`。对应 EJ2 `showProgressValue` |
| `colorRole` | MD3 语义色。SF / Prime 只挂钩子；Naive `status` 能对上则映射 |
| `htmlAttributes` | 透传 |

钩子 class：`mmda-progressbar`；环形 `mmda-progressbar--circular`；`size` / `colorRole` / `indeterminate` 对应 `--small`、`--primary`、`--indeterminate`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | `ProgressBarComponent` | `ProgressBar` | `NProgress` |
| `value` | `value` | `value` | `percentage` |
| `kind: circular` | `type: 'Circular'` | 降级线性 + `mmda-progressbar--circular` | `type: 'circle'` |
| `kind: linear` | `type: 'Linear'` | 默认 | `type: 'line'` |
| `indeterminate` | `isIndeterminate` | `mode: 'indeterminate'` | `processing` |
| `showValue` | `showProgressValue` | `showValue` | `showIndicator` |
| `min` / `max` | `minimum` / `maximum` | 假定 0–100 | 假定 0–100 |
| `colorRole` | 钩子 class | 钩子 class | `status` 能对上则映射 |
| `size` | 钩子 class | 钩子 class | Naive `size`：`small` / 省略 medium / `large` |

皮肤 `style.css` 不写长相。上传面板里的裸 EJ2 ProgressBar 不走本 chrome。

## 源码

- vui [`progress_bar.ts`](../src/ui/factory/progress_bar.ts)
- Syncfusion [`factory/progress_bar.ts`](../../vui-syncfusion/src/factory/progress_bar.ts)
- Prime [`factory/progress_bar.ts`](../../vui-primevue/src/factory/progress_bar.ts)
- Naive [`factory/progress_bar.ts`](../../vui-agnaive/src/factory/progress_bar.ts)

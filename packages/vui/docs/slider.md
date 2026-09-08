# Slider 设计

chrome 滑块走 `factory.slider`。[EJ2 Vue Range Slider](https://ej2.syncfusion.com/vue/documentation/range-slider/vue-3-getting-started) 就是这个控件，不是第二个 chrome 名。

程序员用法：[slider_usage.md](./slider_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

- vui `ui/factory/slider.ts`：`UiSliderProps`；`type` 用 EJ2 词
- 皮肤 `factory/slider.ts`：SF `SliderComponent`；Prime `Slider`；Naive `NSlider`
- 字段 `fldFactory.slider`：译字段后调 chrome

vui **type 用 EJ2**：`Default` / `MinRange` / `Range`。不要把 Prime `range` 写进 vui。

本轮没有 ticks / tooltip / 垂直方向。

## 属性

- `value`：`number`，或 `Range` 时 `[start, end]`。也认 `modelValue`
- `min` / `max`：缺省 0 / 100
- `step`：缺省 1
- `type`：`Default`（默认）/ `MinRange` / `Range`。未写 type 且值是二元组则当 `Range`
- `disabled`、`onChange`

钩子 class：`mmda-slider`；`mmda-slider--range`；`mmda-slider--minrange`。

## 皮肤映射

| vui | SF | Prime | Naive |
|---|---|---|---|
| `type: Default` | `type: Default` | `range: false` | `range: false` |
| `type: MinRange` | `type: MinRange` | 无对等，当 Default + `--minrange` | 同 Prime |
| `type: Range` | `type: Range` | `range: true` | `range: true` |

## 源码

- vui：[`slider.ts`](../src/ui/factory/slider.ts)
- 皮肤：各包 `factory/slider.ts`

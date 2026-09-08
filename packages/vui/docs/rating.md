# Rating 设计

chrome 评分走 `factory.rating`。[EJ2 Vue Rating](https://ej2.syncfusion.com/vue/documentation/rating/vue-3-getting-started) 就是这个控件。

程序员用法：[rating_usage.md](./rating_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

- vui `ui/factory/rating.ts`：`UiRatingProps`；`itemsCount` / `readOnly` 用 EJ2 词
- 皮肤 `factory/rating.ts`：SF `RatingComponent`；Prime `Rating`；Naive `NRate`
- 字段 `fldFactory.rating`：译字段后调 chrome

vui **不要** Prime `stars` / `readonly` / `onIcon` / `pt`。换形状用 `emptyTemplate` / `fullTemplate`，没有 `heart` / `thumb` 枚举。

本轮没有 precision / 半星 / tooltip / 悬停事件。

## 属性

- `value`：`number | null`。也认 `modelValue`
- `itemsCount`：格子数，缺省 5
- `readOnly`、`disabled`
- `emptyTemplate` / `fullTemplate`：未评分 / 已评分格子。`VNodeChild` 或 `(ctx: { value; index }) => VNodeChild`
- `onChange(value: number | null)`，以及 `onUpdate:modelValue` / `onUpdate`

钩子 class：`mmda-rating`。

## 皮肤映射

| vui | SF | Prime | Naive |
|---|---|---|---|
| `itemsCount` | `itemsCount` | `stars` | `count` |
| `readOnly` | `readOnly` | `readonly` | `readonly` |
| `onChange` | `valueChanged` | `update:modelValue` | `update:value` |
| `emptyTemplate` | `emptyTemplate` | `#officon` | 默认槽尽量画同一套 VNode；无模板则忽略 |
| `fullTemplate` | `fullTemplate` | `#onicon` | 同上 |

## 源码

- vui：[`rating.ts`](../src/ui/factory/rating.ts)
- 皮肤：各包 `factory/rating.ts`

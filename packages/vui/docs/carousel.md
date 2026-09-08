# 轮播设计

chrome 幻灯片轮播，走 `factory.carousel`。EJ2 见 [Carousel API](https://ej2.syncfusion.com/vue/documentation/api/carousel/index-default)。

程序员用法：[carousel_usage.md](./carousel_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

图库 `factory.imageGallery` / `SfImageGallery` 仍自管，不是本控件。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/carousel.ts` | `UiCarouselProps`：`items` / `selectedIndex` / `autoPlay` / `interval` / `loop` / `animation` |
| 皮肤 `factory/carousel.ts` | SF `CarouselComponent`；Prime `Carousel`；Naive `NCarousel` |
| Builder | 不要 `buildCarousel` |

## 属性

| 属性 | 说明 |
|---|---|
| `items` | `UiCarouselItem[]`：`src` / `title` / `description` / `content` |
| `selectedIndex` | 当前页（从 0）。也认 `modelValue` |
| `autoPlay` | 自动轮播 |
| `interval` | 间隔毫秒 |
| `loop` | 循环。对应 EJ2 `infinite`，不要把 `infinite` 写进 vui |
| `animation` | `'slide'` / `'fade'`。对应 EJ2 `animationEffect` |
| `itemRenderer` | 自定义每页内容；没有则画 `content` 或图片 |
| `onChange` | `(index: number)`。也认 `onUpdate:modelValue` |

不暴露 `buttonsVisibility`、`indicatorsType`、`showPlayButton`、`swipeMode`。箭头/指示点走厂商默认。

钩子 class：`mmda-carousel`；`mmda-carousel--slide` / `--fade`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `items` | `dataSource` + `itemTemplate`（Vue vnode，禁止 HTML 字符串） | `value` + `#item` | 默认插槽子节点 |
| `selectedIndex` | `selectedIndex` | `page` | `default-index` |
| `autoPlay` | `autoPlay` | `autoplayInterval > 0` | `autoplay` |
| `interval` | `interval` | `autoplayInterval` | `interval` |
| `loop` | `infinite` | `circular` | `loop` |
| `animation` | `animationEffect` Slide/Fade | class 钩子 | `effect` |

## 源码

- vui：[`carousel.ts`](../src/ui/factory/carousel.ts)
- SF：[`vui-syncfusion/src/factory/carousel.ts`](../../vui-syncfusion/src/factory/carousel.ts)
- Prime：[`vui-primevue/src/factory/carousel.ts`](../../vui-primevue/src/factory/carousel.ts)
- Naive：[`vui-agnaive/src/factory/carousel.ts`](../../vui-agnaive/src/factory/carousel.ts)

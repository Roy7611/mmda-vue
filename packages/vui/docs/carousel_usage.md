# 轮播：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.carousel`。设计见 [carousel.md](./carousel.md)。参数名约定见 [factory.md](./factory.md)。

```ts
factory.carousel({
  items: [
    { src: '/a.jpg', title: 'A' },
    { src: '/b.jpg', title: 'B' },
  ],
  selectedIndex: 0,
  autoPlay: true,
  interval: 4000,
  loop: true,
  animation: 'fade',
  onChange: (i) => {},
})
```

自定义每页（卡片、富文本）用 `itemRenderer` 或 `items[].content`，不要写 EJ2 HTML `template` 字符串。

## 不要

- `infinite` / `animationEffect` / `buttonsVisibility` 写进 chrome
- 在 Builder 上再开 `buildCarousel`
- 把本控件当成 `imageGallery`（图库仍走原来的图库 API）

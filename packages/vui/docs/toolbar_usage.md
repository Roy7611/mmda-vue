# Toolbar：怎么写

从当前皮肤的 `builder.factory.toolbar` 取节点。设计见 [toolbar.md](./toolbar.md)。页头请用 [Topbar](./topbar.md)。

```ts
factory.toolbar(
  { overflow: 'popup' },
  {
    start: () => factory.buttonGroup(() => [cut, copy, paste]),
    end: () => factory.button({ icon: 'more' }),
  },
)
```

只有一段内容时仍可用 `default`（当作 `start`）：

```ts
factory.toolbar(
  { overflow: 'scroll' },
  { default: () => factory.buttonGroup(() => [cut, copy, paste]) },
)
```

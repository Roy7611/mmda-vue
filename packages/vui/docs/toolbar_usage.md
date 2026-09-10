# Toolbar：怎么写

从当前皮肤的 `builder.factory.toolbar` 取节点。设计见 [toolbar.md](./toolbar.md)。

```ts
factory.toolbar(
  {
    layout: 'full',
    align: { end: 'right' },
    class: 'mmda-page-header',
  },
  {
    start: () => factory.breadcrumb({ items }),
    center: () => searchbar,
    end: () => factory.buttonGroup(() => [save, cancel]),
  },
)
```

Pad 竖用 `layout: 'medium'`（动作进 `moreMenuButton`）。Mobile 用 `layout: 'compact'`（放大镜进搜索页，不在条上展开输入框）。

视口 ≤1024 时 full 动作会 dense（图标 + tooltip），与 `layout: 'compact'` 无关。

槽里放 `factory.button` / `factory.input` / `factory.dropDownButton`，事件写在那些控件上。

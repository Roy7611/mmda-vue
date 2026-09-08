# Tooltip：程序员怎么写

从 `@mmda/vui` 导入类型；节点用 `builder.factory.tooltip`。设计见 [tooltip.md](./tooltip.md)。

vui 名是 **`tooltip`**。不要写 `ejs-tooltip` / `TooltipComponent` / `v-tooltip` / `NTooltip` 进 vui。

```ts
factory.tooltip(
  { content: '保存当前行', position: 'top', opensOn: 'hover' },
  { default: () => factory.button({ label: '保存', onAction: save }) },
)
```

`custom` 时用控制器：

```ts
let tip: UiTooltipController | undefined
factory.tooltip(
  {
    content: '详情',
    opensOn: 'custom',
    onReady: (c) => {
      tip = c
    },
  },
  {
    default: () =>
      factory.button({
        label: '?',
        onAction: () => tip?.open(),
      }),
  },
)
```

按钮轻量提示仍用：

```ts
factory.button({ label: '保存', tooltip: '保存' }) // 原生 title
```

## 不要

- 用 CSS 选择器 `target`（vui 不暴露）
- 把 EJ2 `TopCenter` / `Hover` 写进 vui（用 `top` / `hover`）
- 指望 Prime 实现 click/custom 全量与富内容槽
- 把按钮 `tooltip` 当成厂商气泡

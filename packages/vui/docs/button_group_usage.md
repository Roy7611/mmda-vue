# ButtonGroup：程序员怎么写

容器，不是选项组。设计见 [button_group.md](./button_group.md)。

```ts
builder.factory.buttonGroup(
  () => [
    builder.factory.button({
      label: t('action.refresh'),
      icon: factory.resolveIcon('refresh'),
      onAction: () => load(),
    }),
    builder.factory.button({
      label: t('action.fit'),
      onAction: () => fit(),
    }),
  ],
  { class: 'mmda-toolbar-actions' },
)
```

竖排：`orientation: 'vertical'`（SF `e-vertical`）。

`htmlAttributes` 透传到壳。不要把 `class` 塞进去。分段 Left/Center/Right 走 `factory.selectButtonGroup`。

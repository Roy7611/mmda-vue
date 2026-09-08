# Splitter：怎么写

从当前皮肤的 `builder.factory.splitter` 取节点。设计见 [splitter.md](./splitter.md)。EJ2：[Splitter getting started](https://ej2.syncfusion.com/vue/documentation/splitter/vue3-getting-started)。

```ts
factory.splitter(
  [
    { content: left, size: '16rem', min: '12rem', collapsible: true },
    { content: right, min: '16rem' },
  ],
  {
    orientation: 'Horizontal',
    separatorSize: 8,
    enableReversePanes: false,
    onResizeStop: ({ index, paneSize }) => {},
  },
)
```

嵌套（pane.content 再塞一台 splitter，没有 `nestedSplitter` chrome）：

```ts
factory.splitter(
  [
    { content: factory.splitter([{ content: a }, { content: b }], { orientation: 'Vertical' }), size: '40%' },
    { content: main },
  ],
  { orientation: 'Horizontal' },
)
```

# Tabs：怎么写

从当前皮肤的 `builder.factory.tabs` 取节点。设计见 [tabs.md](./tabs.md)。EJ2：[Tab getting started](https://ej2.syncfusion.com/vue/documentation/tab/getting-started-vue-3)。

```ts
factory.tabs({
  items: [
    { header: '概览', content: overview },
    { header: { text: '明细', iconCss: 'e-icons e-list' }, content: detail },
  ],
  value,
  headerPlacement: 'Top',
  scrollable: true,
  heightAdjustMode: 'Fill',
  onChange: (index) => {
    value = index
  },
})
```

`value` 是下标，不是字符串 key。

# Slider：怎么写

从当前皮肤的 `builder.factory.slider` 取节点。设计见 [slider.md](./slider.md)。EJ2：[Range Slider getting started](https://ej2.syncfusion.com/vue/documentation/range-slider/vue-3-getting-started)。

```ts
factory.slider({
  value: 40,
  min: 0,
  max: 100,
  step: 1,
})

factory.slider({
  type: 'Range',
  value: [20, 80],
  min: 0,
  max: 100,
  onChange: (value) => {
    // number | number[] | null
  },
})
```

字段：

```ts
fieldFactory.slider(field, context)
fieldFactory.slider(field, context, { type: 'Range', min: 0, max: 50 })
```

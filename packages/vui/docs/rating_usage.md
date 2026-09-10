# Rating：怎么写

从当前皮肤的 `builder.factory.rating` 取节点。设计见 [rating.md](./rating.md)。EJ2：[Rating getting started](https://ej2.syncfusion.com/vue/documentation/rating/vue-3-getting-started)。

```ts
factory.rating({
  value: 3,
  itemsCount: 5,
  onChange: (value) => {
    // number | null
  },
})

factory.rating({
  value: 1,
  readOnly: true,
  itemsCount: 2,
})
```

换形状（不要 `onIcon` / `shape`）：

```ts
factory.rating({
  value: 3,
  emptyTemplate: () => h('span', { class: 'e-icons e-heart' }),
  fullTemplate: () => h('span', { class: 'e-icons e-heart' }),
})
```

字段：

```ts
fieldFactory.rating(field, context)
fieldFactory.rating(field, context, { itemsCount: 2, readOnly: true })
```

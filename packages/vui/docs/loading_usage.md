# Loading：怎么写

从当前皮肤的 `builder.factory.loading` 取节点。设计见 [loading.md](./loading.md)。EJ2：[Spinner getting started](https://ej2.syncfusion.com/vue/documentation/spinner/vue3-getting-started)。

```ts
factory.loading()
```

带说明：

```ts
factory.loading({
  label: '加载中',
  size: 'small',
})
```

`buildLoading(context, props)` 只转调 `factory.loading(props)`。

不要 `factory.spinner`。不要把 `factory.loading` 当成进度条或 Skeleton。不要塞进工具栏每颗钮（钮面忙碌走 `factory.button` 的 `loading`）。

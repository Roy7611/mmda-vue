# TextArea：怎么写

从当前皮肤的 `builder.factory.textArea` 取节点。设计见 [text_area.md](./text_area.md)。EJ2：[TextArea getting started](https://ej2.syncfusion.com/vue/documentation/textarea/vue3-getting-started)。

```ts
factory.textArea({
  value,
  rows: 5,
  resizeMode: 'Vertical',
  placeholder: '备注',
  onChange: (next) => {
    value = next
  },
})
```

不要 `factory.textarea(value, props)`。单行用 `factory.textInput`。

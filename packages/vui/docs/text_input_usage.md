# TextInput：怎么写

从当前皮肤的 `builder.factory.textInput` 取节点。设计见 [text_input.md](./text_input.md)。EJ2：[TextBox Vue 3 入门](https://ej2.syncfusion.com/vue/documentation/textbox/vue3-getting-started)。

```ts
factory.textInput({
  value,
  placeholder: '名称',
  onChange: (next) => {
    value = next
  },
})
```

密码框：

```ts
factory.textInput({
  value: pwd,
  type: 'Password',
  autocomplete: 'new-password',
  onChange: (next) => {
    pwd = next
  },
})
```

不要 `factory.input(value, props)`。多行用 `factory.textArea`。

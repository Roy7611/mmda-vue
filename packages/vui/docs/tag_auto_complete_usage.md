# tagAutoComplete：程序员怎么写

```ts
factory.tagAutoComplete({
  value: tagsText,
  options: ['紧急', '内部'],
  onUpdate: (text) => (tagsText = text),
})
```

不要 `factory.tagAutoComplete(tagsText, props)`。字段：`fldFactory.tagAutoComplete(field, context)`，服务端 `editor: 'tagAutoComplete'`。

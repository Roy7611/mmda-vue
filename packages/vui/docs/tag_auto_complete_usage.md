# tagAutoComplete：程序员怎么写

```ts
factory.tagAutoComplete(tagsText, {
  options: ['紧急', '内部'],
  onUpdate: (text) => (tagsText = text),
})
```

字段：`fldFactory.tagAutoComplete(field, context)`，服务端 `editor: 'tagAutoComplete'`。

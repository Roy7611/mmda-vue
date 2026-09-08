# AutoComplete：程序员怎么写

从当前皮肤的 `builder.factory.autoComplete` 取节点。设计见 [autocomplete.md](./autocomplete.md)。参数名约定见 [factory.md](./factory.md)。

这是带联想的文本框。选中建议只是把**显示文本**填进框；可以继续打列表里没有的字。

## 自定义列表

```ts
builder.factory.autoComplete(keyword, {
  placeholder: '搜币种',
  options: ['人民币', '美元', '欧元'],
  onUpdate: (text) => (keyword = text),
})
```

对象选项用 `label` 填进框：

```ts
builder.factory.autoComplete(keyword, {
  options: [
    { value: 'CNY', label: '人民币' },
    { value: 'USD', label: '美元' },
  ],
  onUpdate: (text) => (keyword = text),
})
```

## 服务器联想

```ts
builder.factory.autoComplete(keyword, {
  minLength: 2,
  debounceDelay: 300,
  suggestionCount: 20,
  suggest: (query) => context.apiClient.get(`/suggest?q=${encodeURIComponent(query)}`),
  onUpdate: (text) => (keyword = text),
})
```

`suggest` 返回 `string[]` 或 `{ value, label }[]`。

## REF 小表

不要传 enum。`reference` 必须是 ref；列表和选中填入都是 `labelOf`。

```ts
builder.factory.autoComplete(keyword, {
  reference: field.reference,
  onUpdate: (text) => (keyword = text),
})
```

表单字段：widget 名叫 AutoComplete 时由 field_factory 翻译 `MetaUiField`（`placeholder` 具名；`maxLength` / `name` 进 `htmlAttributes`）。enum 字段仍走下拉；hasOne 仍走 searchBox。

## htmlAttributes

```ts
builder.factory.autoComplete(keyword, {
  placeholder: '搜',
  htmlAttributes: { title: '币种', autocomplete: 'off' },
  onUpdate: (text) => (keyword = text),
})
```

## 定制样式

皮肤不写长相。应用主题钩 `mmda-autocomplete`；`highlight: true` 时还有 `mmda-autocomplete--highlight`。

```css
.mmda-autocomplete.mmda-autocomplete--highlight {
  /* 应用主题，不是皮肤 style.css */
}
```

单实例用 `class`。

## 不要

- 用 AutoComplete 存外键 / 整份 hasOne 实体
- 把 enum 接到 `reference`
- 在业务里写 EJ2 `dataSource`、Prime `completeMethod`、Naive `NAutoComplete` 属性
- 在皮肤 `style.css` 里补联想列表长相

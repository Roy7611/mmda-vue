# Button：程序员怎么写

从当前皮肤的 `builder.factory.button` 取节点。设计见 [button.md](./button.md)。参数名约定见 [factory.md](./factory.md)。

```ts
builder.factory.button({
  label: t('action.save'),
  icon: factory.resolveIcon('save'),
  colorRole: 'primary',
  onAction: () => save(),
})

builder.factory.button({
  label: t('action.delete'),
  colorRole: 'danger',
  buttonType: 'outlined',
  onAction: () => remove(),
})
```

颜色只传 `colorRole`，不要 `severity`。`outlined` / `text` 同样可以带 `colorRole`（SF 会叠 `e-outline` + `e-danger`）。

原生属性用 `htmlAttributes`（透传到根 / EJ2 组件 `htmlAttributes`），不要把 `class` 塞进去。

```ts
builder.factory.button({
  label: '导出',
  class: 'mmda-page__export',
  htmlAttributes: { title: '导出当前筛选' },
})
```

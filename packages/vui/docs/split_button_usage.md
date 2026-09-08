# SplitButton：程序员怎么写

从当前皮肤的 `builder.factory.splitButton` 取节点。设计见 [split_button.md](./split_button.md)。参数名约定见 [factory.md](./factory.md)。

```ts
factory.splitButton({
  label: context.t('action.save'),
  icon: factory.resolveIcon('save'),
  colorRole: 'primary',
  onAction: () => save(),
  actions: [
    { name: 'saveAndNew', label: '保存并新建', onAction: () => saveAndNew() },
    { name: 'saveDraft', label: '存草稿', onAction: () => saveDraft() },
  ],
})
```

主段走 `onAction`，箭头菜单走 `actions`。不要把菜单塞进第二个参数（那是 `dropDownButton` 的签名）。不要写 EJ2 `items` / `content` / `iconCss` / `select`。

## 表面与禁用

```ts
factory.splitButton({
  label: context.t('action.delete'),
  colorRole: 'danger',
  buttonType: 'outlined',
  disabled: cannotDelete,
  onAction: () => remove(),
  actions: [
    { name: 'archive', label: '归档', onAction: () => archive() },
  ],
})
```

颜色只传 `colorRole`。图标钮同样走 `icon` + `label`（或只 `icon`），不要 `iconCss`。

## 分隔与子菜单

```ts
factory.splitButton({
  label: context.t('action.export'),
  onAction: () => exportXlsx(),
  actions: [
    { name: 'xlsx', label: 'Excel', onAction: () => exportXlsx() },
    { divider: true },
    {
      name: 'more',
      label: '更多格式',
      items: [
        { name: 'csv', label: 'CSV', onAction: () => exportCsv() },
        { name: 'pdf', label: 'PDF', disabled: true },
      ],
    },
  ],
})
```

子菜单用 `UiAction.items`。不要把 EJ2 项写成 `text` / `iconCss`。

## Naive 降级

Naive 没有原生 Split，会降级成整钮下拉：点整钮只开菜单，**主段 `onAction` 不会单独触发**。Syncfusion / Prime 才是真 Split（主段执行、箭头开菜单）。

# DropDownButton：程序员怎么写

从当前皮肤的 `builder.factory.dropDownButton` 取节点。设计见 [drop_down_button.md](./drop_down_button.md)。参数名约定见 [factory.md](./factory.md)。

```ts
factory.dropDownButton(
  {
    label: context.t('action.batchOperation'),
    buttonType: 'tonal',
    colorRole: 'secondary',
  },
  [
    { name: 'deleteAll', label: '删除', onAction: () => deleteAll() },
    { divider: true },
    {
      name: 'export',
      label: '导出',
      items: [
        { name: 'xlsx', label: 'Excel', onAction: () => exportXlsx() },
      ],
    },
  ],
)
```

需要 tonal / secondary 自己写 props。不要 `builder.dropdownMenuButton`。

## 更多菜单

```ts
factory.moreMenuButton(
  {
    label: context.t('action.more'),
    tooltip: context.t('action.more'),
    buttonType: 'tonal',
    colorRole: 'secondary',
  },
  items,
)
```

内部只调 `dropDownButton`，并挂 `mmda-more-menu-button`。

图标钮（页脚、调色）：

```ts
factory.dropDownButton(
  {
    icon: factory.resolveIcon('more'),
    buttonType: 'text',
    shape: 'circle',
    hideCaret: true,
    popupPlacement: 'top-end',
  },
  actions,
)
```

不要 `factory.menuButton`。不要把 EJ2 DropDownButton API 写进 vui。

# Divider：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.divider`。设计见 [divider.md](./divider.md)。

## 横线

```ts
builder.factory.divider()
```

中间文案：

```ts
builder.factory.divider({ label: '或' })
```

## 竖线

```ts
builder.factory.divider({ orientation: 'vertical' })
```

不要传 `separator`。菜单项分割仍用 `UiAction.divider`，与本控件无关。

卡头与卡身之间一条线用 `factory.card({ divider: true })`，见 [card_usage.md](./card_usage.md)。

## 定制样式

| class | 何时有 |
|---|---|
| `mmda-divider` | 总是 |
| `mmda-divider--vertical` | `orientation: 'vertical'` |
| `mmda-divider--labeled` | 传了 `label` |

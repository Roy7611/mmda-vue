# Badge：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.badge`。设计见 [badge.md](./badge.md)。参数名约定见 [factory.md](./factory.md)。

## 行内标记

```ts
builder.factory.badge({
  value: item.toolkitIndex,
  colorRole: 'info',
  shape: 'circle',
})
```

颜色只传 `colorRole`，不要 `severity`。

## 角标（叠在按钮/图标上）

父元素相对定位。`overlay: true` 后默认右上；四角用 `position`。

```ts
h('span', { class: 'mmda-user-footer__todo', style: { position: 'relative' } }, [
  builder.factory.button({
    icon: icon('fas fa-bell'),
    buttonType: 'text',
    shape: 'circle',
  }),
  todoCount.value > 0
    ? builder.factory.badge({
        value: todoCount.value > 99 ? '99+' : String(todoCount.value),
        colorRole: 'danger',
        overlay: true,
        position: 'topRight',
      })
    : null,
])
```

只要圆点、不要数字：`shape: 'dot'`，可与 `overlay` 一起用。

## 可点

Badge 不是链接。跳转：`factory.link` 包一层，或父节点 / `onClick`。

## 不要

- 把列渲染做成 `factory.badge`；表里的标签走 field `tag` / `chips`
- 对 `hasOne` 灌 `refOptions` 再当 badge 选项
- 把 Prime `severity`、Naive `type`、EJ2 class 名写进业务 Logic

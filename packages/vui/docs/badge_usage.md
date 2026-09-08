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

颜色只传 `colorRole`，不要 `severity`。默认填色走厂商 Badge；要改位置或圆点尺寸，走下面的「定制样式」，不要改皮肤 `style.css`。

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

## 定制样式

皮肤不为角标补左右定位。应用主题（或页面 CSS）去钩这些 class。

单实例：`class` 自己加一层。原生属性用 `htmlAttributes`（透传到根节点），不要把 `class` 塞进去。

```ts
builder.factory.badge({
  value: 3,
  colorRole: 'danger',
  overlay: true,
  position: 'topLeft',
  class: 'mmda-user-footer__todo-badge',
  htmlAttributes: { title: '待办', 'data-kind': 'todo' },
})
```

全站：按 vui 钩子写选择器。会挂上的有：

| class | 何时有 |
|---|---|
| `mmda-badge` | 总是 |
| `mmda-badge--circle` / `--pill` / `--dot` | `shape` 不是 `default` |
| `mmda-badge--overlay` | `overlay: true` |
| `mmda-badge--top-left` / `--bottom-right` / `--bottom-left` | overlay 且 `position` 不是默认 `topRight` |

```css
/* 应用主题，不是皮肤 style.css */
.mmda-badge.mmda-badge--overlay {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(40%, -40%);
}

.mmda-badge.mmda-badge--overlay.mmda-badge--top-left {
  right: auto;
  left: 0;
  transform: translate(-40%, -40%);
}
```

EJ2 只有上下角：不写这段时，`topLeft` / `bottomLeft` 可以看起来仍在右边。不要在业务里写 `e-badge-*` / Prime `severity`。

## 可点

Badge 不是链接。跳转：`factory.link` 包一层，或父节点 / `onClick`。

## 不要

- 把列渲染做成 `factory.badge`；表里的标签走 field `tag` / `chips`
- 对 `hasOne` 灌 `refOptions` 再当 badge 选项
- 把 Prime `severity`、Naive `type`、EJ2 class 名写进业务 Logic
- 在皮肤 `style.css` 里补 Badge 左右角定位（那是应用主题的事）

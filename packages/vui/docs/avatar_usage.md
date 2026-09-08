# Avatar：程序员怎么写

从当前皮肤的 `builder.factory.avatar` 取节点。设计见 [avatar.md](./avatar.md)。参数名约定见 [factory.md](./factory.md)。

## 图 / 图标 / 缩写

```ts
builder.factory.avatar({
  src: app.user?.portrait,
  icon: 'fas fa-user',
  shape: 'circle',
  size: 'small',
})
```

无 `src` 时显示 `icon`；再没有则 `label`：

```ts
builder.factory.avatar({
  label: 'GR',
  shape: 'circle',
  size: 'large',
  colorRole: 'primary',
})
```

`colorRole` 只给无照片时挂语义钩子，有照片不要传。默认长相由厂商 Avatar 决定；要改颜色或尺寸，走下面的定制，不要改皮肤 `style.css`。

## 定制样式

皮肤不给 `mmda-*` 填色或量尺。应用主题（或页面 CSS）去钩这些 class。

单实例：`class` 自己加一层。原生属性用 `htmlAttributes`（透传到根节点）。

```ts
builder.factory.avatar({
  label: 'GR',
  colorRole: 'primary',
  class: 'mmda-user-footer__avatar',
  htmlAttributes: { title: '当前用户' },
})
```

全站：按 vui 钩子写选择器。会挂上的有：

| class | 何时有 |
|---|---|
| `mmda-avatar` | 总是 |
| `mmda-avatar--circle` / `--square` | `shape`（默认 circle） |
| `mmda-avatar--xsmall` 等 | `size` 不是 `medium` |
| `mmda-avatar--primary` 等 | 无 `src` 且传了 `colorRole` |

```css
/* 应用主题，不是皮肤 style.css */
.mmda-avatar.mmda-avatar--primary {
  background: var(--mmda-primary-color);
  color: var(--mmda-on-primary, #fff);
}

.mmda-avatar.mmda-avatar--xsmall {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.65rem;
}
```

不要在业务里写 `e-avatar-*` / `p-avatar` / `n-avatar`。厂商没有的档位（例如 Prime 没有 xsmall）只靠上面的钩子补。

## 角标

Avatar 没有 `position`。父级相对定位，再叠 `factory.badge({ overlay: true })`。

## 不要

- 把 `factory.image` 当头像（那是预览大图）
- 把 Prime `shape: 'square'`、Naive `round`、EJ2 class 写进业务 Logic
- 在皮肤 `style.css` 里给 Avatar 填色或写死宽高（那是应用主题的事）
- 用 Avatar 做表格单元格字段渲染（那是 field factory）

# Card：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.card`。设计见 [card.md](./card.md)。参数名约定见 [factory.md](./factory.md)。

## 标题 + 内容

```ts
builder.factory.card(
  { title: 'Summary', subtitle: 'Today', colorRole: 'primary' },
  {
    default: () => [h('p', '内容')],
    actions: () => [
      builder.factory.button({ icon: 'refresh', buttonType: 'text' }),
    ],
  },
)
```

颜色只传 `colorRole`，不要 `severity`。表面用 `surface: 'outlined'` / `'elevated'`，不要 `variant`。

## 封面

对齐 EJ2 Card Image。`slots.image` 优先于 `image`。

```ts
builder.factory.card({
  title: 'JavaScript',
  image: '/covers/js.png',
  imageAlt: '封面',
  imageTitle: 'JavaScript',
})
```

标题旁小图（不是封面）：

```ts
builder.factory.card({
  title: 'Ada',
  headerImage: '/avatars/ada.png',
})
```

## 标题下分隔线

```ts
builder.factory.card(
  { title: '区块', divider: true },
  { default: () => [h('p', '内容')] },
)
```

内容中间再切，自己放 `factory.divider`，不要指望 Card 在 footer 前自动再画一条。

## 定制样式

应用主题钩这些 class，不要改皮肤 `style.css` 去补厂商缺口。

| class | 何时有 |
|---|---|
| `mmda-card` | 总是 |
| `mmda-card--primary` 等 | 传了 `colorRole` |
| `mmda-card--outlined` / `--elevated` | `surface` 不是 `filled` |

原生属性用 `htmlAttributes` 透传到根节点。

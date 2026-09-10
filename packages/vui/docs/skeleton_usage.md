# Skeleton：程序员怎么写

从 `@mmda/vui` 导入类型；节点用当前皮肤的 `builder.factory.skeleton`。设计见 [skeleton.md](./skeleton.md)。

EJ2：[getting started](https://ej2.syncfusion.com/vue/documentation/skeleton/vue-3-getting-started)。

vui 名是 **`skeleton`** / **`shimmer`**。不要写 `SkeletonComponent` / `ejs-skeleton` / `NSkeleton` 进 vui。不要用 `factory.skeleton` 当 `factory.loading`，也不要反过来。

```ts
factory.skeleton({
  shape: 'text',
  width: '100%',
  height: 32,
})
```

圆形（头像位）：

```ts
factory.skeleton({ shape: 'circle', width: 40, height: 40 })
```

关掉 shimmer：

```ts
factory.skeleton({ shape: 'rectangle', width: '100%', height: 120, shimmer: 'none' })
```

没有 `onChange`。没有 `fieldFactory.skeleton`。

## edit / details 首次加载

**可以：首次用水合前的 Skeleton，之后局部忙碌仍用 `factory.loading`。** 不要把两者都绑在 `context.loading` 上，否则每次 `refresh()` / 子表重查 / 保存都会把真控件拆掉换成占位。

| 阶段 | 开关 | 画什么 |
|---|---|---|
| 还没有 pack | EntityView `pageLoading` | `factory.loading`（整页转圈） |
| 有 `metaUi`，实体还没水合 | `!context.initialized`（或 model 仍只有 `id`） | 按字段 `factory.skeleton` |
| 已有实体，后续忙碌 | `context.loading` | 表单保留；盖 `factory.loading` 或表格自己的 loading |

1. **壳先上。** `getPack` 后就挂 `VueUiContext`（model 可以只有 `id`），不要等第一次 `init()` 才 `buildView`。Create 一般不用 Skeleton。
2. **Skeleton 只看「还没水合」。** `buildField` 在 `!initialized` 时换皮：普通框 `text`、头像 `circle`、子表一块 `rectangle`（子表仍不分页）。水合后不要再因 `loading` 换皮。
3. **`context.loading` 继续给忙碌指示。** `refresh()` / `search()` 已经拨这个 Ref；列表、局部 overlay 仍走现有 loading。
4. **首次结束要置 `initialized`。** `VueUiContext.load()` 已写 `initializedState`；EntityView 走 mixin `refresh()` 时，第一次 load 成功后同样置位，否则 Skeleton 不会收。
5. **不要在 Logic 里手写 Skeleton。** 接线是 Builder / EntityView 的事。

当前 EntityView 仍会等到 `init()` 结束才 `buildView`，中间是整页 `factory.loading`。上面是接 Skeleton 时的写法，尚未改运行时代码。

## 不要

- 在 Builder 上再开 `buildSkeleton`
- 把整页换成一块大矩形（那是 `factory.loading`）
- 用 `context.loading` 决定是否拆字段画 Skeleton
- 加 `fieldFactory.skeleton`
- 把 EJ2 `shimmerEffect` 写进 vui 公开名（只用 `shimmer`）

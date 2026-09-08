# Skeleton 设计

chrome 内容占位，走 `factory.skeleton`。[EJ2 Vue Skeleton](https://ej2.syncfusion.com/vue/documentation/skeleton/vue-3-getting-started)。

程序员用法：[skeleton_usage.md](./skeleton_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

**边界：** Skeleton = 内容占位 shimmer；`factory.loading` = 整页/区域忙碌指示。不要互相替代。**没有** `fldFactory.skeleton`（不是字段展示）。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/skeleton.ts` | `UiSkeletonProps`；`skeletonModifierClasses` |
| 皮肤 `factory/skeleton.ts` | SF `SkeletonComponent`；Prime `Skeleton`；Naive `NSkeleton` |

vui 名是 **`skeleton`** / **`shimmer`**。不要 `SkeletonComponent` / `shimmerEffect` / `ejs-skeleton` / `NSkeleton` 当 vui 名。

## 属性

| 属性 | 说明 |
|---|---|
| `shape` | `text`（缺省）/ `circle` / `square` / `rectangle` |
| `width` / `height` | 尺寸。string 或 number |
| `shimmer` | `wave`（缺省）/ `pulse` / `fade` / `none`。对应 EJ2 `shimmerEffect` |
| `visible` | 是否画出。缺省视为显示 |
| `htmlAttributes` | 透传 |

钩子 class：`mmda-skeleton`；`shape` / `shimmer` 对应 `--text`、`--circle`、`--wave` 等。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 控件 | `SkeletonComponent` | `Skeleton` | `NSkeleton` |
| `shape: text` | `shape: 'Text'` | `shape: 'rectangle'` | `text: true` |
| `shape: circle` | `shape: 'Circle'` | `shape: 'circle'` | `avatar: true` |
| `shape: square` | `shape: 'Square'` | `shape: 'rectangle'` | 默认块 |
| `shape: rectangle` | `shape: 'Rectangle'` | `shape: 'rectangle'` | 默认块 |
| `shimmer: wave` | `shimmerEffect: 'Wave'` | `animation: 'wave'` | `animated: true` |
| `shimmer: pulse` / `fade` | 对应 `Pulse` / `Fade` | `animation: 'wave'` | `animated: true` |
| `shimmer: none` | `shimmerEffect: 'None'` | `animation: 'none'` | `animated: false` |
| `visible` | `visible` | 假则空节点 | 假则空节点 |

皮肤 `style.css` 不写长相。

## 源码

- vui [`skeleton.ts`](../src/ui/factory/skeleton.ts)
- Syncfusion [`factory/skeleton.ts`](../../vui-syncfusion/src/factory/skeleton.ts)
- Prime [`factory/skeleton.ts`](../../vui-primevue/src/factory/skeleton.ts)
- Naive [`factory/skeleton.ts`](../../vui-agnaive/src/factory/skeleton.ts)

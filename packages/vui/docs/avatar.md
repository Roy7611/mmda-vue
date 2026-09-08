# Avatar 设计

chrome 用户头像，走 `factory.avatar`。EJ2 类型见 [Syncfusion Avatar types](https://ej2.syncfusion.com/vue/documentation/avatar/types)：纯 CSS（`.e-avatar`）。

程序员用法：[avatar_usage.md](./avatar_usage.md)。chrome 参数约定：[factory.md](./factory.md)（含 `htmlAttributes` 透传）。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/avatar.ts` | `UiAvatarProps`：`src` / `icon` / `label` / `shape` / `size` / `colorRole` |
| 皮肤 `factory/avatar.ts` | SF CSS `e-avatar-*`；Prime `Avatar`；Naive `NAvatar` |

EJ2 Avatar 无 Vue 控件，Syncfusion 皮肤不要造 `SfAvatar.vue`。不做 `AvatarGroup`。角标叠头像用 `factory.badge` + `overlay`，Avatar **无** `position`。

## 属性

| 属性 | 说明 |
|---|---|
| `src` | 图片 URL，优先 |
| `icon` | 无图时；走 `factory.resolveIcon` |
| `label` | 无图无图标时的缩写（如 `GR`） |
| `shape` | `default`（方）/ `circle`（默认 circle） |
| `size` | `xsmall` / `small` / `medium`（EJ2 默认档）/ `large` / `xlarge` |
| `colorRole` | 仅无 `src` 时挂 `mmda-avatar--{role}` 钩子；皮肤不填底色，外观靠厂商 |

内容优先级：`src` → `icon` → `label`。都没有则空容器。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `circle` | `e-avatar-circle` | `shape: 'circle'` | `round: true` |
| `default` | 无额外类 | `shape: 'square'` | `round: false` |
| `medium` | 不加尺寸类 | 默认（normal） | `size: 'medium'` |
| `large` / `xlarge` | `e-avatar-large` / `e-avatar-xlarge` | `size` | `large` / 数值 48 |
| `xsmall` / `small` | `e-avatar-xsmall` / `e-avatar-small` | 厂商无这两档时映射 `normal`，仍挂 `mmda-avatar--xsmall` 等钩子（皮肤不写宽高） | `20` / `'small'` |
| `colorRole` | `mmda-avatar--{role}` 钩子 | 同左 | 同左 |

## 源码

- vui：[`avatar.ts`](../src/ui/factory/avatar.ts)
- SF：[`vui-syncfusion/src/factory/avatar.ts`](../../vui-syncfusion/src/factory/avatar.ts)
- Prime：[`vui-primevue/src/factory/avatar.ts`](../../vui-primevue/src/factory/avatar.ts)
- Naive：[`vui-agnaive/src/factory/avatar.ts`](../../vui-agnaive/src/factory/avatar.ts)

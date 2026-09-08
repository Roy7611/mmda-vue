# 面包屑设计

chrome 路径导航，走 `factory.breadcrumb`。EJ2 见 [Breadcrumb Vue 3 getting started](https://ej2.syncfusion.com/vue/documentation/breadcrumb/vue-3-getting-started)。

程序员用法：[breadcrumb_usage.md](./breadcrumb_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/breadcrumb.ts` | `UiBreadcrumbProps`：`items` / `separator` |
| 皮肤 `factory/breadcrumb.ts` | SF `BreadcrumbComponent`；Prime `Breadcrumb`；Naive 手写 nav |
| Builder `buildModuleBreadcrumb` | 从模块 parent 链拼 `items`，再调 `factory.breadcrumb` |

模块壳 props（`ModuleBreadcrumbProps`）不是 chrome。不要在 Builder 上再开通用 `buildBreadcrumb(items)`。

## 属性

| 属性 | 说明 |
|---|---|
| `items` | `UiBreadcrumbItem[]`：`label` 必填；`key` / `icon` / `to` 可选 |
| `items[].to` | 可点则有；末级通常省略。路由 path，**不是**厂商 `url` |
| `separator` | 分隔符；默认交给厂商 |

不暴露 EJ2 `enableNavigation` / `overflowMode` / `url`。不造 `shape` / `colorRole` / `position`。

钩子 class：`mmda-breadcrumb`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| `label` | `text` | `label` | 文本 |
| `icon` | `iconCss`（经 `resolveIcon`） | `icon` | `<i>` |
| `to` | `enableNavigation: false` + `itemClick` → `router.push` | RouterLink / `to` | RouterLink |
| `separator` | `separatorTemplate` | 厂商默认（可忽略） | 文案节点 |

## 源码

- vui：[`breadcrumb.ts`](../src/ui/factory/breadcrumb.ts)
- SF：[`vui-syncfusion/src/factory/breadcrumb.ts`](../../vui-syncfusion/src/factory/breadcrumb.ts)
- Prime：[`vui-primevue/src/factory/breadcrumb.ts`](../../vui-primevue/src/factory/breadcrumb.ts)
- Naive：[`vui-agnaive/src/factory/breadcrumb.ts`](../../vui-agnaive/src/factory/breadcrumb.ts)

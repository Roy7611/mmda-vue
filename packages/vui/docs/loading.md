# Loading

chrome 忙碌指示走 `factory.loading`。[EJ2 Vue Spinner](https://ej2.syncfusion.com/vue/documentation/spinner/vue3-getting-started) 是 `createSpinner` / `showSpinner` / `hideSpinner`，**不是** Vue 控件。vui 名是 **`loading`**。不要 `spinner` / `ProgressSpinner` / `NSpin` / `createSpinner` 当 vui 名。

程序员用法：[loading_usage.md](./loading_usage.md)。chrome 参数约定：[factory.md](./factory.md)。

**没有** `fldFactory.loading`。

## 边界

| 场景 | 用什么 |
|---|---|
| 整页 / 一块区域转圈 | `factory.loading` |
| 确定进度 0–100 | `factory.progressBar` |
| 内容占位 shimmer | `factory.skeleton` |
| 按钮面上忙碌 | `factory.button` 的 `loading`（`UiAction.loading`） |
| SF 表格查询盖层 | 同一套 Spinner 主机包住表格；Prime / Naive 表格走厂商 `loading` |

## 分层

| 层 | 做什么 |
|---|---|
| vui `ui/factory/loading.ts` | `UiLoadingProps`；size / label / class |
| 皮肤 `factory/loading.ts` | SF `SfLoadingHost` + Spinner API；Prime `ProgressSpinner`；Naive `NSpin` |

画出来即忙碌。父级决定是否插入节点。

## 属性

| 属性 | 说明 |
|---|---|
| `label` | 可选说明 |
| `size` | `small` / `large`。省略 = 中档。不要像素进 vui |

钩子 class：`mmda-loading`；`--small` / `--large`；有 label 时 `--labeled`。

## 皮肤映射

| vui | Syncfusion | PrimeVue | Naive |
|---|---|---|---|
| 实现 | `createSpinner` 挂在主机上 | `ProgressSpinner` | `NSpin` |
| 直径 | `width` 24 / 48 / 64 | style 宽高 | `size` small/medium/large |
| `label` | Spinner `label` | 旁 `span` | `description` |

## 源码

- vui：[`loading.ts`](../src/ui/factory/loading.ts)
- 皮肤：各包 `factory/loading.ts`

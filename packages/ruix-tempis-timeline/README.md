# @mmda/ruix-tempis-timeline

[Tempis](https://tempis.dev/) 二维时间轴画布（时间 × 泳道 + 依赖箭头）的 **React** 插件 —— 仓库里第一个 `ruix-*` 包。
契约在 core 的 `ui/plugins/tempis_timeline.ts`（`UiTempisTimelineProps`），走 Builder 具名入口：

```tsx
import { createTempisTimelinePlugin } from '@mmda/ruix-tempis-timeline'

builder.use(createTempisTimelinePlugin())
// builder.buildTempisTimeline(ctx, props)  ← 未装插件时抛 TEMPIS_TIMELINE_PLUGIN_NOT_INSTALLED（不回落列表时间轴）
```

props 的字段与能力清单见 Vue 侧同族包 [`@mmda/vuix-tempis-timeline`](../vuix-tempis-timeline/README.md)：
契约是同一个（`UiTempisTimelineProps`），24 项 options、行绑定、轴级数据、8 个事件、15 方法的控制器一一对应。

## 与 Vue 宿主的差异（只有三处）

| 点 | Vue | React |
|---|---|---|
| 壳键名 | `class` 原样 | `reactRenderProps` 折成 `className`（唯一一处翻译） |
| tooltip 节点 | `createApp(...).mount(detachedDiv)` | `createRoot(detachedDiv)` + **`flushSync`**（React 的 render 默认批处理，不 flush 拿不到挂载好的 DOM） |
| 控制器引用 | 每次重建换新对象 | **引用稳定**（业务拿一次就够），内部永远指向当前实例 |

其余一样：单 prop `source`；数据（items / categories / bands / dependencies / selectedIds）走 setter 不重建；
构造期选项（range / legend / tooltip 标量 / style / …）变化才 `destroy()` + 重建；回调每次读最新 props。

**React 19 StrictMode 双跑**（挂载 → 清理 → 再挂载）按幂等设计：`createEngine` 先到先建、后到的让位，
清理只销毁已存在的实例，所以双跑之后引擎仍然活着（有测试守着）。

## optional peer 与测试

- `@tempis/timeline` 是 optional peer，动态 `import()`（**不要加 `@vite-ignore`**，会让裸 specifier 进产物、浏览器解析不了）；
  未安装时宿主渲染 `Timeline requires @tempis/timeline` 并给出 noop 控制器。
- jsdom 挂载需要 canvas 兜底（`src/__tests__/canvas_stub.ts`：2D ctx + `ResizeObserver` + `Path2D` + 固定尺寸 + `toBlob`），
  由 `vitest.setup.ts` 装上；像素 / 命中 / 平移缩放必须真浏览器验。

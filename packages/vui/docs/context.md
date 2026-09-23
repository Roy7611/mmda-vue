# 会话上下文

屏级运行时是 **`VuiContext`**（对标 Flutter `BuildContext`）。行为由 `view` + 可选 `logic` 决定。

业务 Logic 回调使用 core 的 **`UiContext`**（从 `@mmda/core` 导入），不要写成 vui `VuiContext`。
会话上走 `uiBuilder` / `apiClient` / `app`；`globalProps` 只是把 Vue `globalProperties` 传递下来，极少用。

分层见 [ARCHITECTURE.md](../../../ARCHITECTURE.md)。**为何一个类**见设计 [vue_ui_context.md](./vue_ui_context.md)。

## 从哪导入

```ts
import type { UiContext } from "@mmda/core";
import { VuiContext, UiViewMany, UiViewOne } from "@mmda/vui";
```

| 场景 | 写什么 |
|---|---|
| Logic 钩子、`onChange`、`customRenderer` 参数 | `UiContext` |
| `new`、组件 `PropType` | `VuiContext` |
| 旧名 `UiViewContext` / `UiBuildContext` | 不要写（已删除） |

`new VuiContext` 只出现在 vui（`EntityView`、选择器、树对话框）和少数 mes **Vue 组件**。不要在 Logic 里构造会话。

## 源码

会话能力不按视图拆。框架无关部分在 core `AbstractUiContext`；vui 只有一个实现类：

| 文件 | 职责 |
|---|---|
| core [`context_base.ts`](../../core/src/ui/context_base.ts) | 字段读写 / 校验 / 子表 / 路由 / 列表搜索 / 选择 / 多选动作 |
| vui [`vue_ui_context.ts`](../src/contexts/vue_ui_context.ts) | `VuiContext extends AbstractUiContext`：Vue 响应式、`vueRouter` 适配、i18n、皮肤工厂收窄 |

无 `logic` 时本地会话仍可用（子表行、单测）；有 `logic` 时 data 的 IO 才走远程。

## 关联搜索与选记录

走 Logic + SQL `buildRefWhere`，不调 `globalProps.$api`。细则 [core ui_context_usage](../../core/docs/logic/ui_context_usage.md)。

- `searchRelative(field, word)`：联想 / 列筛，不弹层。
- `select(field)`：hasOne 弹选并写回字段（原 `pickRelative`）。
- `select({ repository, service?, selectionMode })`：任意仓库；返回 `false` 或数组。
- 本地行：`MetaUiBuilder` + `factory.table` + `dialog`。

通用 HTTP 用 `context.apiClient`（与 Logic 的 `this.apiClient` 同一实例）。

## 一份会话一棵树

```text
编辑页 VuiContext view=edit
├─ 子表集合 VuiContext    subGroupContext(group)
└─ 编辑中的子表行 VuiContext
```

索引页和详情页不建立逐行上下文。校验树和 `FieldSearchOptions` 不跨实例共享；字段/组的 **Logic 定义** 可以共享。

通过 `prev` / `root` 回父级。`name === '.'` 表示根会话（主列表单元格用这个判断 linkable 列）。

## 模型与校验

`model` 形状随 `view` 变化：Index/Selector 为分页列表，Details/Edit 为单条实体，子表集合为数组。同一 `UiContext` 类型覆盖这些形状。

编辑用 Vue `reactive`；索引和详情用 `shallowReactive`，避免只读行被深层代理。详情仍走 `setFieldValue`（校验和 `onChange`），以便 in-place 编辑能联动。

```ts
context.getFieldValue("whName");
context.setFieldValue("whName", "主仓");
context.displayField("partnerID");
context.getFieldSelectedOption("categoryID");
```

候选项在 `getFieldSearchOptions(field)`，类型是 core `FieldSearchOptions`。

## 主列表单元格

主列表把页面 context 和显式 `row` 交给单元格，不调用 `context.with(row)`。

子表 `buildGroup` 先 `subGroupContext(group)`，再对每行 `groupCtx.with(row)`。已删除行用 `rowStyle` 隐藏，不要在 render 里改 `model`。

表格行编辑用 `beginEdit` / `endEdit`（内部即 `with` / `release`）。

## 关联导航

`routeToRelative(field)` 生成 HAS_ONE 详情 URL：优先 `/{APP}/{refRepository}/{id}`，没有匹配再试旧命名路由 `refObjName`。点击外链前 `app.syncAuthState()`，见 [应用壳](./application.md)。

## 构造与 init

```ts
const context = new VuiContext({
  model: { id },
  metaUi: pack.metaUi,
  view: UiViewOne.Details,
  app,
  logic,
});
await context.init();
```

| `view` | `init()` |
| --- | --- |
| Index / SelectOne / SelectMany | `configureSearch` + `search()` |
| Create | `logic.create` |
| Details / Edit | `refresh()` → `logic.load` |

保存：`beforeSave` → `beforeValidate` → `validate()` → `afterValidate` → `logic.save` → `afterSave`。

`many` 为 true 时 `model` 是分页列表（`list` + `pagination`）。

列表查询状态只有 `searchParam`，见 [列表与过滤](./list.md)。

## 边界

- 不要在单元格 render 里调用会改响应式依赖的 `router.resolve` 并写回 props；导航放到 click。
- 不要为只读展示包装 `reactive(row)`。
- 不要按 Index/Edit 再拆 Context 子类；`view` 只作运行时门控。
- 皮肤可以读 `context`，不要在 factory 里 `new VuiContext`。

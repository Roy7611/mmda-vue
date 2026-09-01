# 会话上下文

屏级运行时是 `UiBuildContext`（继承 `UiViewContext`）。行为由 `view` 决定，
不再按 Index/Edit/Details 拆类。Logic 回调使用 core 的 `UiContext`。

## 主要内容

- `UiContext`：Logic 与字段回调的统一类型，含 `model` 和常用读写。
- `UiViewContext`：Vue 会话实现。构造时按 `view` 选择 `reactive` 或 `shallowReactive`。
- `UiBuildContext`：一屏宿主，挂 Logic，负责 `init` / `search` / `save`。
- `UiViewOne` / `UiViewMany`：详情、编辑、创建、列表、多选。
- 主从：`subGroupContext` / `with(row)` / `subGroupItemContext`。

```ts
import {
  UiViewContext,
  UiBuildContext,
  UiViewMany,
  UiViewOne,
} from "@mmda/vui";
```

## 一份会话一棵树

```text
编辑页 UiBuildContext view=edit
├─ 子表集合 UiViewContext    subGroupContext(group)
└─ 编辑中的子表行 UiViewContext
```

索引页和详情页不建立逐行上下文。编辑页中，主表、子表集合和正在编辑的行
才拥有实例。校验树和 `FieldSearchOptions` 不跨实例共享；字段/组的
**Logic 定义** 可以共享。

通过 `prev` / `root` 回到父级。`name === '.'` 表示根会话（主列表单元格用这个判断 linkable 列）。

## 模型与校验

`model` 形状随 `view` 变化：Index/Selector 为分页列表，Details/Edit 为单条实体，
子表集合为数组。同一 `UiContext` 类型覆盖这些形状。

编辑场景使用 Vue `reactive`；索引和详情使用 `shallowReactive`，避免只读行
被深层代理。详情仍走同一套 `setFieldValue`（校验和 `onChange`），以便
in-place 编辑（如流程确认字段）能联动改其他字段。

```ts
context.getFieldValue("whName");
context.setFieldValue("whName", "主仓");
context.displayField("partnerID"); // 关联字段展示文本
context.getFieldCurrentOption("categoryID");
```

关联搜索候选项在 `getFieldOptions(field)`，类型是 core 的 `FieldSearchOptions`。

## 主列表单元格

主列表把页面 context 和显式 `row` 交给单元格渲染器，不调用
`context.with(row)`。旧 `customRenderer` 会收到一个不缓存、不响应式、
不含校验树的轻量行视图作为兼容层。

子表 `buildGroup` 先 `subGroupContext(group)`，再对每行 `groupCtx.with(row)`。已删除行用 `rowStyle` 隐藏，不要在 render 里改 `model`。

表格行编辑用 `beginEdit` / `endEdit`（内部即 `with` / `release`）。

## 关联导航

`routeToRelative(field)` 生成 HAS_ONE 详情 URL：优先 `/{APP}/{refRepository}/{id}`（与通用 `EntityView` 路由一致），没有匹配时再尝试旧的命名路由 `refObjName`。

点击外链前调用 `app.syncAuthState()`，见 [应用壳](./application.md)。

## UiBuildContext

```ts
const context = new UiBuildContext({
  model: { id },
  metaui: pack.metaui,
  view: UiViewOne.Details,
  app,
  logic,
});
await context.init();
```

| `view`                         | `init()`                       |
| ------------------------------ | ------------------------------ |
| Index / SelectOne / SelectMany | `configureSearch` + `search()` |
| Create                         | `logic.create`                 |
| Details / Edit                 | `refresh()` → `logic.load`     |

保存路径：`beforeSave` → `beforeValidate` → `validate()` → `afterValidate` → `logic.save` → `afterSave`。

`many` 为 true 时 `model` 是分页列表形状（`list` + `pagination`），不是单行实体。

## 边界

- 不要在单元格 render 里调用会改响应式依赖的 `router.resolve` 并写回 props；导航放到 click。
- 不要为只读展示包装 `reactive(row)`；行对象由列表模型直接提供。
- 实体整页使用 `new UiBuildContext`。

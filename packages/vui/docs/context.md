# 会话上下文

Vue 里一份打开的表单对应一个 `UiViewContext`。它实现 core 的 `UiContext`：当前模型、校验、搜索缓存、主从树、关联选择。

`UiBuildContext` 在其上增加 load/save/delete、列表刷新和路由动作，给实体页用。

## 主要内容

- `UiViewContext`：单实体（或子表集合 / 一行）会话。
- `UiBuildContext`：屏级运行时。
- `UiViewOne` / `UiViewMany`：详情、编辑、创建、列表、多选。
- 主从：`subGroupContext` / `with(row)` / `subGroupItemContext`。

```ts
import { UiViewContext, UiBuildContext, UiViewMany, UiViewOne } from '@mmda/vui'
```

## 一份会话一棵树

```text
主表 UiBuildContext          view = details | edit | index
├─ 子表集合 UiViewContext    subGroupContext(group)
└─ 子表行 UiViewContext      with(row) / subGroupItemContext
```

主表、子表集合、每一行都有各自的实例。校验树和 `FieldSearchOptions` 不跨实例共享；字段/组的 **Logic 定义** 可以由这些上下文共享。

通过 `prev` / `root` 回到父级。`name === '.'` 表示根会话（主列表单元格用这个判断 linkable 列）。

## 模型与校验

构造时 `model` 用 Vue `reactive` 包一层。校验状态 `validationState`（`$v`）同样是 reactive。

```ts
context.getFieldValue('whName')
context.setFieldValue('whName', '主仓')
context.displayField('partnerID')   // 关联字段展示文本
context.getFieldCurrentOption('categoryID')
```

关联搜索候选项在 `getFieldOptions(field)`，类型是 core 的 `FieldSearchOptions`。

## 主列表单元格

主列表 `buildTable` 对每一格 `context.with(row)`。`with` 按主键缓存行上下文，避免同一行重复 `new`。

子表 `buildGroup` 先 `subGroupContext(group)`，再对每行 `groupCtx.with(row)`。已删除行用 `rowStyle` 隐藏，不要在 render 里改 `model`。

## 关联导航

`routeToRelative(field)` 生成 HAS_ONE 详情 URL：优先 `/{APP}/{refRepository}/{id}`（与通用 `EntityPages` 路由一致），没有匹配时再尝试旧的命名路由 `refObjName`。

点击外链前调用 `app.syncAuthState()`，见 [应用壳](./application.md)。

## UiBuildContext

```ts
const context = new UiBuildContext({
  model: { id },
  metaui: pack.metaui,
  view: UiViewOne.Details,
  app,
  logic,
})
await context.init()
```

| `view` | `init()` |
|---|---|
| Index / SelectOne / SelectMany | `configureSearch` + `search()` |
| Create | `logic.create` |
| Details / Edit | `refresh()` → `logic.load` |

保存路径：`beforeSave` → `beforeValidate` → `validate()` → `afterValidate` → `logic.save` → `afterSave`。

`many` 为 true 时 `model` 是分页列表形状（`list` + `pagination`），不是单行实体。

## 边界

- 不要在单元格 render 里调用会改响应式依赖的 `router.resolve` 并写回 props；导航放到 click。
- 不要为只读展示再包一层 `reactive(row)` 以外的深代理；行对象已经在列表 `model` 上。
- `UiViewContext` 可以单独用于对话框内嵌表单；实体整页用 `UiBuildContext`。

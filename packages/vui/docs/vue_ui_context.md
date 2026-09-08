# VueUiContext 设计

vui 一屏会话的实现设计。产品分层真源仍是仓库 [ARCHITECTURE.md](../../../ARCHITECTURE.md)。程序员怎么写见 [context.md](./context.md)；Logic 钩子见 core [ui_context_usage.md](../../core/docs/logic/ui_context_usage.md)。

## 问题

旧分层名不副实：

| 类 | 当时设想 | 实际 |
|---|---|---|
| `UiViewContext` | 本地 / mock 会话 | 会话本体（model、筛选、Logic 绑定、会话树）；子表节点和单测才直接 `new` |
| `UiBuildContext` | 远程子类 | 生产根几乎总是它；补 `init` / `search` / `save` / 路由 / 上传 |

子表也不是「纯本地」：`validate` / `searchRelative` 仍可走远程。因此不要再维持「本地基类 + 远程子类」。

目标：**一个会话类 + 按能力叠加的 mixin**。查询态与 IO 同一条 data 管道，无 `logic` 时 IO 早退。

```text
业务 *Logic.ts  ──►  core UiContext（接口）
                           ▲
                           │ implements
                    vui VueUiContext
```

## 一个类

- 公开实现类只有 **`VueUiContext<E>`**。行为由运行时 `view` + 可选 `logic` 门控，**不**按 Index / Edit / Details 建子类或文件夹。
- 子表集合、子表行、选择器弹层都是**同一类**的子实例（`parent` / `with` / `subGroupContext` / `createSession`）。
- Logic / base / mes 钩子只认 core **`UiContext`**（从 `@mmda/core` 导入）。`VueUiContext` 给 vui 构造、拼屏、少数 mes **Vue 组件**。
- `new` 只出现在 vui（`EntityView`、`select` 弹层、树对话框）和少数 mes Vue 组件。不要在 Logic 里 `new`。
- 旧名 `UiViewContext` / `UiBuildContext` 是同值 deprecated 别名，**不是**产品契约，新代码禁止再写。

## Mixin：TypeScript Handbook，不是 Vue mixin

采用 [TypeScript Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html) **现行** class expression：`function WithXxx<TBase extends Constructor>(Base: TBase) { return class extends Base { … } }`。

不用：

- Vue 组件 `mixins: []`
- Handbook Alternative Pattern（`applyMixins` + 手工 `interface` 合并）
- 已删除的 `attachContextValidate` 一类：`Object.assign` 丢 getter、主类手写 `declare`、mixin 文件 `@ts-nocheck`

约束：

- Mixin 类里不要声明 TypeScript `private` / `protected`（和交叉类型打架）；封装用 ES `#field`。
- Mixin 文件之间禁止互相 import。`select({ repository })` 禁止顶层 import 导出的 `VueUiContext`；组装后走 `createSession`。
- 构造器 `...args: any[]` 传到 `super(...)`；泛型 `E` 放在最终 `VueUiContext<E>`。
- Builder 同样用 Handbook mixin：`WithForm` / `WithList` / `WithTree` 叠在 `VueUiBuilderBase` 上（见 [builder.md](./builder.md)）。不要再 `attachForm` / `Object.assign(prototype)`。

叠放（内 → 外；只许向外调用）：

```text
VueUiContextBase     构造、model、i18n、选择态、with / createChild
  WithSubgroup
  WithValidate       用 getFieldValue、subGroupItemContext
  WithReference      用 logic、getFieldOptions；弹层 createSession
  WithData           查询态 + CRUD + doAction/print + 文件 IO
  WithNavigate       routeTo / confirmAction / cancel（编排 save/search 后再路由）
```

```ts
export class VueUiContext extends WithNavigate(
  WithData(WithReference(WithValidate(WithSubgroup(VueUiContextBase)))),
) {}
```

选择态（`selectedItems`）在**本体**，不单独 mixin：data / navigate / subgroup 都用它，拆出去只会让三层都约束它。

能力之间是 **DAG**，不是循环。互相 `this.xxx` 用叠放顺序表达，不要为了「解耦」再并回一个文件。

## 文件

```text
packages/vui/src/contexts/
  vue_ui_context.ts   本体 + 组装 + createSession；deprecated 别名
  view.ts             UiViewOne / UiViewMany（运行时门控，不是文件轴）
  mixins/
    types.ts          Constructor
    session.ts        setSessionFactory / createSession（打破 reference 文件环）
    subgroup.ts
    validate.ts
    reference.ts
    data.ts           查询态 + 实体 IO + 动作 + 文件；不按读/写再拆
    navigate.ts
```

| 放哪 | 典型 API |
|---|---|
| 本体 | 构造、`bindLogics`、`t`、`get/setFieldValue`、`with`、`selectedItems` |
| data | `filters`、`searchParam`、`init` / `save` / `search`、`doAction`、上传 |
| validate | `validate`、`setFieldError` |
| subgroup | `subGroupContext`、增删行、行 dialog |
| navigate | `routeTo`、`edit` / `create`、`confirmAction`、`cancel` |
| reference | `searchRelative`、`loadReferenceOptions`、`select` |

**data 不按读/写拆**：`init` 既 load 又可能 `create`；`resetFilters` 先改本地再 `search`；无 logic 的早退是同一管道上的分支。文件传输若明显超过 ~500 行再抽 `mixins/files.ts`，本轮仍在 `data.ts`。

不建 `mixins/actions.ts`、`mixins/selection.ts`、`mixins/base.ts`。

## 类型边界

| 谁 | 类型 | 从哪导入 |
|---|---|---|
| 业务 `*Logic.ts` 钩子 | core `UiContext` | `@mmda/core` |
| `new`、Vue `PropType`、屏级拼装 | `VueUiContext` | `@mmda/vui` |
| `context.uiBuilder` | core `UiBuilder` | 值为 `app.ui`（`VueUiBuilder`） |

rui 若落地：另写实现类 `implements UiContext`，不要从 vui 抄 `VueUiContext`。

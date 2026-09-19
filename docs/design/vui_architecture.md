# MMDA Vue 前端架构设计（重写稿）

> **定位**：`@mmda/vui` 与其皮肤（`vui-syncfusion` / `vui-primevue` / `vui-agnaive`）、厂商包（`vuix-*`）的重写设计。
> **分层真源**仍是 [ARCHITECTURE.md](../../ARCHITECTURE.md)——产品横向分层只在那一处写全；本文只写 **UI 层内部契约与通道**，不重复分层原则。
> **状态**：第 1 章（契约与通道）已定稿；其余章节按 [§0.3](#03-章节骨架) 骨架待写。
> **与旧稿的关系**：[`packages/core/docs/ui/ui_prop_channels_design.md`](../../packages/core/docs/ui/ui_prop_channels_design.md) 的核心判定（袋 → 标准形态、判定只有一份、运行时只做键名翻译）继续有效；其中三条被本文取代，见 [§1.7](#17-取代旧稿的三条)。

---

## 0. 总则

### 0.1 判定规则（地基）

调用方交给控件的东西只有三类，各有唯一归属：

| 类别 | 判据 | 归属 | 例子 |
|---|---|---|---|
| **值 / 事件 / 壳样式** | 数据，或"控件在某个时机调用你" | **props 具名成员** | `value`、`onChange`、`class`、`style`、`htmlAttributes` |
| **区域** | **不带参数**，由控件决定何时、何处渲染 | **slots（第二参）** | `default`、`header`、`footer`、`start`、`end`、`actions` |
| **逐项渲染委托** | **带参数**，按数据项回调 | **配置对象**（列 / 项定义）；控件级函数留 props | `cellRenderer(row, col)`、`itemRenderer(item, i)`、`rowClassName(row)` |

一句话：**不带参数 = 区域 → slots；带参数 = 回调 → props（逐项的进配置对象）。**

### 0.2 为什么区域必须与 props 分开

1. **判定唯一性**：core 的拆袋点 `uiRenderProps` 必须**控件无关**。合并进 props 后，它就得知道"card 的 `header` 是区域、table 的 `header` 是具名参数"——判定从 1 处扩散成 N 处，违背"判定只有一份"。
2. **DOM 污染**（实测，见 [§1.1](#11-运行时实测事实)）：Vue 会把**未被消费的函数键静默写成 DOM 属性**。区域函数一旦混进 props，每个透传点都必须先挑出它。

### 0.3 章节骨架

| # | 章节 | 状态 |
|---|---|---|
| 1 | 契约与通道（props / slots / 标准形态） | **已定稿**（本文） |
| 2 | 会话（`UiContext` / `VueUiContext` / mixin） | 待写 |
| 3 | 拼屏（Builder 模板方法 + 组合） | 待写 |
| 4 | 四职落地（layout / fieldFactory / factory / builder） | 待写 |
| 5 | 插件（`UiPlugin` / `VuePluginHost`） | 待写 |
| 6 | 应用壳（`MmdaApplication` / `MmdaVueApp`） | 待写 |
| 7 | 皮肤边界（皮肤不得感知 Data） | 待写 |
| 8 | 依赖规则与守卫 | 待写 |
| 9 | 迁移与验收 | 待写（第 1 章的已含在 §1.5 / §1.6） |
| 10 | 术语索引（对接 [naming.md](../naming.md)） | 待写 |

---

## 1. 契约与通道

### 1.1 运行时实测事实

探针（本机真运行时，非文档推断）：

| 探针 | 覆盖 |
|---|---|
| `%LOCALAPPDATA%\Temp\mmda_probe_vue_attrs.mjs` | Vue 3.5.41：attrs 透传 / 整袋 spread |
| `%LOCALAPPDATA%\Temp\mmda_probe_react2.mjs`、`mmda_probe_react3.mjs` | React 19.2.0：未知 prop 与 `class` / `for` |
| `%LOCALAPPDATA%\Temp\sv_probe.mjs` | Svelte 5.57.1：snippet 与 spread 属性 |

**函数型成员落进 DOM 路径会怎样**：

| 场景 | Vue 3.5.41 | React 19.2.0 | Svelte 5.57.1 |
|---|---|---|---|
| 控件**声明 / 解构**了该键 | 走 props ✅ | 走 props ✅ | 走 props ✅ |
| 控件**没声明**，函数键落 attrs | **静默写成 DOM 属性**（`itemrenderer="() => …"`） | 丢弃 + `console.error` | 丢弃（无输出） |
| `{...rest}` spread 到真实元素 | **静默**（`header="() => h('b','X')"`，**0 条告警**） | 丢弃 + `Invalid value for prop …` | 丢弃 |
| 整袋 `{...props}` spread | 同上，静默污染 ❌ | 丢弃 + error | 丢弃 |
| 字符串型键 spread | 写属性 | 写属性 | 写属性 |

Svelte 的源码级依据：`svelte/src/internal/client/dom/elements/attributes.js:469`

```js
} else if (typeof value !== 'function') {
    set_attribute(element, name, value, skip_warning);
}
```

**`children` / `slots` 的位置与求值时机**：

| | 放哪 | 求值 | 具名通道 |
|---|---|---|---|
| Vue `h(type, props, children)` | **第三参**（实测：只有此位置能形成 `$slots`；`props.children` 不进 `$slots`，会落 attrs 并报错） | 惰性函数 | 槽对象 = 名字 → 函数 |
| React `createElement(type, config, ...children)` | `props.children` | **立即**（元素已建）；render-prop 才惰性 | props 具名键 |
| Svelte 5 `$props()` | props（`children` 隐式 + 具名 snippet） | 惰性函数 | props 具名键 |

**结论**：位置三家不一致（Vue 独有第三参），**形态两家一致**（具名惰性函数）。契约锚在**形态**，位置交给适配层。

**`class` / `for` 用平台原生名**（实测 React 19.2）：

```
class: 'c'      -> <div class="c"></div>      ⚠ dev: Invalid DOM property `class`. Did you mean `className`?
for: 'f'        -> <label for="f">x</label>   ⚠ dev: Invalid DOM property `for`. Did you mean `htmlFor`?
```

平台原生名在 React 19 下**渲染正确**，只有 dev 告警；而 Vue 把 `htmlFor` 渲成 `htmlfor`（错的）。故标准形态用 `class` / `for`。

### 1.2 决策清单

| # | 决策 |
|---|---|
| **D1** | 判定规则见 [§0.1](#01-判定规则地基)；区域走第二参，逐项渲染委托进配置对象 |
| **D2** | `UiProps` **去掉索引签名**，只留 `class` / `style` / `htmlAttributes`，另放行 `data-*` / `aria-*` 模板字面量键 |
| **D3** | **不设 `UiBag`**。Logic 直接传 `UiXxxProps`；确需灵活键的控件在自己的 `UiXxxProps` 声明（不得自建 `[key: string]: any`，现状 4 处见 [§1.5](#15-迁移对照)） |
| **D4** | 标准形态用**平台原生名** `class` / `for`；vui **零键名翻译**，`vueRenderProps` 删除 |
| **D5** | `UiXxxProps extends UiProps`；`class` / `style` 收紧成具名 `UiClassValue` / `UiStyleValue` |
| **D6** | `UiSlot<TNode> = () => TNode \| TNode[]`；`UiXxxSlots` 一控件一张、无索引签名、作为**第二参** |
| **D7** | 剩余未知键：**标量** → `attributes`；**函数 / 对象** → **留在 `props`**，绝不进 `attributes`（declared 的逐项渲染委托就在 `props` 里，core 无权丢弃） |

### 1.3 类型（core 契约，无框架依赖）

```ts
/** 壳样式的宽松写法（Vue 侧可数组 / 对象；core 只描述、不归一）。 */
export type UiClassValue =
  | string | number | null | undefined | false
  | UiClassValue[]
  | Record<string, unknown>

/** 渲染前 style 一律收成对象；字符串形式只在输入侧容忍。 */
export type UiStyle = Record<string, string | number>
export type UiStyleValue = string | UiStyle | null | undefined

/** 落到真实节点的 DOM 属性（白名单通道）。 */
export type HtmlAttributes = Record<string, string | number | boolean>

/** 所有控件入参的底：只有壳样式三键 + DOM 数据属性，没有索引签名。 */
export interface UiProps {
  class?: UiClassValue
  style?: UiStyleValue
  htmlAttributes?: HtmlAttributes
  [key: `data-${string}` | `aria-${string}`]: unknown
}

/** 区域：惰性、可空、可多节点。 */
export type UiSlot<TNode = any> = () => TNode | TNode[]

/** 一个控件的具名入参（值 / 事件 / 逐项渲染委托）。 */
export interface UiTextInputProps extends UiProps {
  value?: string
  placeholder?: string
  disabled?: boolean
  onChange?(value: string): void
}

/** 一个控件的区域表，第二参。 */
export interface UiSidebarSlots<TNode = any> {
  default?: UiSlot<TNode>
}
```

**生产控件的签名形态**：有区域才写第二参。

```ts
factory.textInput(props?: UiTextInputProps)                                    // 无区域
factory.sidebar(props?: UiSidebarProps, slots?: UiSidebarSlots<TNode>)          // 有区域
builder.buildFilterBar(ctx: UiContext, props?: UiFilterBarProps, slots?: UiFilterBarSlots<TNode>)
```

**区域求值唯一出口**（core 不建节点，只调用函数；空区域语义一份）：

```ts
export function uiSlot<TNode>(slot?: UiSlot<TNode>, fallback?: () => TNode | TNode[]): TNode | TNode[] {
  return (slot ? slot() : undefined) ?? fallback?.() ?? []
}
```

**拆袋唯一出口**：

```ts
export interface UiRenderProps<TProps extends UiProps = UiProps> {
  props: TProps                 // 具名成员 + onXxx + class(已收串) + style(已收对象) + for
  attributes: HtmlAttributes    // htmlAttributes 压平 + 剩余标量键（函数 / 对象已过滤 + dev 报错）
}

export function uiRenderProps<TProps extends UiProps = UiProps>(props?: TProps): UiRenderProps<TProps>
```

规则（判定只写在这里）：
1. `class`：`uiClassName(...)` 收成字符串，留在 `props.class`；
2. `style`：`styleObjectOf(...)` 收成对象，留在 `props.style`；
3. `htmlAttributes`：压平进 `attributes`（键取两运行时同名者）；
4. `onUpdate` / `onUpdate:*`（Vue v-model 别名）：**不进标准形态**，取值归口 `vueUpdateOf`；
5. 其余具名成员原样进 `props`；`for` **不改名**；
6. **剩余未知键**（运行时来源，类型上不存在的键）：
   - `string` / `number` / `boolean` → `attributes`（等价 React 的小写自定义属性透传，顶层直接写 `'data-testid'` 也能到 DOM）；
   - **函数 / 对象 → 留在 `props`**，**永不进 `attributes`**。

   > **为什么函数不丢弃**：`itemRenderer` / `cellRenderer` 这类**已被控件声明**的逐项渲染委托就在 `props` 里，而 core 在运行时**无法区分**"声明的渲染委托"与"游离的函数键"（两者都是 `typeof === 'function'`）。丢弃会打断前者，所以 core 只做**通道约束**：函数永远不许进 DOM 属性通道（`attributes`），是否消费由控件负责。
   > 函数漏进 DOM 的唯一两条路径——「attrs 透传」与「整袋 spread」——分别由本规则和 §1.6 守卫测试堵住。

### 1.4 适配层（各一行，零判定）

```ts
vui:  h(Comp, { ...std.props, ...std.attributes })                     // 零键名翻译
rui:  createElement(Comp, {
        ...std.props, ...std.attributes,
        className: std.props.class, htmlFor: std.props.for,            // React 只此两处例外
      })
sui:  { ...std.props, ...std.attributes }                              // Svelte 5：snippet 就是 prop
```

### 1.5 迁移对照

| 旧写法 | 新写法 |
|---|---|
| `interface UiProps { [key: string]: unknown }` | 去掉索引签名，只留 `class` / `style` / `htmlAttributes` + `data-*` / `aria-*` 放行 |
| 标准形态 `className` / `htmlFor` | `class` / `for`（`uiRenderProps` 不再改名） |
| `vueRenderProps(props)`（键名翻译） | **删除**；vui 直接用 `${...std.props, ...std.attributes}` |
| `{...props}` 整袋 spread 到 DOM | `${...std}` 两段展开（`props` 给控件、`attributes` 给根节点） |
| `props['任意键']` 裸读 | 具名成员；确实灵活的在具体 `UiXxxProps` 声明 |
| `slots?: UiSlots`（`[index: string]: any`） | core 具名 `UiXxxSlots<TNode>` |
| `slots?.header?.()` 各写一份 | `uiSlot(slots?.header, fallback)` |
| `class: textInputModifierClasses(props).flat().filter(Boolean).join(' ')` | `uiClassName(textInputModifierClasses(props), props.class)` |

**索引签名现状（4 处，逐处处置）**：

| 位置 | 现状 | 处置 |
|---|---|---|
| [packages/vui/src/ui/factory.ts:199](../../packages/vui/src/ui/factory.ts) | `interface VueUiFactory extends UiFactory<VNode> { [index: string]: any }` | 收成具名（皮肤漏实现 / 写错控件名必须报错）；如将来确有扩展位，让 core 出 `UiFactory<TNode, TExtra>` 泛型 |
| [packages/vui/src/app/app.ts:54](../../packages/vui/src/app/app.ts) | `ImportAndExportActionProps { [index: string]: any; … }` | 删；保留已具名的 6 个成员（顺带 `hasTepmlate` → `hasTemplate`） |
| [packages/vui/src/ui/factory/auth.ts:20](../../packages/vui/src/ui/factory/auth.ts) | `SigninFormSlots { [name: string]: unknown; … }` | 删；槽表具名 |
| [packages/vui/src/ui/layout.ts:42](../../packages/vui/src/ui/layout.ts) | `UiSlots = { [index: string]: any; … }` | 删；换 core 具名 `UiXxxSlots` + `UiSlot` |

**袋工具处置**（实测用量，生产代码、排除测试）：

| 工具 | 用量 | 处置 |
|---|---|---|
| `getProp` / `addProp` / `hasPropEx` / `addDefaultProp` | **0 处** | 删 |
| `hasProp` | 4 处 / 1 文件 | 删或改收 `Record<string, unknown>` |
| `ignoreNullishProps` / `copyProps` / `selectProps` / `addDefaultProps` | 4 / 2 / 1 / 1 处 | 改收 `Record<string, unknown>`（它们操作的是普通对象，不该绑 `UiProps`） |
| `callUiBagFn` | 6 处 / 3 文件 | 归口 `vueUpdateOf` 后删 |

**迁移面现状**：`uiRenderProps(` 已 **188 处 / 136 文件**，`htmlAttributesOf(` 仅剩 **2 处 / 1 文件**——拆袋迁移**已落地**，本轮是收尾而非推倒。`UiXxxProps` 接口 **114 个**，全部继承新 `UiProps`。

### 1.6 验收

1. **类型**：`packages/core` 生产代码零 `[key: string]` / `[index: string]`；`Ui*Props` 里无索引签名；`class` / `style` 为 `UiClassValue` / `UiStyleValue`。
2. **单测**（core）：`uiRenderProps` —— `class` 数组 / 假值收成串；`style` 字符串解析成对象；`for` 原名保留；`htmlAttributes` 压平进 `attributes`；剩余标量进 `attributes`；**函数与对象被丢弃且 dev 报错**；`onUpdate*` 不出现。
3. **单测**（vui）：渲染到 DOM 的结果——`class` 正确、无 `[object Object]`、无 `header="() => …"` 这类函数属性。
4. **守卫测试**（扫源码，参照 `packages/vui/src/__tests__/layer_boundary.test.ts` 的做法）：
   - 禁止 `h(` / `createElement(` 上出现整袋 `{...props}` / `{...rest}` spread；
   - 禁止 `Ui*Props` / `Ui*Slots` 接口内出现字符串索引签名；
   - 要求 `Ui*Props` 中的函数型成员在实现侧有显式消费点（Vue：进 `props` 选项）。
5. **行数**：`packages/vui/docs/` 下与本文冲突的用法表（`vui.md` 索引、各控件 `_usage.md` 的 `className` / `htmlFor` 示例）随迁移更新。

### 1.7 取代旧稿的三条

[`ui_prop_channels_design.md`](../../packages/core/docs/ui/ui_prop_channels_design.md) 中下列三条以本文为准：

| 旧稿 | 本文 |
|---|---|
| 标准形态 `className` / `htmlFor`，vui 译回 `class` / `for` | 标准形态即 `class` / `for`（D4），vui 零翻译 |
| `UiProps` 带索引签名、袋在边界保留 | 无索引签名、无 `UiBag`（D2 / D3） |
| `slots` 不进袋、第二参 | 保留；并补 `UiSlot` 形状、空区域唯一出口 `uiSlot`（D6） |

### 1.8 待拍

| 项 | 说明 |
|---|---|
| `packages/vui/src/utils/resolve_slots.ts` | 5 个函数（`resolveSlot` / `resolveWrappedSlot` / `isSlotEmpty` …）**0 个调用点**，只被 barrel 再导出。处置：删（空区域归口 `uiSlot`），或扶正成唯一消费点 |
| `UiFactory` 扩展位 | [packages/vui/src/ui/factory.ts:199](../../packages/vui/src/ui/factory.ts) 收成具名后，皮肤新增控件是否需要 core 侧泛型扩展位 |
| 逐项渲染委托的边界 | `UiListColumnProps.cellRenderer` 进列配置（对齐各生态惯例）；控件级（如 `rowClassName`）留 props —— 逐控件清点时再定 |

---

对照源码：`packages/core/src/ui/`（契约）、`packages/vui/src/`（落地）、`packages/vui-*/src/`（皮肤）。
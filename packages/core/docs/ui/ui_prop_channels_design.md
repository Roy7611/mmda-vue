# UI Props 标准形态设计（袋 → 渲染前标准形态）

产品分层仍是 **UI → Logic → Data**（[ARCHITECTURE.md](../../../../ARCHITECTURE.md)）。四职拆分见 [ui_four_roles_design.md](./ui_four_roles_design.md)，程序员用法见 [ui_four_roles_usage.md](./ui_four_roles_usage.md)，术语与命名见 [naming.md](../../../../docs/naming.md)。

契约源码：[`props.ts`](../../src/ui/props.ts)（`uiRenderProps`）、[`css.ts`](../../src/ui/css.ts)、[`events.ts`](../../src/ui/events.ts)。

## 要解决的两个目标

1. 程序员写 `factory.textInput(...)` / `builder.grid(metaUi, props)`，传的是**标准化的 MMDA 参数类型**（`UiTextInputProps` / `UiGridProps`…），不必知道皮肤，也不必知道 Vue。
2. core **跨 vue / react**：参数类型与接口统一，vui / rui 只做极少转换就能直接喂 `h` / `createElement`。

## 为什么改

现状：`UiProps` 是**一个袋子**——`class` / `style` + 索引签名 + 袋键 `htmlAttributes`，控件具名参数、原生属性、事件回调全在里面；实现层到了控件/皮肤那一步，必须自己再判断"这把键该去哪条路"。

实测（改前，`packages/**` 排除 `node_modules` / `dist`）：

| 现象 | 实测 | 后果 |
|---|---|---|
| 原生属性透传靠人肉 | `htmlAttributesOf(` 调用点 **189 处 / 136 个文件** | 同一件事写在 130 多个地方 |
| 事件别名归一重复 | `callUiBagFn(` **54 处 / 26 个文件**；vui 里普遍是 `onUpdate:modelValue` + `onUpdate` 两连击；皮肤 `vui-syncfusion/src/factory/index.ts:234` 再归一一次 | 归一规则有 N 份 |
| class 归一散落 | `.flat()` 出现在 **116 个文件**（`<modifierClasses>.flat().filter(Boolean).join(' ')`） | 归一模版人手一份 |
| 厂商 args 进契约 | `Ui*ChangeEvent.native` **7 处写入、0 处读取** | 死字段；Logic 一旦读它就绑死皮肤 |
| Vue 专属词进 core 契约 | core 里 **6 处 `onUpdate?:` 声明**（Vue 的 v-model 形状） | 框架细节泄漏给 Logic / Data |

## 一、四层职责

| 层 | 输入 | 输出 | 明确不管 |
|---|---|---|---|
| Logic / 元数据 | 业务数据 | **袋**（`UiProps`，宽松、任意键） | 不关心 Vue / React 词 |
| **core** | 袋 | **标准形态**（`uiRenderProps`，框架无关，纯 JS） | 不 import vue / react；不认 `emits` / `attrs` / `slots` |
| **vui / rui** | 标准形态 | `h(...)` / `createElement(...)` | 只做键名映射（vui 两处），不做判定 |
| 皮肤 | 标准形态 / 袋 | 厂商控件参数 | 厂商 args → 标准事件，不再自己归一类名 |

一句话：**判定只有一份、在 core；运行时只做键名翻译。**

## 二、标准形态（core 契约）

`uiRenderProps(props)` → `{ props, attributes, className, style }`：

| 袋里的东西 | 标准形态 | 依据（jsdom 里用真 Vue 3.5.43 / React 19.3 实测） |
|---|---|---|
| 具名参数（`value` / `placeholder` / `disabled`…） | 原样进 `props` | 两边都吃 |
| `onXxx` 回调 | 原样进 `props` | 两边都认 `onXxx` |
| `class`（数组 / 字符串 / 假值） | `className`，**字符串** | 数组直传两边都静默拼成 `class="a,b,false,"`；React 另报 `Invalid DOM property \`class\`` |
| `style`（对象 / 字符串） | `style`，**对象** | React 见字符串 style **抛错**、整棵子树死；Vue 两种都吃 → 取交集 |
| 袋键 `htmlAttributes` | **压平进 `attributes`** | 嵌套对象两边都渲染成 `htmlattributes="[object Object]"` |
| `for` | 规范成 `htmlFor` | React 报 `Did you mean \`htmlFor\``；Vue 把 `htmlFor` 渲成 `htmlfor`（不是 `for`） |
| Vue 的 `onUpdate` / `onUpdate:modelValue` | **不进标准形态** | React：`Unknown event handler property … It will be ignored.` |
| `key` | 原样留在 `props` | 两边都自己从 props 里摘（`vnode.key` / `element.key`） |
| `slots` | 不进袋、不进标准形态 | 仍是工厂 / builder 的第二参（`UiXxxSlots`） |

同一份标准形态分别喂两边（实测收口）：

| | Vue `h(type, …)` | React `createElement(type, …)` |
|---|---|---|
| 适配量 | `{ ...std.props, ...std.attributes, class: std.className, style: std.style, for: std.htmlFor }` | `{ ...std.props, ...std.attributes, className: std.className, style: std.style }` |
| 渲染结果 | `<input class="a b" style="color: red;" id=… data-…>` 零告警 | **逐字节相同**，零告警 |

## 三、命名规范

| 函数 | 职责 | 前缀 | 位置 |
|---|---|---|---|
| `uiCssClass(block, element?, modifier?)` | 造**一个** BEM 名（原语） | 加 `mmda-`（`UI_CSS_PREFIX`） | `core/src/ui/css.ts` |
| `uiClassModifiers(block, ...modifiers)` | block + 一组修饰符名（BEM 组合器） | 加 `mmda-` | 同上 |
| `uiClassName(...parts)` | **合并**已有 class 段（string / 数组 / 假值），不造前缀 | 不加 | 同上 |
| `uiRenderProps(props)` | 袋 → 标准形态（**唯一拆分点**） | — | `core/src/ui/props.ts` |
| `vueRenderProps(props)` | 标准形态 → `h` 能直接吃的 props（`className`→`class`、`htmlFor`→`for`） | — | `vui/src/ui/vue_ui_props.ts` |
| `vueUpdateOf(props)` | Vue v-model 写入回调（`onUpdate` → `onUpdate:modelValue`）**唯一出口** | — | 同上 |

规则一句话：`uiCssClass` 是造 BEM 名的原语，`uiClass*` 都是"处理一组 class"（`Modifiers` 造名、`Name` 合并）；`ui*Props` 是 props 形态转换。原 `uiCssClasses` 已改名 `uiClassModifiers`。

## 四、事件规范

1. **`onChange` 只表示"受控值被替换"**，实参**单值**：`onChange(value)`，与控件值 prop 同型。选中 / 导航 / 动作各自留名（`onSelect` / `onSelectionChange` / `onNodeSelect` / `onRangeChange`…），语义清楚优先。
2. **连带信息做进值对象或另立事件**：range 类收成单对象参（`onRangeChange({ start, end })`）；签名板的 `action` 走 `onAction(action)`，`onChange` 只给值。
3. **非值变化事件一律对象**，类型名 `Ui<领域><事件名>EventArgs`，全部 `extends UiEventArgs`（`core/src/ui/events.ts`）。基座是空标记基座：
   - **不放 `action`**：事件名已经说清动作时不重复；一个事件名覆盖多个动作的（`onCardChange` 覆盖 add / update / delete / move），由**那个事件自己的类型**声明必填 `action`；
   - **不放厂商 args**：厂商细节留在皮肤，谁要暴露谁在自己的 EventArgs 子类型上加字段（改前 `native` 7 处写入、0 处读取，已删）。
4. **可否语义用返回值**：handler 返回 `false` = 取消这次变更（`emitKanbanChange` / `emitSchedulerChange` 按 `!== false` 收口），不引入 `cancel` 字段。
5. **core 契约不声明 `onUpdate` / `onUpdate:modelValue`**（改前 6 处声明已删）；那是 Vue 的 v-model 形状，取值归口 `vueUpdateOf`。
6. **`onUpdate:<name>`（Vue 多 v-model）是 vui / 皮肤侧的糖，core 契约不出现**。它合法（`v-model:nodes` 编译出来就是 prop `nodes` + 监听器 `onUpdate:nodes`，Vue 运行时用 `isModelListener` 特判该前缀），但属运行时形状：取值归口 `vueUpdateOf(props, 'nodes')`。控件侧的标准事件是 `onXxx` —— 值变化 `onChange`（单值），一份控件值分几份就各自命名，如 diagram 的 `onNodesChange(nodes)` / `onConnectorsChange(connectors)`。
7. 框架事件对象（DOM `Event` / React 合成事件）留在皮肤，不进契约。

## 五、实现（vui / rui）

**vui**（[`vue_ui_props.ts`](../../../vui/src/ui/vue_ui_props.ts)）：

```ts
h(type, vueRenderProps(props)) // 两处键名映射：className→class、htmlFor→for
props.onChange?.(v)            // 值变化
vueUpdateOf(props)?.(v)        // v-model 写入（onUpdate / onUpdate:modelValue）
```

**rui**（计划中）：`createElement(type, { ...std.props, ...std.attributes, className: std.className, style: std.style })` —— 键名零映射。

皮肤只做厂商参数映射（EJ2 `change` → 标准事件），不再自己拆袋、不再自己归一别名。

## 六、迁移对照

| 旧写法 | 新写法 |
|---|---|
| `...htmlAttributesOf(props)` | `...vueRenderProps(props)`（或 core 的 `std.attributes`） |
| `class: textInputModifierClasses(props).flat().filter(Boolean).join(' ')` | `uiClassName(textInputModifierClasses(props), props.class)` |
| `callUiBagFn(props, 'onUpdate:modelValue', v)` + `callUiBagFn(props, 'onUpdate', v)` | `vueUpdateOf(props)?.(v)` |
| 皮肤里 `props.onChange ?? props.onUpdate ?? props['onUpdate:modelValue']` | `props.onChange ?? vueUpdateOf(props)` |
| 把 `props.class` / `props.style` 当具名 props 读 | 走 `vueRenderProps(props).class` / `.style`（已归一） |
| `class: _className` 解构后弃用 | 并进 `vueClassName(...)`，与自算 modifier class 合并 |
| 事件类型 `Ui*ChangeEvent` | `Ui*ChangeEventArgs extends UiEventArgs` |
| 事件对象里 `native: args` | 删除（厂商 args 留皮肤） |

迁移面（数字）：`htmlAttributesOf(...)` **189 处 / 136 文件**、`callUiBagFn(...)` **54 处 / 26 文件**、`.flat()` 归一模版 **116 个文件**。

## 七、验收

- core：`uiClassName` / `uiClassModifiers` / `uiRenderProps`（class 收串、style 收对象、`htmlAttributes` 压平、`onUpdate*` 过滤、`for`→`htmlFor`）—— `packages/core/src/__tests__/ui_props.test.ts`。
- vui：`vueRenderProps` 的键名映射与**渲到 DOM 的结果**（class 正确、无 `[object Object]`）、`vueUpdateOf`、`vueClassName` —— `packages/vui/src/__tests__/vue_ui_props.test.ts`。
- 跨框架一致性（临时探针，React 不是本仓依赖）：同一份标准形态喂 `h` 与 `createElement`，断言 DOM 逐字节相同、零 `console.error`。

## 八、非目标（本轮不做）

- 不改 Builder / Factory / Layout 的方法签名（`props?: UiXxxProps` + `slots?` 照旧）
- 不把 `emits` / `attrs` / `slots` 做成 Logic 可见的 core 契约字段
- 不放弃"元数据驱动 + Logic 直接塞袋"（袋在 Logic / Data 边界保留）
- 不让皮肤各留一份别名归一
- 不整份 props spread 到厂商控件（只 spread 到根节点 / 真实 input）
- 不为 rui 预抽象

## 相关文档

| 文档 | 内容 |
|---|---|
| [naming.md](../../../../docs/naming.md) | 术语与命名 |
| [ui_four_roles_design.md](./ui_four_roles_design.md) | layout / fieldFactory / factory / builder 四职 |
| [ui_four_roles_usage.md](./ui_four_roles_usage.md) | 程序员怎么写 |
| [ui.md](../ui.md) | core `src/ui/` 总览 |
| [factory.md](../../../vui/docs/factory.md) | vui 实现侧 |
| [ARCHITECTURE.md](../../../../ARCHITECTURE.md) | 分层真源 |

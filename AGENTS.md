# MMDA 代理说明

产品分层 **UI → Logic → Data** 以 [ARCHITECTURE.md](ARCHITECTURE.md) 为准（只在那里写全）。术语见 [docs/naming.md](docs/naming.md)。

## 文件编码（必读，老忘记）

- **一律 UTF-8，无 BOM**。中文注释、文档、规则、源码都如此。
- **禁止 UTF-16**（Windows PowerShell 用 `>` / `Out-File` 默认常写出 `FF FE`，IDE 里像「字间空格」乱码）。
- 改含中文的文件：用编辑器 `Write` / `StrReplace`，或 Python `Path.write_text(..., encoding='utf-8')`。不要用 PowerShell 重定向写源码/Markdown。
- 写入后若中文变 `����` 或一字一空格，先查字节头：`FF FE` = UTF-16，立刻重写成 UTF-8。

## 目的

- **Logic（交互逻辑）**：显示、锁定、校验、引用加码、`onChange`、业务动作。纯 TypeScript，无 Vue/React 类型。只认 core **`UiContext` 接口**，不要写成 vui `VueUiContext` 类。
- **Data**：元数据、`MetaModel`、`ApiClient`。不要自己拼 HTTP，不要改写共享元数据。
- **UI**：vui + 皮肤配置与展现，挂上 Logic。不写业务计算。控件在皮肤 `components/`，`factory/` 用元数据生产，vui Builder 只拼复杂视图。不要把厂商表格写进 `@mmda/vui`。`VueUiContext` 对标 Flutter `BuildContext`，给渲染 / 拼屏用。

## 会话上怎么走

- 通用读写：`context.apiClient`（与 `this.apiClient` 同一实例）。不必在 Logic 再包一层 `get`/`doAction`。
- 业务多出来的函数：Logic 组装到 `context`。
- UI：`context.uiBuilder`（core 统一接口；vui/rui 实现）。
- 应用壳：`context.app`（core abstract class **`MmdaApplication`**；vui **`MmdaVueApp`**，不是 Vue `App`）。业务读 **`app.state`**。弹层走 `app.ui` / `context.uiBuilder`，不要 `app.confirm`。
- 选记录：`searchRelative` 无 UI；`select(field)` 写回字段；`select({ repository })` 选仓库实体。本地行用 `MetaUiBuilder` + `factory.table` + `dialog`。
- **子表数据只走会话 API**：`context.addSubGroupItem` / `addSubGroupItems` / `removeSubGroupItem` / `removeSubGroupItems`（`newSubGroupItem` 内部已含增删）。**不要直接 `model[groupName].push(...)` / `splice(...)`** —— 绕过 API 不会触发组的 `onChange` 与 `aggregateWith` 合计（合计是程序员改主表合计字段的地方）。`createSubGroupItems` 只造实体、**不追加**（`MetaModel` 的 `addToTarget` 默认 `false`），追加仍要调 `addSubGroupItem`。
- `globalProps` 只是把 Vue `globalProperties` **传递**下来，极少用。不要日常掏 `$ui` / `$api`。

## 原则

层只与相邻层交互。皮肤不感知 Data。数据向下、事件向上。会话通用读写走 `context.apiClient`。

`@mmda/core` 的 `src/logic/` 属于 **Logic 层**；`metaui` / `models` / `net` / … 属于 **Data**。不要把 `logic` 当成 Data 子模块。应用壳在 `src/mmda_app.ts`（abstract class `MmdaApplication`），不放进 `logic/`。UI 契约在 `src/ui/`。

从 `@mmda/core` 顶层导入，不要 `@mmda/core/src/...`。

实现具体的皮肤控件库要尽可能使用厂商已有能力，不要重复造轮子。

## 设计：class / interface

按 C# / Java 看架构：先定主人、命名和约定，再用 `interface` / `class` 落地。运行时是 JS；设计和分层按 OO。不要把 TS 写成无主函数拼盘。

- **先找主人，再写形态。** 行为跟主题走（过滤在 `metaui_filter`，字段声明在 `MetaUiField`）。跟类相关的（含静态方法，像 `Math`）归到抽象类 / 实现类，不要旁路 `export`。
- **文件内局部函数可以。** 与类无关、不 `export`、只在本文件用的辅助可以。一 `export` 就要有主人，除了utils工具类通用函数。
- **`interface` 是契约，`class` 是实现。** 有身份、生命周期、继承或一组相关问句，用 class。不要「没状态就独立函数」。习惯上使用接口编程，隐藏实现细节。**面向 core 的 `UiContext` / `UiBuilder` 等接口编程，不对运行时类型（`VueUiContextBase` / `ReactUiContextBase`）做向下转型。** 可以用模板方法的时候用抽象类增加代码复用，原则是不要出现大段重复代码。
- **对外只留问句。** 推导步骤留在内部，不要为每一步导出 `*Of` / `is*`。
- **禁止函数爆发。** 同一件事出现第二次，回到主人上改，不要再写姐妹函数。
- **枚举 / 类型：共用才定义并 export。** 业务代码用成员，不要写字符串字面量。三元组（序号 / code / 文案）走已有 `Xxx` + `XxxEnum`（`valueOf` / `textOf`），见 [docs/naming.md](docs/naming.md) 业务枚举成员。

字段引用见 `.cursor/rules/mmda-field-reference.mdc`。core 模块说明见 `packages/core/docs/index.md`。

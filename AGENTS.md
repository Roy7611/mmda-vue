# MMDA 代理说明

产品分层 **UI → Logic → Data** 以 [ARCHITECTURE.md](ARCHITECTURE.md) 为准（只在那里写全）。术语见 [docs/naming.md](docs/naming.md)。

## 文件编码（必读，老忘记）

- **一律 UTF-8，无 BOM**。中文注释、文档、规则、源码都如此。
- **禁止 UTF-16**（Windows PowerShell 用 `>` / `Out-File` 默认常写出 `FF FE`，IDE 里像「字间空格」乱码）。
- 改含中文的文件：用编辑器 `Write` / `StrReplace`，或 Python `Path.write_text(..., encoding='utf-8')`。不要用 PowerShell 重定向写源码/Markdown。
- 写入后若中文变 `����` 或一字一空格，先查字节头：`FF FE` = UTF-16，立刻重写成 UTF-8。

## 目的

- **Logic（交互逻辑）**：显示、锁定、校验、引用加码、`onChange`、业务动作。纯 TypeScript，无 Vue/React 类型。只认 core **`UiContext` 接口**，不要写成 vui `UiBuildContext` 类。
- **Data**：元数据、`MetaModel`、`ApiClient`。不要自己拼 HTTP，不要改写共享元数据。
- **UI**：vui + 皮肤配置与展现，挂上 Logic。不写业务计算。控件在皮肤 `components/`，`factory/` 用元数据生产，vui Builder 只拼复杂视图。不要把厂商表格写进 `@mmda/vui`。`UiBuildContext` 对标 Flutter `BuildContext`，给渲染 / 拼屏用。

## 会话上怎么走

- 通用读写：`context.apiClient`（与 `this.apiClient` 同一实例）。不必在 Logic 再包一层 `get`/`doAction`。
- 业务多出来的函数：Logic 组装到 `context`。
- UI：`context.uiBuilder`（core 统一接口；vui/rui 实现）。
- 应用壳：`context.app`（core abstract class **`MmdaApplication`**；vui **`MmdaVueApp`**，不是 Vue `App`）。业务读 **`app.state`**。弹层走 `app.ui` / `context.uiBuilder`，不要 `app.confirm`。
- 选记录：`searchRelative` 无 UI；`select(field)` 写回字段；`select({ repository })` 选仓库实体。本地行用 `MetaUiBuilder` + `factory.table` + `dialog`。
- `globalProps` 只是把 Vue `globalProperties` **传递**下来，极少用。不要日常掏 `$ui` / `$api`。

## 原则

层只与相邻层交互。皮肤不感知 Data。数据向下、事件向上。会话通用读写走 `context.apiClient`。

`@mmda/core` 的 `src/logic/` 属于 **Logic 层**；`metaui` / `models` / `net` / … 属于 **Data**。不要把 `logic` 当成 Data 子模块。应用壳在 `src/mmda_app.ts`（abstract class `MmdaApplication`），不放进 `logic/`。UI 契约在 `src/ui/`。

从 `@mmda/core` 顶层导入，不要 `@mmda/core/src/...`。

字段引用见 `.cursor/rules/mmda-field-reference.mdc`。core 模块说明见 `packages/core/docs/index.md`。

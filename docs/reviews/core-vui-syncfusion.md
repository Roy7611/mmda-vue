# core / vui / vui-syncfusion 评估（工作稿）

> **不是架构真源。** 分层以 [ARCHITECTURE.md](../../ARCHITECTURE.md) 为准。本文是反复打分、收口用的工作稿：新开会话时把本文件 + 三个包源码交给代理，对照「仍开」项再评一次，直到满意。

- **范围：** `@mmda/core`、`@mmda/vui`、`@mmda/vui-syncfusion`
- **对照：** [ARCHITECTURE.md](../../ARCHITECTURE.md) 的 UI → Logic → Data
- **原则：** 看分层、命名与代码现状，不是再搬一次目录
- **分数：** 10 分制，相对本仓目标分层，不是相对业界 UI 框架，也不是测试覆盖率
- **最新快照：** [2026-09-06 晚重评](#快照-2026-09-06-晚重评)（文末）

## 新开会话怎么评

把下面这段交给代理即可：

```text
对照 docs/reviews/core-vui-syncfusion.md 与 ARCHITECTURE.md，
重新评估 packages/core、packages/vui、packages/vui-syncfusion。
保留原表结构（架构 / 设计 / 代码质量），更新分数和「仍开」清单；
已落地的项移到「已处理」，不要为已修的债再扣同一分。
```

---

## 快照 2026-09-06（Canvas：Core Vui Syncfusion Review）

当时总评：方向对；实现仍是 mixin + 双路径；皮肤最重（`factory.table` 仍是现网表格）。

包边界已经能讲清：core 无 Vue、无厂商控件；vui 不 import EJ2；皮肤只该生产控件。真正的债在契约与实现不一致：`UiContext` 上的通道是可选的、vui 会话没有 `apiClient`、Builder 仍管单元格、皮肤表格还在约 1400 行的 `factory.table`。先收敛这些，不要再拆目录。

### 按包打分（当时）

| 包 | 架构 | 设计 | 代码质量 | 一句话 |
|---|---|---|---|---|
| `@mmda/core` | 7.5 | 7 | 6.5 | 契约目录对了；HTTP 双栈、any、UiContext 过胖 |
| `@mmda/vui` | 6.5 | 6 | 5 | 无厂商表格；6 个 ts-nocheck mixin；UiBuilder 名字撞车 |
| `@mmda/vui-syncfusion` | 5.5 | 5 | 4.5 | Component / Factory 文档与现网路径相反 |

### 架构：分层与依赖

| 规则 | core | vui | vui-syncfusion |
|---|---|---|---|
| 层只碰相邻层 | Data 不 import logic；ui 无 Vue | 只依赖 core + Vue peers | 仍碰 MetaModel、fetchApi、api.config.service |
| 皮肤不感知 Data | 合约在 `src/ui/` | 拼屏走 `factory.table` / `buildView` | 表格、附件、外链单元格直接读 Data |
| Logic 无 Vue | 通过；EntityLogic 仍包一层 HTTP | 业务钩子应认 `UiContext`；实现类是 `UiBuildContext` | Builder 里拼鉴权工具栏（产品策略） |
| 换皮只换皮肤 | `UiBuilder<TNode>` 够用 | `VueUiBuilder` 另有约 150 个方法 | `SyncfusionUiBuilder` 不重写列表查询，这点对 |

**已经立住：** core 运行时依赖只有 luxon / pluralize。vui 源码不 import Syncfusion / PrimeVue / ag-grid。列表查询拼装在 vui（`searchParam` / `filterModel`），皮肤表格只回写 filter/sort。`MmdaApplication`（abstract）与 `MmdaVueApp` 的壳分层与文档一致。

**依赖上的裂缝（当时）：** `UiContext` 类型依赖 FieldLogic / GroupLogic，形成 ui ↔ logic 类型环。`metaui_service` 依赖 net（文档已开例外）也依赖 models 类型。皮肤 `SfAttachmentPanel` 调 `fetchApi.uploadFiles`。vui 会话类没有 `apiClient`，和文档「走 `context.apiClient`」对不上。

**三条通道没有选边（当时）：** 文档说通用读写走 `context.apiClient`；`EntityLogic` 注释说永远不要用它，只用 `this.apiClient` / `getAll` / `doAction`；vui `UiViewContext` 两者都不挂 `apiClient`。

### 设计：命名与概念

| 概念 | 当时怎么叫 | 当时的问题 |
|---|---|---|
| 拼屏契约 vs 实现 | core `UiBuilder` / vui `VueUiBuilder` | vui 再 `export type UiBuilder = VueUiBuilderHost`，把核心接口盖掉 |
| 是/否 vs 弹层 | `confirm` / `dialog` | 旧名已删；list/tree 仍按 overlay 的 `"yes"` 字符串判断 |
| 选记录 | `searchRelative` / `select(field)` / `select(repo)` | 三条语义清楚；皮肤相对搜索仍猜 `categoryName` / `name` / `label` |
| 列表控件 | list / table / grid | 文档对；现网仍是 `factory.table`，`components/SfGrid` 是另一套 |
| 应用状态 | `app.state` | 壳改名完成；`globalProperties` 仍装 `$api` / `$ui` |
| 元数据拼列 | `MetaUiBuilder` | 与 `UiBuilder` 易混，但职责其实清楚（Data 拼 MetaUi） |

当时标记：`select` / `confirm` / `MmdaVueApp` 已对齐文档；`UiBuilder` 双定义；`$v` 仍是 Vuelidate 口音；HTTP：`FetchApi` 与 `FetchClient` 并存。

#### 模块切分（文件级，当时行数）

| 热点文件 | 行数 | 职责是否单一 |
|---|---|---|
| `core/net/fetch_api.ts` | ~1007 | 新 HTTP 栈；与 deprecated `http.ts` 叠床 |
| `core/metaui/metaui_field.ts` | ~725 | 字段元数据过宽（校验、引用、列筛） |
| `vui/builders/list.ts` | ~1065 | 列表页 + 单元格管道 + 行菜单 |
| `vui/ui_context.ts` | ~967 | 已拆 `contexts/`，门面仍过重 |
| `vui-syncfusion/factory/table.ts` | ~1432 | 现网表格：列、筛、虚滚、行内编 |
| `vui-syncfusion/style.css` | ~2736 | Material3 全量 import + 手写 palette |

### 代码质量（当时）

- **core 类型：** 生产代码约 286 处 `any`；0 个 `ts-nocheck`。`Entity` 是索引 `any`。`UiContext` 上 `app` / `apiClient` / `uiBuilder` 都是可选。Group 自定义渲染仍是 `Function`。
- **vui mixin：** form / list / tree 与三个 context mixin 全部 `@ts-nocheck` + `Object.assign(prototype)`。类型检查覆盖不到拼屏主体。
- **皮肤双表格：** `factory/table.ts` 与 `components/SfGrid.ts` 两套 `SfGrid` 名字。host 也叫 `SfGrid`。测试几乎只打旧路径。EJ2 全局 monkey-patch。

#### 已核实的行为债（当时）

| 级别 | 位置 | 现象 |
|---|---|---|
| 缺陷 | vui `list.ts` / `tree.ts` | `confirm()` 已返回 boolean，调用方仍判断 `!== "yes"`，删除确认会直接 return |
| 契约缺口 | vui `ui_context.ts` | 实现 core `UiContext`，但不提供 `apiClient` |
| 架构违规 | core `field_logic.ts` | `refLabelFn` 写回 `field.reference.labelFn`（共享元数据） |
| 边界 | vui-syncfusion `SfAttachmentPanel` | 组件内拼 files URL、调 `fetchApi.uploadFiles` |
| 命名 | vui `ui_builder.ts` | `export type UiBuilder = VueUiBuilderHost` 盖掉 core 接口 |

#### 测试（当时）

core 约 29 个测试文件，搜索 / MetaModel / FieldLogic 较实；`mmda_app` 无测。vui 约 130 例，会话树和 categoryList 较好；overlay / `select` / EntityView 薄。皮肤几乎一个 `syncfusion.test.ts`（~2300 行）+ TreeGrid 列映射；`components/SfGrid` 无测。日期 BETWEEN / format 崩溃已有锁，但锁的是 `factory.table`。

#### 公开 API 卫生（当时）

core 仍导出 `FetchClient` / `OAuthApiClient` / `ApiError`。`logic/ui_builder.ts` 与 `ui_types.ts` 已无引用。vui 仍导出 `PrimeVueUiFactory`、`primeVueTable`。皮肤保留 PascalCase 字段别名、`negativenumberInput`、`pagableTable`。兼容有成本，应标弃用期限。

### 当时建议顺序

| 优先级 | 动作 | 为什么先做 |
|---|---|---|
| 1 | 修 confirm boolean vs `"yes"`；选一条 Data 通道并改文档/基类注释 | 现网行为 + 程序员心智，改动面小 |
| 2 | vui 去掉 `type UiBuilder` 别名；会话补上 `apiClient`；删死 shim `logic/ui_builder.ts` | 契约立刻可读 |
| 3 | 皮肤只保留一条表格路：现网继续 `table`，SfGrid 当目标；禁止两边同时加功能 | 否则复杂度只增不减 |
| 4 | 工具栏鉴权集合上收到 vui；皮肤只提供按钮控件 | 换皮才不必复制产品策略 |
| 5 | mixin 改成 typed class 方法，逐个去掉 `ts-nocheck`；HTTP 旧栈停止从 barrel 导出 | 质量债，适合分 PR |

---

## 快照之后已落地（同日稍后，供下次重评扣分时排除）

下列项**不要再当未修债**：

| 原建议 / 债 | 现状 |
|---|---|
| confirm `!== "yes"` | `list.ts` / `tree.ts` 已改 `if (!result) return` |
| Data 通道两边说 | `UiViewContext.apiClient` → `logic.apiClient`；`EntityLogic` 与 ARCHITECTURE 写明同一实例、CRUD 走 Logic 方法 |
| vui `export type UiBuilder = …` | 已删 |
| `VueUiBuilderHost` | 已删；注入类型是 `VueUiBuilder` |
| `logic/ui_*.ts` 死 shim | 已删 |
| 表格双写功能 | 文档约定：现网只在 `factory.table` 加功能；`SfGrid` 是目标 |
| Builder 继承图 | 已写入 ARCHITECTURE / vui `docs/builder.md` |

设计文档里的目标形状：

```text
UiBuilder              core 契约（框架无关）
    ↑ implements
VueUiBuilder           vui 抽象类：模板方法填共用拼屏（取代 AbstractUiBuilder）
    ↑ extends
SyncfusionUiBuilder / PrimeVueUiBuilder / …
                       皮肤：控件与壳的具体落地
```

## 仍开（下次会话优先）

1. 鉴权工具栏集合仍在皮肤 Builder（产品策略未上收到 vui）
2. form / list / tree 与三个 context mixin 仍 `@ts-nocheck`
3. `factory.table` 与 `components/SfGrid` 两套实现仍并存（只禁止双写，尚未合并）
4. HTTP 旧栈仍从 core barrel 导出
5. `UiContext` 上 `app` / `apiClient` / `uiBuilder` 仍可选；ui ↔ logic 类型环
6. `refLabelFn` 仍写回共享元数据
7. 皮肤 `SfAttachmentPanel` 仍直接 HTTP
8. `$api` / `$ui` 仍挂 `globalProperties`；`$v` 命名
9. 皮肤相对搜索仍猜字段名
10. 生产代码大量 `any`；`mmda_app` / `SfGrid` 契约路径测试薄

---

对照源码：`packages/core`、`packages/vui`、`packages/vui-syncfusion`。重评时在本文追加「快照 YYYY-MM-DD」，不要改掉上一份快照正文。

---

## 快照 2026-09-06 晚（重评）

当时总评：方向仍对；**契约裂缝已收口一截**（`apiClient`、confirm boolean、Builder 继承图、禁止表格双写）；实现主体仍是 mixin + 皮肤现网表格。分数变动几乎全在 `@mmda/vui`；core 与皮肤的「仍开」项与上午清单一致，不再为已落地项扣分。

### 按包打分（相对上午 Canvas 快照）

| 包 | 架构 | 设计 | 代码质量 | Δ | 一句话 |
|---|---|---|---|---|---|
| `@mmda/core` | 7.5 | 7 | 6.5 | 持平 | 通道注释已对齐；HTTP 双栈、`UiContext` 可选、`refLabelFn` 写元数据仍在 |
| `@mmda/vui` | 7.0 | 6.5 | 5.5 | +0.5 / +0.5 / +0.5 | 无厂商表格、会话有 `apiClient`；6 个 `ts-nocheck` mixin 仍挡住质量 |
| `@mmda/vui-syncfusion` | 5.5 | 5.5 | 4.5 | 设计 +0.5 | 继承与「只写 `factory.table`」写清了；现网仍碰 Data、鉴权工具栏仍在皮肤 |

### 架构：分层与依赖

| 规则 | core | vui | vui-syncfusion |
|---|---|---|---|
| 层只碰相邻层 | Data 不 import logic；ui 无 Vue | 只依赖 core + Vue peers | 仍碰 `MetaModel`、`fetchApi`、`api.config.service` |
| 皮肤不感知 Data | 合约在 `src/ui/` | 拼屏走 `factory.table` / `buildView`；列表查询在 vui | 表格显示、附件、外链、ref 清空仍读 Data |
| Logic 无 Vue | 通过；CRUD 走 Logic 方法 / 同一 `ApiClient` | 业务钩子认 core `UiContext`；Builder 用 `UiBuildContext` | Builder 里仍拼鉴权工具栏（产品策略） |
| 换皮只换皮肤 | `UiBuilder<TNode>` 够用 | `VueUiBuilder` 约 81 个方法（不是 150）；list 仍管单元格 | `SyncfusionUiBuilder extends VueUiBuilder`，不重写列表查询 |

**已经立住（含同日已落地，本快照不再扣分）：** core 运行时 luxon / pluralize；vui 不 import EJ2；`UiViewContext.apiClient` → `logic.apiClient`；confirm 调用方 `if (!result)`；无 `VueUiBuilderHost` / `export type UiBuilder`；死 shim 已删；列表查询在 vui；壳 `MmdaApplication` / `MmdaVueApp`。

**仍开的裂缝：** `UiContext` 上 `app` / `apiClient` / `uiBuilder` 仍可选；ui → logic 类型环仍在。皮肤 `SfAttachmentPanel` 仍 `(app.api as any).fetchApi.uploadFiles`。`refLabelFn` 仍写 `field.reference.labelFn`。

### 设计：命名与概念

| 概念 | 现在怎么叫 | 问题 |
|---|---|---|
| 拼屏契约 vs 实现 | core `UiBuilder` / vui `VueUiBuilder` | 别名已删；对齐 ARCHITECTURE 继承图 |
| 是/否 vs 弹层 | `confirm` / `dialog` | Builder 内部 overlay `"yes"` → boolean；调用方已按 boolean |
| 选记录 | `searchRelative` / `select(field)` / `select(repo)` | 皮肤相对搜索仍猜 `categoryName` / `name` / `label` / `text` |
| 列表控件 | list / table / grid | 现网 `factory.table`（~1436 行）；`components/SfGrid` 目标未接线 |
| 应用状态 | `app.state` | `globalProperties` 仍装 `$api` / `$ui`；`$v` 仍是 Vuelidate 口音 |
| 元数据拼列 | `MetaUiBuilder` | 与 `UiBuilder` 易混，职责仍清楚 |

#### 模块切分（本快照行数）

| 热点文件 | 行数 | 职责是否单一 |
|---|---|---|
| `core/net/fetch_api.ts` | ~939 | 新 HTTP 栈；barrel 仍导出 deprecated `http.ts`（~548） |
| `core/metaui/metaui_field.ts` | ~623 | 略缩；`metamodel.ts` ~616、`metaui_service.ts` ~537 也过宽 |
| `vui/builders/list.ts` | ~1065 | 列表页 + 单元格管道 + 行菜单；仍 `@ts-nocheck` |
| `vui/ui_context.ts` | ~972 | 已拆 `contexts/`，门面仍过重 |
| `vui-syncfusion/factory/table.ts` | ~1436 | 现网表格；文件头 `@ts-nocheck` |
| `vui-syncfusion/style.css` | ~2736 | Material3 全量 import + 手写 palette |

### 代码质量

- **core 类型：** 生产代码约 263 处 `any`（上午约 286）；0 个 `ts-nocheck`。`Entity` 索引 `any`。Group 自定义渲染仍是 `Function`。`mmda_app` 无测。
- **vui mixin：** 仍 6 个 `@ts-nocheck` + `Object.assign(prototype)`（form / list / tree / validate / reference / subgroup）。
- **皮肤：** 双表格未合并；测试仍几乎只打 `factory.table`（`syncfusion.test.ts` ~2312 行）；`components/SfGrid` 无测；EJ2 `Component.prototype` / `CheckBoxFilterBase` monkey-patch 仍在。

#### 行为债（本快照）

| 级别 | 位置 | 现象 | 相对上午 |
|---|---|---|---|
| 已修 | vui `list.ts` / `tree.ts` | confirm 按 boolean | 已处理 |
| 已修 | vui `ui_context.ts` | 提供 `apiClient` | 已处理 |
| 已修 | vui `ui_builder.ts` | 不再 alias 盖掉 core `UiBuilder` | 已处理 |
| 架构违规 | core `field_logic.ts` | `refLabelFn` 写回共享元数据 | 仍开 |
| 边界 | `SfAttachmentPanel` | 拼 files URL、调 `fetchApi.uploadFiles` | 仍开 |
| 产品策略错层 | 皮肤 `indexViewActionButtons` | 鉴权工具栏集合未上收 vui | 仍开 |
| 契约松 | core `UiContext` | 三通道可选 + ui↔logic 类型环 | 仍开 |

#### 公开 API 卫生

core barrel 仍导出 `FetchClient` / `OAuthApiClient` / `ApiError`（已 `@deprecated`）。vui 仍导出 `PrimeVueUiFactory`、`primeVueTable`。皮肤仍有 PascalCase 字段别名、`negativenumberInput`、`pagableTable`。

### 本快照建议顺序

| 优先级 | 动作 | 为什么先做 |
|---|---|---|
| 1 | 鉴权工具栏集合上收到 vui；皮肤只渲染按钮 | 换皮才不必复制产品策略；上午 #4，现为最大架构项 |
| 2 | 附件走 `context.apiClient`；相对搜索只信 `labelOf` | 立刻减轻「皮肤感知 Data」 |
| 3 | form/list/tree mixin 改 typed class，去掉 `@ts-nocheck` | 拼屏主体才进类型检查 |
| 4 | HTTP 旧栈停止从 core barrel 导出；`UiContext` 三通道改为必填（测试替身给 stub） | 契约可读 |
| 5 | `refLabelFn` 写 Logic 实例不写共享元数据；表格最终并到 `components/SfGrid` | 质量债，可分 PR |

### 仍开（下次会话优先）

1. 鉴权工具栏集合仍在皮肤 Builder
2. form / list / tree 与三个 context mixin 仍 `@ts-nocheck`
3. `factory.table` 与 `components/SfGrid` 两套实现仍并存（只禁止双写，尚未合并）
4. HTTP 旧栈仍从 core barrel 导出
5. `UiContext` 上 `app` / `apiClient` / `uiBuilder` 仍可选；ui ↔ logic 类型环
6. `refLabelFn` 仍写回共享元数据
7. 皮肤 `SfAttachmentPanel` 仍直接 HTTP
8. `$api` / `$ui` 仍挂 `globalProperties`；`$v` 命名
9. 皮肤相对搜索仍猜字段名
10. 生产代码大量 `any`；`mmda_app` / `SfGrid` 契约路径测试薄

上午「仍开」10 条本晚全部仍开；vui 分数上涨只来自已处理项不再扣分，不是这 10 条有关闭。

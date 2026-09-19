# core / vui / vui-syncfusion 评估（工作稿）

> **不是架构真源。** 分层以 [ARCHITECTURE.md](../../ARCHITECTURE.md) 为准。本文是反复打分、收口用的工作稿：新开会话时把本文件 + 三个包源码交给代理，对照「仍开」项再评一次，直到满意。

- **范围：** `@mmda/core`、`@mmda/vui`、`@mmda/vui-syncfusion`
- **对照：** [ARCHITECTURE.md](../../ARCHITECTURE.md) 的 UI → Logic → Data
- **原则：** 看分层、命名与代码现状，不是再搬一次目录
- **分数：** 10 分制，相对本仓目标分层，不是相对业界 UI 框架，也不是测试覆盖率
- **最新快照：** [2026-09-08 重评](#快照-2026-09-08-重评)（文末）

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

---

## 快照 2026-09-08（重评）

当时总评：vui **会话侧**收口了一截（Handbook class mixin、context 去掉 `@ts-nocheck`、`VueUiContext` 正名）；**拼屏与皮肤**没有跟着走。core 热点文件和 `any` 还涨了。换皮最大的洞仍是皮肤鉴权工具栏 + `factory.table`。

相对 09-06 晚：vui 设计/质量各 +0.5；core 质量 −0.5；皮肤质量 +0.5（插件测试铺开，主表格债未减）。

### 按包打分（相对 2026-09-06 晚）

| 包 | 架构 | 设计 | 代码质量 | Δ | 一句话 |
|---|---|---|---|---|---|
| `@mmda/core` | 7.5 | 7 | 6.0 | 质量 −0.5 | 契约未动；生产 `any` ~299（晚评 ~263）；`fetch_api` / `metaui_field` 回胀 |
| `@mmda/vui` | 7.0 | 7.0 | 6.0 | 设计/质量 +0.5 | 会话 mixin 已 typed；form/list/tree 仍 nocheck；`list_view` 更长 |
| `@mmda/vui-syncfusion` | 5.5 | 5.5 | 5.0 | 质量 +0.5 | 插件测试多了；鉴权工具栏、附件 HTTP、双表格、猜字段名仍在 |

### 架构：分层与依赖

| 规则 | core | vui | vui-syncfusion |
|---|---|---|---|
| 层只碰相邻层 | Data 不 import logic；ui 无 Vue | 只依赖 core + Vue peers；`ui/factory/` 是 props 契约不是 EJ2 | 仍碰 `MetaModel`、`fetchApi` |
| 皮肤不感知 Data | 合约在 `src/ui/` | 列表查询在 vui；Builder 仍管单元格 | `factory.table` 显示、附件、ref 清空仍读 Data |
| Logic 无 Vue | 通过 | 钩子认 core `UiContext`；实现类 `VueUiContext`（旧名 alias 已 deprecated） | Builder 仍拼鉴权工具栏 |
| 换皮只换皮肤 | `UiBuilder<TNode>` 够用 | `VueUiBuilder = WithTree(WithList(WithForm(Base)))`；`buildModuleToolbar` 仍 unimplemented | 不重写列表查询 |

**本快照新立住（下次不扣）：** vui context 从 `Object.assign(prototype)` 改为 Handbook mixin；`validate` / `reference` / `subgroup`（及 `data` / `navigate`）生产代码无 `@ts-nocheck`。`UiViewContext` / `UiBuildContext` 标成 `VueUiContext` 的 deprecated 别名。vui 工厂契约一控件一文件，皮肤实现。vui 测试文件约 69 个（控件契约变厚）。皮肤插件测试（gantt / kanban / chart 等）从「几乎一份大文件」扩到 11 个测试文件。

**仍开的裂缝：** 与 09-06 晚同一张 10 条清单；第 2 条部分关闭（只剩 form / list / tree）。

### 设计：命名与概念

| 概念 | 现在怎么叫 | 问题 |
|---|---|---|
| 会话 | `VueUiContext` | 旧 `UiViewContext` / `UiBuildContext` 仍 re-export |
| 拼屏 | `VueUiBuilder` + `WithForm/List/Tree` | 三个 mixin 文件仍 `@ts-nocheck` |
| 列表控件 | `factory.table` 现网 / `components/SfGrid` 目标 | 未接线；table ~1472 行 |
| 选记录 | 三条语义清楚 | 皮肤相对搜索仍猜 `categoryName` / `name` / `label` / `text` |
| 应用状态 | `app.state` | `$api` / `$ui` / `$v` 仍在 |

#### 模块切分（本快照行数）

| 热点文件 | 行数 | 相对 09-06 晚 |
|---|---|---|
| `core/net/fetch_api.ts` | ~1008 | 939 → 回胀 |
| `core/metaui/metaui_field.ts` | ~726 | 623 → 回胀 |
| `core/models/metamodel.ts` | ~687 | 616 |
| `vui/builder/list_view.ts` | ~1176 | 原 list.ts 1065 |
| `vui/contexts/vue_ui_context.ts` | ~751 | 原 ui_context ~972（mixin 拆出） |
| `vui-syncfusion/factory/table.ts` | ~1472 | 1436 |
| `vui-syncfusion/style.css` | ~2756 | 2736 |
| `vui-syncfusion/__tests__/syncfusion.test.ts` | ~3298 | 2312 |

### 代码质量

- **core：** 生产 `any` 约 **299**（晚评 263）。0 `ts-nocheck`。`mmda_app` 仍无测。`Entity` 索引 `any`；Group 自定义渲染仍 `Function`。
- **vui：** context mixin 进类型检查；**form / list_view / tree 仍 `@ts-nocheck`**。单元格管道仍在 `list_view`。约 69 个测试文件，多数打 factory 契约，不是 list 拼屏。
- **皮肤：** `factory.table` 仍 nocheck。`components/SfGrid` 仍无专用测。EJ2 monkey-patch 仍在。插件测变多。

#### 仍开 10 条（第 2 条收窄）

1. 鉴权工具栏集合仍在皮肤 `indexViewActionButtons`
2. **form / list_view / tree 仍 `@ts-nocheck`**（context mixin 已 typed，不再列入）
3. `factory.table` 与 `components/SfGrid` 仍并存
4. HTTP 旧栈仍从 core barrel 导出
5. `UiContext` 三通道仍可选；ui ↔ logic 类型环
6. `refLabelFn` 仍写回共享元数据
7. `SfAttachmentPanel` 仍 `fetchApi.uploadFiles`
8. `$api` / `$ui` / `$v`
9. 皮肤相对搜索仍猜字段名
10. 生产 `any` 上升；`mmda_app` / 契约 `SfGrid` 测试仍薄

### 本快照建议顺序

| 优先级 | 动作 | 为什么先做 |
|---|---|---|
| 1 | 鉴权工具栏上收到 vui | 换皮最大架构项，两轮未动 |
| 2 | 附件走 `context.apiClient`；相对搜索只信 `labelOf` | 皮肤感知 Data，改动面小于并表 |
| 3 | 去掉 form/list/tree 的 `@ts-nocheck`（已有 mixin 手法可抄 context） | 拼屏主体才进类型检查 |
| 4 | HTTP 旧栈移出 barrel；`UiContext` 三通道必填 | core 契约 |
| 5 | `refLabelFn` 不写共享元数据；并表到 `components/SfGrid` | 分 PR |

### 仍开（下次会话优先）

1. 鉴权工具栏集合仍在皮肤 Builder
2. form / list_view / tree 仍 `@ts-nocheck`
3. `factory.table` 与 `components/SfGrid` 两套实现仍并存
4. HTTP 旧栈仍从 core barrel 导出
5. `UiContext` 上 `app` / `apiClient` / `uiBuilder` 仍可选；ui ↔ logic 类型环
6. `refLabelFn` 仍写回共享元数据
7. 皮肤 `SfAttachmentPanel` 仍直接 HTTP
8. `$api` / `$ui` 仍挂 `globalProperties`；`$v` 命名
9. 皮肤相对搜索仍猜字段名
10. 生产代码大量 `any`（core 还在涨）；`mmda_app` / `SfGrid` 契约路径测试薄

---

## 快照 2026-09-18（重评）

> **本轮对象是工作区，不是 HEAD。** HEAD 仍是 `d9a3af5`（2026-09-16 18:02「builder接口整理，工具栏拆分」），其上叠了 **221 个文件、+1790 / −4332 行**未提交改动（工具栏拆分、plugins 归位、core 清理）。下文的分数与行数评的是**磁盘上这份带 WIP 的树**，不是可发版本。三个包的测试当前都不绿。

当时总评：**两个老债真的动了手**——鉴权工具栏三件套从所有皮肤删掉、上移到 core 契约 + vui 渲染；各包 `factory/` 里的图表/时间线/甘特等散落实现收敛成 `plugins/` + `UiPlugin` 契约（净 −4332 行）。但**把关的东西一个都没接线**：跨包 typecheck 量的是 8 天前的 `dist`，皮肤 61 条测试红着一个不存在的变量名，core 3 条红着一个已删的方法。这一轮最大的收获不是分数，是**首次用 tsc 与 vitest 把「契约与实现不一致」量成了数字**。

### 按包打分（相对 2026-09-08）

| 包 | 架构 | 设计 | 代码质量 | Δ | 一句话 |
|---|---|---|---|---|---|
| `@mmda/core` | 8.0 | 7.0 | 6.5 | 架构 +0.5 / 质量 +0.5 | 插件与三视图契约收进 core；三包唯一 tsc 干净；但权限挑按钮的产品策略落在了 UI 契约目录 |
| `@mmda/vui` | 7.0 | 7.0 | 5.5 | 质量 −0.5 | 首次量化：66 条 tsc 错误，主体是 `VueUiContext`/`MmdaVueApp`/`VueUiBuilder` **不满足** core 契约；自家边界守卫测试红 |
| `@mmda/vui-syncfusion` | 6.0 | 5.5 | 4.5 | 架构 +0.5 / 质量 −0.5 | 工具栏没了（好事）；137/199 测试、183 条源码级 tsc 错误、`table.ts` 1942 行仍 nocheck |

### 架构：分层与依赖

| 规则 | core | vui | vui-syncfusion |
|---|---|---|---|
| 层只碰相邻层 | 0 处 import `vue`；`ui/` 仍是纯契约 | 0 处 import EJ2 / PrimeVue / ag-grid | 仍碰 `MetaModel`、`fetchApi`、`api.config.service` |
| 皮肤不感知 Data | 契约在 `src/ui/` | 列表查询在 vui；三视图渲染在 `ui/builder/topbar.ts` | 收敛到 2 处：`SfAttachmentPanel`（HTTP + 上传 URL）、`field_factory/display.ts`（读 `api.config.service`） |
| Logic 无 Vue | 通过 | 钩子认 core `UiContext`；实现类仍是 vui `VueUiContext` | 不再拼鉴权工具栏 |
| 换皮只换皮肤 | `UiBuilder<TNode>` 34 个方法 | `VueUiBuilder = WithTree(WithList(WithForm(Base)))` | `SyncfusionUiBuilder extends VueUiBuilder` |

**本轮新立住（下次不扣）：**

- **鉴权工具栏三件套已从所有皮肤删除**：`SfIndexToolBar` / `SfEditToolBar` / `SfDetailsToolBar` / `PrimeIndexToolBar` / `PrimeEditToolBar` / `PrimeDetailsToolBar` / `NIndexToolBar` / `NEditToolBar` / `NDetailsToolBar` 全部删除；`core/src/ui/builder/toolbar.ts`、`vui/src/ui/builder/module_toolbar.ts`、`toolbar_paint.ts` 删除。改为 core 三个契约 `UiIndexTopbar` / `UiDetailsTopbar` / `UiEditTopbar`（`core/src/ui/builder/topbar.ts`，329 行）+ vui 渲染（`vui/src/ui/builder/topbar.ts`，693 行）。**这是 09-06 以来连续三轮排第一的「换皮最大架构项」，本轮关闭。**
- 按 `ModuleAuth.authorizedActions` 挑按钮的逻辑集中到 `core/src/ui/builder/topbar.ts` 的 `resolveIndexTopbarActions` / `moduleAuthOf` / `listModuleActions`，皮肤只渲染。
- 插件契约落 core：`core/src/ui/plugins/plugin.ts`（`UiPlugin` / `UiPluginName` / `uiPlugin`）；三包的 `chart` / `gantt` / `kanban` / `pivot_table` / `ribbon` / `scheduler` / `timeline` / `diagram` / `image_editor` / `markdown_editor` / `ai_assistant` 从 `factory/` 归位 `plugins/`；vui 新增 `ui/plugins/host.ts` 宿主。
- core 运行时依赖仍只有 luxon / pluralize。

**保留意见（本轮新增的错层）：** `resolveIndexTopbarActions` 这类「按权限决定哪些按钮出现」是**产品策略**，按 ARCHITECTURE 属于 Logic 层，却放在 `core/src/ui/builder/topbar.ts`（UI 契约目录）。建议：契约留 `src/ui/`，策略挪 `src/logic/`，或 core 只出接口、实现交 vui。同理 `moduleChain` / `moduleOf` 属于元数据问句，放 `ui/builder/` 偏。

**仍开的裂缝：** `UiContext` 上 `app?` / `apiClient?` / `uiBuilder?` 仍是可选（`core/src/ui/context.ts:58-60`）；`context.ts` 仍 type-import `logic/field_logic` 与 `logic/group_logic`，ui ↔ logic 类型环原样。皮肤 `SfAttachmentPanel` 仍 `(context.app?.api as any).fetchApi.uploadFiles`。`refLabelFn` 仍写 `field.reference.labelFn`（`core/src/logic/field_logic.ts:176`）。

### 设计：命名与概念

| 概念 | 现在怎么叫 | 问题 |
|---|---|---|
| 拼屏三视图 | `buildIndexView` / `buildDetailsView` / `buildEditView` / `buildSelectView` | 名字对；但 vui 实现类上 tsc 报 `buildSelectView` / `buildDetailsView` / `buildEditView` **不存在于** `VueUiBuilderBase`（TS2551 / TS2339），`VueUiBuilder incorrectly implements UiBuilder`（TS2420） |
| 三视图顶栏 | `UiIndexTopbar` / `UiDetailsTopbar` / `UiEditTopbar` | 新；命名与皮肤落地一致，`paintIndexTopbar` / `paintDetailsTopbar` / `paintModuleTopbar` 一组 |
| 插件 | `UiPlugin` / `uiPlugin` / `UiPluginName` / `chartAsPlugin` | 新；把「图表是控件还是插件」讲清了 |
| 列表控件 | `factory.table` 现网 / `components/SfGrid` 目标 | 层次这次讲清了：`factory/grid.ts` = EJ2 壳（`SfGridHost`）、`components/SfGrid.ts` = 契约控件、`factory/table.ts` = 现网拼装。**但没有合并** |
| 会话 | `VueUiContext` | 旧名别名已清；但 vui 实现类与 core 接口的赋值关系 tsc 不认 |
| 应用壳 | `app.state`；`MmdaVueApp extends MmdaApplication` | `MmdaVueApp` **不是** `MmdaApplication`（TS2345，2 处） |
| 弹层 | `toast` / `confirm` / `dialog` | `confirm` 返 boolean 已统一，但皮肤有调用点没跟（见下） |

#### 模块切分（本快照行数，生产代码）

| 热点文件 | 行数 | 相对 09-08 | 职责 |
|---|---|---|---|
| `vui-syncfusion/src/factory/table.ts` | 1942 | 1472 → 涨 | 现网表格；仍 `@ts-nocheck` |
| `vui/src/ui/builder/list_view.ts` | 1265 | 1176 | 列表拼装；仍 `@ts-nocheck` |
| `core/src/net/fetch_api.ts` | 1007 | ~持平 | 新 HTTP 栈 |
| `vui/src/ui/builder.ts` | 927 | 新 | Builder 组装 + 三视图分发 |
| `core/src/logic/entity_logic.ts` | 874 | 新上榜 | Logic 基类（含 HTTP 包装） |
| `vui/src/ui/builder/form.ts` | 875 | — | 表单拼装；仍 `@ts-nocheck` |
| `vui/src/contexts/vue_ui_context.ts` | 812 | 751 | 会话门面，仍是最大错误源（17 条 tsc） |
| `core/src/models/entity_search.ts` | 795 | — | 查询构造 |
| `vui-syncfusion/src/plugins/chart.ts` | 810 | — | 图表插件 |
| `vui-syncfusion/src/factory/utils.ts` | 727 | — | 表格工具 |
| `vui-syncfusion/src/builder/index.ts` | 582 | — | 皮肤 Builder（19 条 tsc） |
| `core/src/models/metamodel.ts` | 686 | 687 | 持平 |
| `vui/src/ui/builder/topbar.ts` | 693 | 新 | 三视图渲染 |
| `vui/src/contexts/mixins/data.ts` | 690 | — | 会话 data mixin |
| `core/src/ui/layout.ts` | 619 | — | 布局契约 |
| `core/src/net/http.ts` | 594 | 548 | **已弃用栈，仍从 barrel 导出** |
| `core/src/metaui/metaui_field.ts` | 567 | 726 → 缩 | 字段元数据（本轮瘦身） |
| `core/src/mmda_app.ts` | 534 | — | 应用壳抽象类，**仍无测** |
| `vui-syncfusion/src/style.css` | 3143 | 2756 | Material3 全量 + 手写 palette |

### 代码质量

| 指标 | core | vui | vui-syncfusion |
|---|---|---|---|
| 生产 LOC | 22823 | 20908 | 18404 |
| `any` 行数（非测试） | 360 | 474 | 540 |
| `as any`（非测试） | 16 | 160 | 248 |
| `@ts-nocheck` 生产文件 | 0 | 3 | 1 |
| `@ts-ignore` / `@ts-expect-error` | 2 | 0 | 0 |
| **`tsc --noEmit`（自己的 typecheck）** | **0 错误** | **66 错误 / 17 文件** | 289 错误（对 dist，**数字不可用**） |
| `tsc --noEmit`（接 core/vui **源码**实测） | 0 | 66（不变，说明是真错） | **183 错误**（其中 106 条是 dist 陈旧造成的假错） |
| 测试文件 | 39（5080 行 / 289 例） | 77（10511 行 / 414 例） | 17（6712 行 / 203 例） |
| **vitest 结果** | **274 / 277**（3 红） | **407 / 408**（1 红） | **137 / 199**（61 红 + 1 skip） |

#### 本轮实测到的缺陷（前几轮快照没有的）

| 级别 | 位置 | 现象 | 证据 |
|---|---|---|---|
| **阻断开卡** | `vui/src/index.ts` | `htmlAttributesOf`（定义在 core `src/ui/props.ts:43`）**没有从 vui barrel 再导出**，而皮肤 15+ 处按 `import { htmlAttributesOf } from '@mmda/vui'` 用它 | `vitest run`：61 failed / 137 passed；61 条的报错文本全是 `TypeError: htmlAttributesOf is not a function`。一行即修 |
| **行为缺陷** | `vui-syncfusion/src/components/SfAttachmentPanel.ts:148`、`:240` | `const accepted = await uiBuilder.confirm(...)` 之后判的是 `if (result !== 'ok') return` —— `result` 在本文件根本不存在，`accepted` 声明后未使用 | `tsc`：`TS2304: Cannot find name 'result'`。**覆盖同名附件**与**删除附件**两条路径运行时会抛 `ReferenceError`。这是 confirm 由字符串改 boolean 时漏掉的两个调用点（09-06 同类问题的复发） |
| **契约不一致（已量化）** | `vui` | `VueUiContext<Entity>` 不可赋给 `UiContext<Entity>`（7 条）；`MmdaVueApp` 不可赋给 `MmdaApplication`（2 条）；`VueUiBuilder incorrectly implements UiBuilder`（TS2420）且 `buildSelectView`/`buildDetailsView`/`buildEditView` 在基类上找不到（TS2551/2339）；`UiActionContext incorrectly extends UiContext`（TS2430）；`VueUiOverlay` 缺 `message`（TS2741）；`VueUiLayout.pageLayout` 属性/访问器冲突（TS2611） | 66 条 tsc，换用 core 源码解析后**仍是 66 条**，不是 dist 假象 |
| **皮肤覆写签名不兼容** | `vui-syncfusion/src/builder/index.ts` | `buildIndexTopbar` / `buildDetailsTopbar` / `buildEditTopbar` / `buildSearchField` / `buildSearchForRelative` / `buildModuleSearchbar` / `buildLoading` / `buildError` 共 7 条 `TS2416`：覆写属性与 `VueUiBuilder` 基类不同 | 接源码后 183 条中的一部分；这正是 typecheck 本该拦住、而因为解析到旧 dist 一直没拦住的东西 |
| **架构守卫测试红** | `vui/src/ui/builder/list_named_query.ts` | 仓库**自己写了**边界守卫 `vui/src/__tests__/layer_boundary.test.ts`（禁止 builder 目录 import net、禁止碰 `.apiClient`），它现在是红的 | `AssertionError: expected [ Array(1) ] to deeply equal []` |
| **测试未跟随重构** | `core` | `EntityQuery.lastCache` 已从源码删除（缓存挪到 vui `list_last_query.ts` + `context.lastQuery`），`entity_search.test.ts` 仍在打它 | 3 条 `TypeError: EntityQuery.lastCache is not a function` |

#### 本轮实测到的工程关卡缺口

**没有一个可复现的仓库级 typecheck 真源。** 具体：

- `packages/tsconfig.base.json` **没有 `paths` 映射**，`@mmda/*` 经 pnpm workspace 软链解析到各包 `package.json` 的 `"types": "./dist/index.d.ts"`。
- 现状是 dist 陈旧：`core/dist` 09-16 21:46、**`vui/dist` 09-10 13:17、`vui-syncfusion/dist` 09-09 19:27**——而源码改到 09-18。
- 后果：`pnpm --filter @mmda/vui-syncfusion typecheck` 报 289 条，**接上 vui/core 源码后是 183 条**——约 106 条是假的（`VueUiLayout` / `VueUiOverlay` / `UiPlugin` / `htmlAttributesOf` 在旧 dist 里压根没有）。反向验证：vui 自己的 66 条，换成 core 源码解析后**仍是 66 条**，说明 vui 这 66 条是真的。
- 根 `package.json` 的 `scripts` 只有 `build` / `test` / `lint`，**没有 `typecheck`**；仓库**没有 CI**（无 `.github`）。各包 `typecheck` 脚本靠人记得手敲，且敲出来还是假的。
- `vitest.config.ts` **反而是对的**——每个包都把 `@mmda/core` / `@mmda/vui` alias 到 `../core/src/index.ts` / `../vui/src/index.ts`。所以**测试量的是源码，typecheck 量的是 dist**，两者的信任度正好反过来。这也解释了为什么 61 条红能一直挂在工作区里没人发现：`pnpm test` 会红，但 `typecheck` 给了虚假的绿。

### 本快照建议顺序

| 优先级 | 动作 | 为什么先做 |
|---|---|---|
| 1 | vui barrel 补 `htmlAttributesOf` 再导出；`SfAttachmentPanel` 两处 `result !== 'ok'` 改 `!accepted` | 一行 + 两行，立刻消掉 61 条红测试和 2 个运行时会抛的路径。行为缺陷优先于分数 |
| 2 | **给 typecheck 接线**：`tsconfig.base.json` 加 `paths` 指向各包 `src/index.ts`（或改 project references），根加 `typecheck` 脚本 | 不修这条，下面每一条都看不见——本轮 183 条皮肤错误、7 条覆写不兼容，全是这条缺失的产物 |
| 3 | 按 tsc 输出收三条契约：`VueUiContext` → `UiContext`、`MmdaVueApp` → `MmdaApplication`、`VueUiBuilder` → `UiBuilder` | 对象就是 66 条错误的主体，也是「三通道可选 + ui↔logic 类型环」的可执行清单。收完 `UiContext` 的三通道就可以顺势改必填 |
| 4 | 附件改走 `context.apiClient`（去掉 `fetchApi.uploadFiles` 与组件内拼 URL）；`field_factory/display.ts` 别读 `api.config.service` | 皮肤感知 Data 只剩这 2 处，改动面小于并表 |
| 5 | `form` / `list_view` / `tree_view`（vui）+ `factory/table.ts`（皮肤）逐个去 `@ts-nocheck` | 拼屏与现网表格的主体才进类型检查；等第 2 条接通后再排 |
| 6 | `resolveIndexTopbarActions` 这类权限策略从 `core/src/ui/builder/` 挪 Logic 或交 vui；顺带补 `mmda_app` 测试 | 分层收尾 + 质量债，可分 PR |

### 仍开（下次会话优先）

1. `vui` barrel 缺 `htmlAttributesOf` 再导出 → 皮肤 61 条测试红（一行可修）
2. **跨包 typecheck 未接线**：无 `paths` / 无 root `typecheck` / 无 CI，皮肤 typecheck 量的是 8 天前的 dist（289 假 vs 183 真）
3. `SfAttachmentPanel` 两处 `result !== 'ok'`（运行时 ReferenceError）；附件仍 `fetchApi.uploadFiles`
4. `UiContext` 三通道仍可选；ui ↔ logic 类型环仍在；vui `VueUiContext` / `MmdaVueApp` / `VueUiBuilder` 均不满足 core 契约（66 条 tsc）
5. `form` / `list_view` / `tree_view`（vui）与 `factory/table.ts`（皮肤）仍 `@ts-nocheck`
6. `refLabelFn` 仍写回共享元数据 `field.reference.labelFn`
7. HTTP 旧栈仍从 core barrel 导出（`core/src/index.ts:137` → `./net/http`，594 行，已弃用）
8. `$app` / `$api` / `$di` / `$meta` / `$ui` 仍挂 `globalProperties`；`$v` 命名
9. 皮肤相对搜索仍猜字段名（`vui-syncfusion/src/builder/index.ts:400` 的 `['categoryName','name','label','text']`）
10. `factory.table`（1942 行）与 `components/SfGrid` 未合并；`EntityQuery.lastCache` 的 3 条红测试待处理；`mmda_app` 仍无测
11. 权限挑按钮的产品策略落在 `core/src/ui/builder/topbar.ts`（UI 契约目录），按 ARCHITECTURE 属 Logic

**09-08 清单的变动：** 第 1 条（鉴权工具栏在皮肤）**关闭**——已上移，且上到了 core 而非 vui；其余 9 条仍在，第 4 条重写为「typecheck 未接线」，第 10 条加重（新增 66 + 183 条类型错误）。

**工作区状态提醒：** 本文评的是未提交的 WIP 树（HEAD `d9a3af5` + 221 文件 / +1790 / −4332）。三包测试无一全绿，`vui-syncfusion` 61 条红。落地第 1 条之前，这份树不具备可发基线。

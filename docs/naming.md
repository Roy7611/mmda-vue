# MMDA 术语与命名

本文约定产品里**叫什么、怎么写**。代码、路由、文档、Logic 钩子用同一套词，不要各起别名。

源码：视图枚举在 [`packages/vui/src/contexts/view.ts`](../packages/vui/src/contexts/view.ts)；表格 `scene` 在 [表格契约](../packages/vui-syncfusion/docs/sf-grid.md)。UI 构造见 vui [`ui/builder/`](../packages/vui/src/ui/builder/) 与 [Builder 文档](../packages/vui/docs/builder.md)。**分层架构只写在** [ARCHITECTURE.md](../ARCHITECTURE.md)，本文不重复。

## 目录

- [产品与包](#产品与包)
- [分层词](#分层词)
- [UI 构造：组件 → Factory → Builder](#ui-构造组件--factory--builder)
  - [chrome 参数](#chrome-参数)
- [服务、模块、实体、仓库、交互逻辑](#服务模块实体仓库交互逻辑)
  - [relation 与 relative](#relation-与-relative)
  - [文件与目录](#文件与目录)
- [Logic](#logic)
  - [类名与继承](#类名与继承)
  - [字段与组](#字段与组)
  - [按视图装配](#按视图装配)
  - [CRUD 钩子](#crud-钩子)
  - [注册](#注册)
  - [不要](#不要)
- [视图（View）](#视图view)
  - [单对象 `UiViewOne`](#单对象-uiviewone)
  - [多对象 `UiViewMany`](#多对象-uiviewmany)
  - [路由怎么写成视图](#路由怎么写成视图)
- [list、table、grid](#listtablegrid)
- [列表形态（Kind）≠ 视图](#列表形态kind-视图)
- [表格 scene ≠ 视图](#表格-scene--视图)
- [元数据与引用字段](#元数据与引用字段)
- [业务枚举成员](#业务枚举成员)
- [权限位](#权限位)
- [动作：三层名字](#动作三层名字)
  - [标准动作 `EntityActionType`](#标准动作-entityactiontype)
- [查询相关名字](#查询相关名字)
- [易混对照](#易混对照)

---

## 产品与包


| 名称                         | 写法   | 含义                                     |
| -------------------------- | ---- | -------------------------------------- |
| MMDA                       | 全大写  | Metadata Model Driven Architecture     |
| `@mmda/core`               | 包名小写 | 框架无关：元数据、实体、Logic、HTTP、DI、**UI 契约**（`src/ui/`，无实现） |
| `@mmda/vui`                |      | Vue 3 运行时：会话、拼屏、Builder；应用壳实现为 `MmdaVueApp` |
| `@mmda/vui-*`              | 皮肤包  | PrimeVue / Syncfusion / Naive 控件实现     |
| `@mmda/vuix-*`             |      | 跨皮肤或替代厂商的可选 UI 插件 |
| `@mmda/vuix-echarts`        |      | ECharts 图表插件，应用 `setChartFactory` |
| `@mmda/vuix-vf-diagram`        |      | Vue Flow 图插件，应用 `setDiagramPlugin` |
| `@mmda/vuix-vditor-markdown` |     | Vditor Markdown 插件，应用 `setMarkdownEditorPlugin` |
| `@mmda/vuix-svar-kanban`    |      | SVAR 看板插件，应用 `setKanbanPlugin` |
| `@mmda/vuix-hyper-gantt`    |      | DlhSoft Hyper 甘特插件，应用 `setGanttPlugin` |
| `@mmda/vuix-tempis-timeline` |     | Tempis 时间轴插件，应用 `setTimelinePlugin` 替换 `factory.timeline` |
| `@mmda/vuix-fc-scheduler`   |      | FullCalendar 排程插件，应用 `setSchedulerPlugin` |
| `@mmda/app`                |      | 统一 SPA 壳、Router、部署入口                   |
| `@mmda/base` / `@mmda/mes` |      | 业务插件，不是独立 SPA                          |


口语「vui」指运行时；「皮肤 / skin」指 `vui-primevue` 等；「vuix」指可选 UI 插件。计划中的 React 运行时叫 `rui`，不要从 vui 抄组件。

---

## 分层词

架构与职责见 [ARCHITECTURE.md](../ARCHITECTURE.md)。这里只定**叫什么**：

| 词 | 英文 | 指什么 |
| --- | --- | --- |
| UI / 展现 | UI | vui + 皮肤 |
| Logic / 交互逻辑 | Logic | `*Logic.ts`；core `src/logic/`；**不是** Data |
| Data / 数据 | Data | core 的 metaui / models / net / di / utils / extensions |
| 会话接口 | `UiContext` | core；业务 Logic 只认这个。声明 `uiBuilder` / `apiClient` / `app` |
| 应用壳 | `MmdaApplication` | core abstract class；鉴权、MetaUi、DI、locale。`context.app` 的类型。业务读 **`app.state`** |
| Vue 应用壳 | `MmdaVueApp` | vui `extends MmdaApplication`；不是 Vue `createApp()` |
| 拼屏实现 | `VueUiBuilder` | vui 抽象类，`implements UiBuilder<VNode>`（模板方法）；皮肤 `SyncfusionUiBuilder` / `PrimeVueUiBuilder` 等再 extends。取代 `AbstractUiBuilder`。注入类型用本类，不要另造 Host，也不要 alias 成 `UiBuilder` |
| 会话实现 | `VueUiContext` | vui 实现 core `UiContext`；对标 Flutter `BuildContext`，给构造 / 拼屏 / 屏级 IO。不要叫 ViewModel / Store。旧名 `UiViewContext` / `UiBuildContext` 已合并，新代码不要写 |

元数据（`MetaUiField` 等）不是会话状态：查询词、选中行、校验结果不要写回去。

---

## UI 构造：组件 → Factory → Builder

元数据驱动的界面**怎么画出来**，三个词不要混：

```text
皮肤 Component     SfGrid / AgGrid      一块控件，吃 props，不拼整页
皮肤 Factory       factory.table        用 MetaUi 生产上面的组件
vui Builder        buildListView        拼工具栏、搜索、分组、分页、对话框
```

Builder 继承（设计真源 [ARCHITECTURE.md](../ARCHITECTURE.md)）：

```text
UiBuilder              core 契约
    ↑ implements
VueUiBuilder           vui 抽象类（模板方法；取代 AbstractUiBuilder）
    ↑ extends
SyncfusionUiBuilder / PrimeVueUiBuilder / …
```

| 词 | 英文 | 典型写法 | 是什么 |
| --- | --- | --- | --- |
| 组件 | Component | `SfGrid`、`AgGrid`、`NaiveTree` | 皮肤 `components/`；vui `src/components/` 只有无厂商壳 |
| 工厂 | Factory / `UiFactory` | `factory.table`、`fldFactory.dropDownList` | 皮肤实现；vui 契约 [`ui/factory/factory.ts`](../packages/vui/src/ui/factory/factory.ts) |
| 构建器契约 | `UiBuilder` | `toast` / `confirm` / `dialog` / `buildView` | **core** `src/ui/builder.ts`，无 Vue |
| 拼屏实现 | `VueUiBuilder` | `buildListView`、`buildView` | vui 抽象类（模板方法）；`ui/builder/` 挂共用部分；皮肤只补壳 / 控件 |
| 动作工厂 | `UiActionFactory` | `create` / `save` / `delete` | **Builder 的标准按钮接线**，不是生产 SfGrid 的 Factory |

vui **不要**建 `ui/factories/`（会让人以为 vui 在生产表格）。皮肤已有 `factory/`。细则见 [Builder 与皮肤](../packages/vui/docs/builder.md)。chrome 控件参数名见 [Factory 控件契约](../packages/vui/docs/factory.md)。

### chrome 参数

按钮、Badge 等皮肤无关的视觉参数，vui 里用这些名：

| 中文 | 属性 | 不要写成 |
| --- | --- | --- |
| 形状 | `shape` | `variant`、`type` |
| 大小 | `size` | 把厂商 `xlarge` 写进契约 |
| 颜色 | `colorRole` | `severity`、`type`、`color` |
| 位置 | `position` | 角标四角不要复用 tooltip 的 `UiPosition` |
| 横竖 | `orientation`（类型 `UiOrientation` = `UiDirection`） | 控件私有 `*Orientation`（Splitter 的 `'Horizontal'\|'Vertical'` 除外） |
| HTML | `htmlAttributes` | `attrs`、把 `title`/`name` 拆成 vui 专用字段 |

`placeholder` / `disabled` 是控件具名属性，不进 `htmlAttributes`。皮肤默认把 `htmlAttributes` 透传到真实节点（EJ2 接组件的 `htmlAttributes`）。

`severity` 留给 toast / 校验轻重。Badge 细节：[设计](../packages/vui/docs/badge.md) / [怎么写](../packages/vui/docs/badge_usage.md)。内容面板是 `factory.card`（[设计](../packages/vui/docs/card.md)），不是 `GroupCard`。分隔线是 `factory.divider`（[设计](../packages/vui/docs/divider.md)），不是菜单 `action.divider`。提示气泡是 `factory.tooltip`（[设计](../packages/vui/docs/tooltip.md)）包一层子节点；按钮上的 `tooltip` 仍是原生 `title`。就地编辑壳是 `factory.inplaceEditor`（[设计](../packages/vui/docs/inplace_editor.md)），点 display 换成 content；字段是 `inplaceFieldEditor` / `InplaceFieldEditor`，不要 `inplace` / `inplaceEdit` / `InplaceEditor`（后两个是表格 Logic / SF 类名）。表单还没接线。芯片列表是 `factory.chips`（[设计](../packages/vui/docs/chips.md)）。自由文本字段是 `tags`；枚举多值是 `enumChipSet` / `EnumChipSet`；按位勾选是 `bitChipSet` / `BitChipSet`。不要 `enumSetTags` / `BitTags`。横排位勾选仍是 `bitCheckBoxList`。文件链接是 `factory.fileLink`（[设计](../packages/vui/docs/file_link.md)），`Url` / `FileLink` 别名；值是 URL，不是 `externalLink`。单文件上传是 `factory.fileUploader`，多文件是 `filesUploader`（[设计](../packages/vui/docs/file_uploader.md)）；件数写在方法名里，不要 `factory.uploader` / `multiple`。单文件是 SearchBox 形输入框，框内可拖文件，**没有** `layout: 'dropArea'`。`fileUpload`→`filesUploader`。`FilePicker` / `ImagePicker` 现在暂时画 Uploader；以后是跟表单一起上传、只选和预览，见 [怎么写](../packages/vui/docs/file_uploader_usage.md)。图片上传是 `imageUploader` / `imagesUploader`（[设计](../packages/vui/docs/image_uploader.md)）。详情只读图是 `factory.image` / 子表 `imageGallery`。`UploadFile.uploader` 是上传人。取色是 `factory.colorPicker`（[设计](../packages/vui/docs/color_picker.md)），值是 hex，不是 `colorRole`。掩码输入是 `factory.maskedTextBox`（[设计](../packages/vui/docs/masked_text_box.md)），mask 用 EJ2 元素，不要 `InputMask` / `ejs-maskedtextbox` 当 vui 名。OTP 是 `factory.oneTimePasswordInput`（[设计](../packages/vui/docs/one_time_password_input.md)），不要 `InputOtp` / `ejs-otpinput` 当 vui 名。数值输入是 `factory.numberInput`（[设计](../packages/vui/docs/number_input.md)），format 用 EJ2 语法，不要 `NumericTextBox` / `InputNumber` 当 vui 名。进度条是 `factory.progressBar`（[设计](../packages/vui/docs/progress_bar.md)），值 0–100，不要 `ejs-progressbar` / `NProgress` 当 vui 名，不要当成 `factory.loading`。签名面板是 `factory.signaturePad`（[设计](../packages/vui/docs/signature_pad.md)），值是 PNG data URL，不要 `ejs-signature` / `SignatureComponent` / npm `signature_pad` 当 vui 名，不要当成 `imageEditor`。步骤条是 `factory.stepper`（[设计](../packages/vui/docs/stepper.md)），值是当前步索引；`items` 可绑子表行（`labelField` 等），不要 `ejs-stepper` / `StepperComponent` / `NSteps` 当 vui 名。时间轴是 `factory.timeline`（[设计](../packages/vui/docs/timeline.md)），默认事件列表，对侧缺省 `relativeTime`；`setTimelinePlugin` 换成 Tempis，不要 `ejs-timeline` / `TempisTimeline` / `NTimeline`。带输入选日是 `factory.datePicker`（[设计](../packages/vui/docs/date_picker.md)），选月是 `monthPicker` 捷径，不是 `factory.calendar`。封闭下拉是 `factory.dropDownList`（[设计](../packages/vui/docs/drop_down_list.md)），不要叫 `dropdown`。少选项单选组是 `factory.radioButtonGroup`（[设计](../packages/vui/docs/radio_button_group.md)），绑定对齐 DropDownList，不要 `ejs-radiobutton` / `radioGroup`，不要当成 `selectButtonGroup`。可编下拉是 `factory.comboBox`（[设计](../packages/vui/docs/combo_box.md)）。整钮菜单是 `factory.dropDownButton`（[设计](../packages/vui/docs/drop_down_button.md)），不要 `menuButton` / `dropdownMenuButton`。更多菜单是 `factory.moreMenuButton`（只调 `dropDownButton`）。主段+箭头是 `factory.splitButton`（[设计](../packages/vui/docs/split_button.md)）。浮钮是 `factory.floatingActionButton`（[设计](../packages/vui/docs/floating_action_button.md)），不是 SpeedDial，不要 `Fab` / `ejs-fab` 当 vui 名。

以后加控件：皮肤 `components/` 写组件 → 皮肤 `factory/` 用 `MetaUi` 生产 → vui Builder 只决定何时分页、分组、弹选择器。**不要**把 EJ2 / ag-grid / PrimeVue 控件写进 `@mmda/vui`。对外接口以 **list** 命名，子表走 **table**，皮肤实现用 **grid**，见 [list、table、grid](#listtablegrid)。

表单标签+槽走 `factory.formField`（不要 `formItem`）。勾选 chrome 只有 `factory.checkBox`（不要两参 `checkbox`）。开关只有 `factory.switch`（不要 `toggleSwitch`）。封闭下拉走 `dropDownList`（不要 `factory.select`；`select(field)` 是选记录）。列表主路径是 `factory.table`（不要 `dataTable` / `primeVueTable` / `factory.column`）。卡片墙自己 `h` 拼，不要 `dataViewBox`。表头列筛只认 `UiListProps.filterDisplay`，Builder 缺省 `'none'`（不要 `factory.defaultFilterDisplay`）。字段配置名 `hasOneText` 落到实现 `externalLink`（`HasOneText` 别名仍有效）；文件 URL 仍是 `fileLink`。不要 `associationTable`。PascalCase 字段别名本轮仍双轨。

---

## 服务、模块、实体、仓库、交互逻辑

五个词不要混用。中心是**实体模型**：

```text
Entity          Material              实体模型（单数 PascalCase）
repository      Materials             通常是实体模型的复数（API 路径，不是 Logic 类名）
EntityLogic     （core 基类）           无 Vue：ApiClient + MetaModel CRUD
UiLogic         MaterialLogic         该实体的交互逻辑（继承 EntityLogic；vui 补视图装配）
```

程序员写的是 **实体 Logic**（`XxxLogic extends UiLogic`），不是「仓库 Logic」。`repository` 只是该实体对应的 API / 元数据包主键。

`EntityLogic` 在 `@mmda/core`，无 Vue。`UiLogic` 在 `@mmda/vui`：router、i18n、按视图装配。业务类仍 `extends UiLogic`。无定制时用 `GenericUiLogic`。细则见 [Logic](#logic)。

不要叫 **`EntityManager`**（ORM/Data 味道，且与 JPA 同名）。不要叫 **`RepositoryLogic`**（会和 `repository` 字符串、`createRepositoryLogic()` 搅在一起）。

| 词 | 英文 | 典型写法 | 是什么 |
|---|---|---|---|
| 服务 | service | `base` / `mes` | 后端业务服务；插件 `name` 同此 |
| 路由前缀 | routePrefix | `/BASE` / `/MES` | service **全大写** |
| 模块 | Module | 菜单与权限节点 | 功能目录、`allowRead` 等 |
| 实体 | Entity | `Material` | 实体模型；一行业务对象 |
| 关系 | relation | `MetaRelationType` | **元数据**上实体之间怎么连（HAS_ONE / HAS_MANY / REF / ENUM） |
| 关联对象 | relative | `relObjName`、`addRelativeLogic` | 当作「亲戚」的那一个实体/对象，不是关系类型本身 |
| 仓库 | repository | `Materials` | API / 元数据包主键；**通常为实体复数** |
| 交互逻辑 | Logic | `MaterialLogic` | 该实体在各视图上的交互；类继承 `UiLogic` |

不规则复数照后端仓库名：`Countries`、`Wbses`。不要把目录 `materials` 或类名 `Material` 当成 `repository`。

### relation 与 relative

两个词都跟「别的实体」有关，层不同：

| 词 | 层 | 含义 | 代码里 |
|---|---|---|---|
| **relation** | 元数据 | 实体**之间的关系**怎么声明 | `MetaRelationType`、`field.reference.refType`、子表 `joinOn` |
| **relative** | 对象 / Logic | **关联对象**，亲戚关系里的那一方 | `relObjName`、`addRelativeLogic`、`searchRelative`、`context.select` |

`relation` 四种。字段 `reference` 日常只用前三种（`enum` / `ref` / `hasOne`）；`HAS_MANY` 是子表组。

| `MetaRelationType` | 口语 | 对方是谁 | 数据怎么来 |
|---|---|---|---|
| `ENUM` | 枚举 | 本地选项，不是另一张表 | `value;code;label` → `refOptions` |
| `REF` | 引用 | **小表**（字典、单位、币种…） | 适合**全量缓存**进 `refOptions` |
| `HAS_ONE` | 一对一 | 业务关联对象，对方可能很大 | **不适合缓存**；要整份实体给客户端 |
| `HAS_MANY` | 一对多 | 子表多行 | 组上 `relObjName` 是子实体名 |

`ref` 与 `hasOne` 都存外键、显示仍走 `valueOf` / `labelOf`，差别是体量和用途：`ref` 当下拉选项用；`hasOne` 的 relative 参与业务逻辑，客户端需要完整对象（多字段、树、再算），用 `searchRelative` / `context.select` / `load` 按需取，不要当小表灌进 `refOptions`。

`relative` 说的是**那个实体/那行对象**，不是关系类型。物料的合作伙伴是 Material 的 relative；`HAS_MANY` 才是这段 relation。

```ts
this.addRelativeLogic<MaterialPartner>('partNos', (master) =>
  new MaterialPartnerLogic(this, master),
)
await context.searchRelative(field, searchWord)
await context.select(field)
```

`addRelativeLogic` 的第一个参数是子表 **组名**（`partNos`），泛型是子实体。`relObjName` 是元数据里子对象名（如 `MaterialPartner`）。不要把 relation 写成 relative，也不要用 `relativeTime`（那是相对时间）或 CSS `position: relative`。

### 文件与目录

```text
packages/base/src/modules/materials/MaterialLogic.ts
                 └─ snake_case，与 repository 对应的复数目录
                                    └─ 实体单数 + Logic
```

- 目录：`production_orders`、`quality_inspections`
- 类：`ProductionOrderLogic`、`QualityInspectionLogic`
- 子表：`UiGroupLogic`，挂在主表 Logic 上，例如 `MaterialPartnerLogic`
- 无定制时用 `GenericUiLogic`，不要空类撑场面

字段名 **camelCase**，与元数据 `MetaUiField.name` 一致（`materialType`、`categoryID`）。不要在 Logic 里改成 snake_case。

---

## Logic

**Logic** 是横向分层里的交互层：显示、锁定、校验、引用加码、`onChange`、CRUD 前后拦截。程序员写 `XxxLogic.ts`。它不是皮肤、不是 `MetaUi`、不是 ViewModel / Store。

写法见 vui [实体交互逻辑](../packages/vui/docs/logic.md)、core [前端交互逻辑](../packages/core/docs/logic.md)。

### 类名与继承

```text
EntityLogic<E>          @mmda/core     无 Vue：ApiClient + MetaModel CRUD
    ↑
UiLogic<E>              @mmda/vui      视图装配、router、i18n
    ↑
MaterialLogic                          业务：该实体的交互逻辑
GenericUiLogic                         无定制时的默认实现
```

| 类 | 包 | 命名 | 是什么 |
|---|---|---|---|
| `EntityLogic` | core | 不要业务直接继承 | 无 Vue 的 CRUD 基类 |
| `UiLogic` | vui | 业务基类 | 该实体的交互逻辑 |
| `GenericUiLogic` | vui | — | 通用 CRUD / 跨服务 `select` |
| `UiGroupLogic` | vui | `{子实体}Logic` | 子表，挂在主表 Logic 上 |
| `MetaUiFieldLogic` | core | `this.field('x')` | 单字段 hide / lock / validate / 渲染 |
| `MetaUiGroupLogic` | core | `this.group('y')` | 子表组行为 |

业务类：**实体单数 + `Logic`** → `MaterialLogic`、`ProductionOrderLogic`。不要 `MaterialsLogic`（那是 DI token 里的仓库名）。

不要叫 `EntityManager`、`RepositoryLogic`。`createRepositoryLogic(repository)` 是「按仓库名取出 Logic」的工厂，**函数名保留**。

### 字段与组

`this.field(name)` / `this.group(name)` 返回 Logic 对象，挂在**当前会话**。不要改共享的 `MetaUiField`。关联加码用 `refWhere`，与元数据 `reference.where` AND。

### 按视图装配

钩子名：`before` + 视图首字母大写。`applyTo(context, view)` 调对应 `beforeXxx`，结果 `bindLogics` 进 `VueUiContext`。

| 视图 | 钩子 | 默认落到 |
|---|---|---|
| `index` | `beforeIndex` | 自身 |
| `details` | `beforeDetails` | 自身 |
| `edit` | `beforeEdit` | 自身 |
| `create` | （无独立装配） | `beforeEdit` |
| `editMany` | | `beforeEdit` |
| `selectOne` | | `beforeIndex` |
| `selectMany` | `beforeSelectMany` | 未覆盖则 `beforeIndex` |
| `search` | `beforeSearch` | 返回 `UiSearchForm`，不是 fields/groups |

大型 Logic 按视图拆文件，`viewLogicLoaders` 的键必须是 `UiViewType`。`create` 加载 `edit` 那份。调用基类须 `UiLogic.prototype.beforeIndex.call(this)`，不能 `this.beforeIndex()`（加载后该方法就是当前函数）。

```ts
viewLogicLoaders = {
  index: () => import('./OrderIndexLogic'),
  edit: () => import('./OrderEditLogic'),
  details: () => import('./OrderDetailsLogic'),
}
```

`viewOptions` 按当前 `context.view` **精确查找**，不自动把 `selectOne` 当成 `index`。`viewOptions` **只返回选项**，不 `h()`。业务动作可以 `context.uiBuilder.factory` / `dialog` / `select`，仍不要 Vue 类型。

### CRUD 钩子

与视图装配分开，成对出现：`beforeLoad` / `afterLoad`、`beforeSave` / `afterSave`、`beforeDelete` / `afterDelete`、`beforeDeleteAll` / `afterDeleteAll`、`beforeValidate` / `afterValidate`、`beforeAction` / `afterAction`，以及 import / print / upload / resetFilters。`before*` 返回 `false` 则中止。

### 注册

DI token 按**仓库**（实体复数）：`${service}:${repository}Logic`，例如 `base:MaterialsLogic` → 类 `MaterialLogic`。跨服务选记录传 `service` + `repository`，不要 import 对方包。

```ts
mmda.di.provide('base:MaterialsLogic', () => new MaterialLogic(init))
```

无定制：`new GenericUiLogic(defineNote, init)`。子表：`addRelativeLogic('partNos', (master) => new MaterialPartnerLogic(this, master))`。

### 不要

- 在 Logic 里写厂商控件、拼 HTTP、改写共享元数据
- 把 Vue/React 类型写进 `@mmda/core` 的 `EntityLogic` 或业务 `*Logic.ts`
- 使用已删除的 `pickRelative` / `buildSearchForRelativeContent` / `confirmMessage` / `app.context`
- 用 JS 过滤器代替 `refWhere`
- 空的 `XxxLogic` 类撑场面（改用 `GenericUiLogic`）

---

## 视图（View）

**视图**是一屏以何种身份打开实体，取值是小写 / camelCase 字符串。类型是 `UiViewType`。

分成两类：**单对象**（一张表单）和 **多对象**（一张表）。

### 单对象 `UiViewOne`


| 值         | 枚举                  | 中文   | 用途                              |
| --------- | ------------------- | ---- | ------------------------------- |
| `details` | `UiViewOne.Details` | 详情   | 只读看一条                           |
| `edit`    | `UiViewOne.Edit`    | 编辑   | 改已有一条                           |
| `create`  | `UiViewOne.Create`  | 创建   | 新建一条；Logic **复用 `edit`**        |
| `search`  | `UiViewOne.Search`  | 查询表单 | 搜索栏字段装配（`beforeSearch`），不是列表页本身 |


### 多对象 `UiViewMany`


| 值            | 枚举                      | 中文      | 用途                         |
| ------------ | ----------------------- | ------- | -------------------------- |
| `index`      | `UiViewMany.Index`      | 索引 / 列表 | 仓库主列表；默认多选（批量删除）           |
| `selectOne`  | `UiViewMany.SelectOne`  | 单选      | 挑一条；Logic **默认复用 `index`** |
| `selectMany` | `UiViewMany.SelectMany` | 多选      | 挑多条；未单独实现时也复用 `index`      |
| `editMany`   | `UiViewMany.EditMany`   | 批量改     | 列表上改多条；Logic **复用 `edit`** |


口语可以说「列表页 / 选择器」，代码里不要发明 `list`、`form`、`selector`、`select` 当作 `view`。

`**select` 是方法，不是视图。** `context.select({ repository, selectionMode })` 打开实体选择弹层；弹层内部的 `view` 仍是 `selectOne` 或 `selectMany`。

按视图装配字段/组、拆文件、`viewOptions` 见 [Logic · 按视图装配](#按视图装配)。

### 路由怎么写成视图

标准 CRUD（路径段 **PascalCase**）：


| URL                               | `view`       |
| --------------------------------- | ------------ |
| `/{SERVICE}/:repository`          | `index`      |
| `/{SERVICE}/:repository/Create`   | `create`     |
| `/{SERVICE}/:repository/Edit/:id` | `edit`       |
| `/{SERVICE}/:repository/:id`      | `details`    |
| 同上列表 + `?view=selectOne`          | `selectOne`  |
| 同上列表 + `?view=selectMany`         | `selectMany` |


例子：`/BASE/Materials`、`/BASE/Materials/Create`、`/MES/Processes/Edit/12`。

路径里的 `Create` / `Edit` 与视图值 `create` / `edit` 大小写不同，解析在 `EntityView`，业务代码请用枚举或字面量 `UiViewType`，不要手拼路径大小写。

---

## list、table、grid

同一套 [`UiListProps`](../packages/vui/src/ui/factory/list.ts)，`display` 表示呈现意图，不是多套 props。契约文件仍是 `factory/list.ts`，不要再建 `ui_grid.ts`。整页（工具栏、搜索、分页）在 [`builder/list_view.ts`](../packages/vui/src/ui/builder/list_view.ts)。树形表额外字段在 [`factory/tree_grid.ts`](../packages/vui/src/ui/factory/tree_grid.ts)。

```text
list      display / 捷径    移动端卡片、行条；表格不合适
table     display / 捷径    只读桌面：少模板、适合大行数浏览
grid      display / 捷径    可编桌面：进格编辑、列筛、虚滚
treeGrid  display / 捷径    嵌套/父子行；树字段仍在 tree_grid.ts
```

| `display` | 给谁 | 写法 |
|---|---|---|
| **list** | 移动端 | `buildList`、`factory.list` |
| **table** | 只读桌面、只读子表 | `buildTable`、`factory.table` |
| **grid** | 可编桌面、进格子表 | `buildGrid`、`factory.grid` |
| **treeGrid** | 树形表 | `buildTreeGrid`、`factory.treeGrid` |

`index` / `selectOne` / `selectMany` 列出实体：Builder 走 `buildListView`（`UiListViewProps` 在 `list_view.ts`）。`display` 缺省：`inplaceEdit` 则 `grid`，否则 `table`；Logic 也可传 `list` / `treeGrid`。

表单 HAS_MANY：可编走 `display: grid`（`buildGrid` / `tableWithCells`），只读走 `table`；组 `displayShape` 是树则 `treeGrid`。

本轮 table 与 grid **实现**可落到同一皮肤表格（SF 现网 `factory.table`、Naive AgGrid、Prime DataTable）。以后 table 收成轻量只读路径时，调用点不用改。皮肤控件名仍是 `SfGrid` / `AgGrid`。

`scene`（`UiGridScene`）是表格默认开关，见下一节。`viewKind: list` 是整页形态，不是控件名。

---

## 列表形态（Kind）≠ 视图

`view` 回答「这是列表还是编辑」；`viewKind` 回答「列表长什么样」。


| `UiViewManyKind` | 含义      |
| ---------------- | ------- |
| `list`           | 普通列表（默认；桌面常画成 table/grid） |
| `categoryList`   | 左树右表    |
| `treeGrid`       | 树形表     |
| `gantt`          | 甘特      |
| `scheduler`      | 排程（日/周/月事件；皮肤 Sf / Fc） |


不要把 `treeGrid` 写成 `view`。

---

## 表格 scene ≠ 视图

皮肤表格的 `scene` 只改默认开关（分页、进格编辑、操作列），**不是** `UiViewType`。


| `scene`    | 用在                          |
| ---------- | --------------------------- |
| `index`    | 业务列表页                       |
| `selector` | 选记录弹窗里的表                    |
| `edit`     | 编辑页**子表**（本地 `EntityArray`） |
| `details`  | 详情页**子表**（只读）               |


注意：`selector` 只出现在表格契约；会话视图仍是 `selectOne` / `selectMany`。子表行对话框的 create/edit/details 跟主表视图同名，但是子会话。

---

## 元数据与引用字段


| 词             | 含义                           |
| ------------- | ---------------------------- |
| `MetaUi`      | 一个仓库的界面元数据根                  |
| `MetaUiGroup` | 主表区或子表                       |
| `MetaUiField` | 字段声明                         |
| `reference`   | 字段上的 relation：口语 `enum` / `ref` / `hasOne`（完整见 `MetaRelationType`，含子表 `HAS_MANY`） |


选项显示走 `labelOf`，提交/过滤走 `valueOf`。不要对选项 `getDistinct`，不要做成厂商外键列。细则见 [字段引用](../.cursor/rules/mmda-field-reference.mdc)。关系类型 vs 关联对象见 [relation 与 relative](#relation-与-relative)。

- 元数据硬限制：`reference.where`（SQL，不可改）
- 业务加码：Logic `refWhere`，与 `where` AND
- `ref`：小表，全量缓存；`hasOne`：大体量业务对象，不缓存，客户端要整份实体

---

## 业务枚举成员

元数据串是 `value;code;label`，多成员用 `|` 连接：

```text
0;NEW;新注册|1;ACTIVATED;已激活|-1;LOCKED;锁定
```


| 段       | 是什么      | 谁用                                     |
| ------- | -------- | -------------------------------------- |
| `value` | 数字序号（可负） | 位掩码、后端TINYINT                          |
| `code`  | 英文成员名    | **实体字段存这个**；`reference.valueOf`        |
| `label` | 显示文本     | `reference.labelOf` / `XxxEnum.textOf` |


前端生成文件：`packages/base/src/enums/UserStatus.ts`。

```ts
export const enum UserStatus {
  NEW = 'NEW',           // 0 新注册
  ACTIVATED = 'ACTIVATED',
}
export const UserStatusEnum = {
  NEW_VALUE: 0,
  NEW_TEXT: '新注册',
  valueOf(code: UserStatus): number { /* code → 序号 */ },
  textOf(code: UserStatus): string { /* code → 中文 */ },
}
```

约定：

- 文件 / `const enum`：**PascalCase**（`UserStatus`）
- 成员：**SCREAMING_SNAKE**，字符串值与成员名相同（`LOCKED = 'LOCKED'`）
- 配套对象：`XxxEnum`，键 `MEMBER_VALUE` / `MEMBER_TEXT`
- 目录：`src/enums/`，不要塞进 `modules/`

`MetaUiFieldRef.valueOf`（选项对象 → 存库值）和 `UserStatusEnum.valueOf`（code → 序号）同名不同层，不要混调。表单/列筛只走字段引用的 `valueOf` / `labelOf`。

框架自己的位枚举（`ModuleOp`、`EntityState`）成员是数字；业务状态枚举成员是字符串 code。不要把 `UserStatus.NEW` 写成 `0`。

---

## 权限位

模块能力是 **位掩码** `Module.allowOps`（`ModuleOp`）。用户授权是布尔结构 `Module.authority`（`ModuleAuth`）。无 `authority` 时由 `auth(allowOps)` 拆开。


| 位   | `ModuleOp` | 值   | `ModuleAuth`  | 标准按钮                   |
| --- | ---------- | --- | ------------- | ---------------------- |
| 读   | `READ`     | 1   | `allowRead`   | 进详情、菜单可见               |
| 改   | `EDIT`     | 2   | `allowEdit`   | `edit` / `save`        |
| 增   | `CREATE`   | 4   | `allowCreate` | `create` / 子表 `add`    |
| 删   | `DELETE`   | 8   | `allowDelete` | `delete` / `deleteAll` |
| 打   | `PRINT`    | 16  | `allowPrint`  | `print`                |
| 出   | `EXPORT`   | 32  | `allowExport` | `export`               |
| 入   | `IMPORT`   | 64  | `allowImport` | `import`               |
| 模   | `UPLOAD`   | 128 | `allowUpload` | 上传模板                   |
| 下   | `DOWNLOAD` | 256 | `allowDownload` | 文件 `fileLink` 能否包下载链 |


组合口语句：`CRUD = 15`，`ALL = 255`（不含下载位）。代码里用 `hasBit(allowOps, ModuleOp.EDIT)`，不要手写魔法数。

`factory.fileLink` 的 `downloadable` 接 `allowDownload !== false`（旧 authority 没这字段当能下）。无下载权仍可用 `preview`。不要另加权限位。

权限字段一律 `allow` + 动词，**camelCase**：`allowRead`，不要 `canRead`、`readAuth`。行上还有实体标志 `editable` / `deletable`：会话里 `getModuleAuth(row)` 会把 `allowEdit && row.editable !== false` 合成后给按钮。

模块树三级：`ModuleType` = `SYSTEM` | `MODULE` | `FEATURE`。编码 `moduleCode`（如 `A.01.001`），路由 `moduleUrl`，实体名 `objName`（对仓库）。

---

## 动作：三层名字


| 层     | 类型             | 键                                  | 角色             |
| ----- | -------------- | ---------------------------------- | -------------- |
| 权限目录  | `ModuleAction` | `actionCode`                       | 给角色打勾；**不是**按钮 |
| 实体元数据 | `EntityAction` | `name`                             | 服务器下发的行为声明     |
| 界面    | `UiAction`     | `name`（工厂里 `id` 为 `{name}-button`） | 工具栏 / 行菜单真正点的  |


`ModuleAction` → 服务端转成 `EntityAction` → vui `UiContextAction` / `entityActionFactory` 建成 `UiAction`。不要在 `EntityAction` 上加 `canDo`；`canDo` 只属于 `UiAction`，来自 `executableExpression`。

`ModuleAction.actionModes` 是另一套位，表示按钮出现在哪类界面，**不是** `UiViewType`：


| `ModuleActionMode` | 值   | 对应视图              |
| ------------------ | --- | ----------------- |
| `READ`             | 1   | `details`         |
| `EDIT`             | 2   | `edit` / `create` |
| `LIST`             | 4   | `index`           |


`UiAction.view` 才是 `details,edit` 这种视图字符串。

### 标准动作 `EntityActionType`

`name` 用 camelCase 字面量，与 i18n `action.{name}`、工厂键相同。


| `name`                       | 中文           | 权限            | 出现位置      |
| ---------------------------- | ------------ | ------------- | --------- |
| `back`                       | 返回           | —             | 表单        |
| `create`                     | 创建           | `allowCreate` | 列表        |
| `confirm`                    | 确认           | —             | 选择器 / 对话框 |
| `cancel`                     | 取消           | —             | 选择器 / 对话框 |
| `edit`                       | 编辑           | `allowEdit`   | 详情、列表行    |
| `save`                       | 保存           | `allowEdit`   | 编辑 / 创建   |
| `delete`                     | 删除           | `allowDelete` | 详情、行      |
| `deleteAll`                  | 批量删除         | `allowDelete` | 列表（勾选）    |
| `refresh`                    | 刷新           | —             | 列表        |
| `print`                      | 打印           | `allowPrint`  | 列表 / 详情   |
| `import`                     | 导入           | `allowImport` | 列表        |
| `export`                     | 导出           | `allowExport` | 列表        |
| `add`                        | 添加（子表行）      | `allowCreate` | 编辑子表      |
| `remove`                     | 移除（子表行）      | `allowDelete` | 编辑子表      |
| `upload`                     | 上传           | `allowUpload` | 附件        |
| `download`                   | 下载           | —             | 附件        |
| `clear` / `reset` / `search` | 清除 / 重置 / 搜索 | —             | 搜索栏       |
| `addChild` / `removeChild`   | 树节点          | 分类树权限         | 树         |


业务动作不要占用上表名字。`rowActions` **只放额外业务项**；详情 / 打开编辑 / 删除 / 子表新增由表格内置 CRUD 提供。

业务 `actionCode` 用 camelCase 动词（`approve`、`giveUp`），文案走 `displayLabel` 或 `action.{name}`。颜色角色：`primary` / `secondary` / `success` / `info` / `warning` / `danger`（旧值 `warn`→`warning`，`error`→`danger`）。

`visible`：有没有这项。`canDo`：有但能不能点（表达式如 `editable && !closed`）。不要用 `disabled` 代替行级 `canDo`。

---

## 查询相关名字


| 词                      | 放哪                       | 不要当成             |
| ---------------------- | ------------------------ | ---------------- |
| `EntitySearchParam`    | 当次列表查询                   | 元数据              |
| `EntityQuery`          | 可保存的查询（无 `queryParams`）  | FilterModel JSON |
| `filterModel`          | 表头/搜索栏结构化条件              | `MetaUiFilter`   |
| `MetaUiFilter`         | 快捷过滤声明                   | AG Grid 模型       |
| `Module.defaultFilter` | `queryID;queryName|…` 芯片 | FilterModel      |
| `pager.sorts`          | **唯一**排序位置               | 再存一份 sorts       |


---

## 易混对照


| 想说的      | 正确名字                                   | 不要写成                             |
| -------- | -------------------------------------- | -------------------------------- |
| 列表页      | `index`                                | 把视图写成 `list` / `table` / `grid`   |
| 列出实体的契约 | `UiListProps`（`factory/list.ts`）+ 整页 `UiListViewProps`（`builder/list_view.ts`） | vui 建 `ui_grid.ts`、过时路径 `ui_list.ts` |
| 只读表 / 只读子表 | `buildTable` / `factory.table` / `display: table` | 移动端主列表顶桌面表 |
| 可编表 / 进格子表 | `buildGrid` / `factory.grid` / `display: grid` | 另起一套 grid props 文件 |
| 树形表 | `buildTreeGrid` / `factory.treeGrid`；字段 `tree_grid.ts` | 把 `treeGrid` 写成 `view` |
| 高能力表实现  | 皮肤 `SfGrid` / `AgGrid`（本轮可同时承接 table 与 grid） | 写进 vui、vui 再建 `ui/factories/`     |
| 选一条 / 多条 | `selectOne` / `selectMany`             | `select`、`selector`（后者是表格 scene） |
| 打开选记录弹层  | `context.select(field)` 或 `select({ repository })` | `pickRelative`、`buildSearchForRelativeContent`、新写 `UiSelector` |
| 是/否确认      | `uiBuilder.confirm`                    | `confirmMessage`、`app.confirm`、`accept` 回调      |
| 弹层塞内容      | `uiBuilder.dialog`                     | `confirmDialog`、`factory.dialog`、`$toast`                      |
| 提示           | `uiBuilder.toast`                      | `$toast.add`、`summary`/`detail`、`group` |
| 壳上用户/模块   | `app.state`                            | `app.context`                        |
| 新建       | `create`（视图）/ `Create`（路径）             | `new`、`add`（`add` 是子表加行动作）       |
| 详情       | `details`                              | `detail`、`show`、`view`           |
| 后端服务     | `service: 'base'`                      | 包名 `@mmda/base` 当 API 名          |
| 仓库        | `repository: 'Materials'`（实体复数）       | 目录名 `materials`、实体类 `Material`    |
| 实体交互逻辑  | `UiLogic` / `MaterialLogic`            | 「仓库逻辑」、`RepositoryLogic`、`EntityManager`、ViewModel、皮肤组件 |
| 实体间关系    | `relation` / `MetaRelationType`        | `relative`（那是关联对象）               |
| 小表引用      | `ref`（全量缓存 `refOptions`）           | 当成 `hasOne` 灌缓存                     |
| 业务一对一    | `hasOne`（按需取整份实体）                 | 当小表 `loadReferenceOptions`            |
| 关联对象      | relative：`relObjName`、`addRelativeLogic` | `relation`、CSS `relative`、`relativeTime` |
| 无 Vue CRUD 基类 | `EntityLogic`（core）                 | `EntityManager`、`RepositoryLogic`   |
| 拼复杂视图    | `buildListView` / `VueUiBuilder` | `AbstractUiBuilder`、`VueUiBuilderHost`、把 vui 实现 alias 成 `UiBuilder`、皮肤 Builder 里调 API |
| 控件填色     | `colorRole`                            | `severity`（那是 toast/校验）        |
| 取色         | `factory.colorPicker`（hex）           | `colorRole`、厂商 `modeSwitcher`     |
| 掩码输入     | `factory.maskedTextBox`                | 普通 `input`、`InputMask`、`ejs-maskedtextbox` |
| OTP          | `factory.oneTimePasswordInput`         | `InputOtp`、`ejs-otpinput`、普通 `input` |
| 数值输入     | `factory.numberInput`                  | 普通 `input`、`NumericTextBox`、`InputNumber` |
| 进度条       | `factory.progressBar`                  | `factory.loading`、`ejs-progressbar`、`NProgress` |
| 签名面板     | `factory.signaturePad`（PNG data URL） | `imageEditor`、`ejs-signature`、`SignatureComponent`、npm `signature_pad` |
| 步骤条       | `factory.stepper`（当前步索引；子表用 `*Field`） | `ejs-stepper`、`StepperComponent`、Prime `Stepper`、`NSteps` |
| 时间轴       | `factory.timeline`（默认列表；插件 Tempis） | `ejs-timeline`、`TempisTimeline`、`NTimeline`；甘特；scheduler `timelineWeek` |
| 相对时间     | `relativeTime`（core 函数 + vui 单元格） | `pastTime`、`futureTime` |
| 横竖方向     | `UiOrientation`（=`UiDirection`）       | 控件私有 `UiStepperOrientation` / `UiDividerOrientation` / `UiChartOrientation`（已弃用）；Splitter 的 PascalCase 除外 |
| 带输入选日   | `factory.datePicker` / `monthPicker`   | `factory.calendar`、厂商 `start`/`depth` |
| 月视选日     | `factory.calendar`                     | `scheduler`、甘特                      |
| 排程日历     | `scheduler` 插件 / `buildSchedulerView` | `factory.calendar`、`factory.scheduler`、`ejs-schedule`、`FullCalendar` |
| 日期时间     | `factory.dateTimePicker`               | 当成 `datePicker` + 自己拼时间         |
| 时刻         | `factory.timePicker`                   | 字符串 `"HH:mm"` 当 chrome 值          |
| 日期区间     | `factory.dateRangePicker`（`[Date, Date]`） | `datePicker` + `selectionMode: range` |
| 封闭下拉     | `factory.dropDownList`                 | `dropdown`、`DropdownList`           |
| 少选项单选组 | `factory.radioButtonGroup`             | `radioGroup`、`ejs-radiobutton`、`selectButtonGroup` |
| 整钮菜单     | `factory.dropDownButton`               | `menuButton`、`dropdownMenuButton`、`factory.dropDownMenu` |
| 更多菜单     | `factory.moreMenuButton`               | `builder.moreMenuButton`（已删）     |
| 主段+箭头    | `factory.splitButton`                  | 当成 `dropDownButton`（Naive 才降级） |
| 浮钮         | `factory.floatingActionButton`         | `Fab`、`ejs-fab`、SpeedDial、`splitButton` |
| 可编下拉     | `factory.comboBox`                     | 当成 `dropDownList` / `autoComplete` |
| 角标叠放     | `factory.badge` + `overlay`            | Prime `OverlayBadge`、EJ2 `notification` 写进业务 |
| 内容面板     | `factory.card`                         | `GroupCard` / `buildGroupCard`（那是表单分组） |
| 分隔线       | `factory.divider`                      | 菜单 `action.divider`、breadcrumb `separator` |
| 提示气泡     | `factory.tooltip`（包一层）            | 按钮 `tooltip` 原生 title、`ejs-tooltip`、`v-tooltip`、`NTooltip` |
| 业务读接口    | `this.getAll` / `this.load` / `this.doAction` / `context.apiClient` | `context.globalProps.$api` |
| 应用壳        | core `MmdaApplication`；vui `MmdaVueApp` | Vue `App`、`$app`、把 vui 壳仍叫 `MmdaApplication` |
| 字段逻辑     | `MetaUiFieldLogic` / `this.field('x')` | 改共享的 `MetaUiField`               |
| 枚举存库值    | 成员 **code**（`'NEW'`）                   | 序号 `0`、中文「新注册」                   |
| 模块能力     | `allowOps` / `allowEdit`               | 动作 `name: 'edit'`、视图 `edit`      |
| 角色勾选目录   | `ModuleAction` / `actionCode`          | 直接当工具栏按钮                         |
| 子表加行     | `add`                                  | `create`（那是新建主表）                 |
| 批量删      | `deleteAll`                            | `delete`、`remove`                |



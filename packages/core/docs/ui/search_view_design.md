# 搜索页（buildSearchView）设计与落地计划

移动端搜索页：一行 = **字段 + 操作符 + 值**，从上到下（Column），默认行由元数据 / Logic 装配，确认后筛选列表。
与 [过滤框架设计](../models/entity_filter_design.md)（SearchView 只读写 `FilterModel`）、[UI 四职重构设计](./ui_four_roles_design.md)（Builder 只拼多块组合）配套。

**状态：已落地（core → vui → 皮肤 → rui 一轮）**。本文先记设计与拍板，末尾 §11 记落地实况与偏差。

## 0. 落地前的现状（保留作背景，代码位置已变）

| 事实 | 证据 |
|---|---|
| core 把 `buildSearchView` 注释成 TODO，只留 `buildSearchField(field: UiSearchField, …)` | `src/ui/builder.ts:233-244`；`UiSearchField` 定义 `:45-48` |
| vui 三处调 `this.buildSearchView(...)`，但 `VuiBuilder` 里**没有**这个方法 | `packages/vui/src/ui/builder/topbar.ts:625`、`builder/list_view.ts:511`、`:1198` |
| 却过 typecheck —— mixin 泛型基类让 `this` 上任意成员不查 | `packages/vui/src/ui/builder/list_view.ts:101` `WithList<TBase extends AbstractConstructor>(Base)` |
| 后果：compact 顶栏放大镜点下去 `is not a function` | `topbar.ts:305-311`（放大镜只在 compact 档）→ `:623-626` → 无实现方 |
| rui 已按「搜索页 = 路由」定调 | `packages/rui/src/ui/builder.ts:783-794` → `context.routeToSearch()` |
| `UiViewOne.Search` / `routeToSearch()` / `routePath()` 都在 core，但 app 路由与视图解析都没有 Search | `src/ui/view.ts:60`、`src/ui/context_base.ts:1687/1711`、`packages/app/src/router.ts:66-71` |
| `UiSearchField` / `VuiSearchField` 生产代码零构造零赋值（只有一处**读**） | `packages/vui/src/ui/factory/filter.ts:161-253`；`packages/mes/src/modules/lineside_inventories/component/CompleteShipment.ts:84-97` |
| 逻辑层 `beforeSearch().fields` 只当字段逻辑绑定，不进任何搜索 UI | `src/logic/entity_logic.ts:339-350`、`:396-406`（`bindLogics`）；`packages/core/src/ui/context_base.ts` 的 `init()` 只收 `customSearchFields` |

结论：**搜索页的「默认字段」在框架里没有主人**；`UiSearchField` 家族是死重，删除。

## 1. 拍板结论

1. **承载两态**：路由页（`UiViewOne.Search`，移动端全屏）/ 桌面端右侧 `factory.drawer` 弹出。内容同一份 `buildSearchView`，承载由 `placement` 决定（`'auto'` 默认，皮肤按视口判定）。
2. **草稿语义**：进页克隆一份 `FilterModel`，点「确定」才写回并筛选。返回不写。
3. **允许多行同字段**：行 = 叶子；提交时同字段多叶合并成 `FieldFilter.multi([...])`（与表头过滤的 multi 同义）。
4. **默认行来源**：`beforeSearch().fields`（有就用它，含顺序）→ 为空才回落 `listed fields` 里 `sortable === true`。
5. **模糊搜框**：`showSearchWord: 'auto' | true | false`，`auto` = 移动端显示、桌面端隐藏（桌面搜索栏已有模糊搜，重复）。候选池默认 `listed fields`。
6. **远程 ref 取值不叠行列约束**：搜索没有「当前行」，`refWhere` 是行约束、不适用；选项从列表会话取（见 §5）。

## 2. 词汇与真源（不造新词、不用 SQL 算子）

搜索页的值语义**照抄表头过滤**，不用 `logic/sql_operator.ts`（那是 metadata `where` / `refWhere` 的 SQL 片段词汇，`IN/NOT_IN` 只是它的 `parameters: 3` 私有实现细节）：

| 需要 | 真源 |
|---|---|
| 列过滤类别 | `columnFilterKindOf(field)` → `'boolean' \| 'set' \| 'multi' \| 'range' \| 'text'`，`packages/vui-syncfusion/src/factory/filter_kind.ts:33-49`（`vui-agnaive/src/filter_kind.ts` 有同一份） |
| 位掩码取值 | `resolveColumnFilterTypes` / `hasFilterType`，同上 `:4-17`；`MetaUiFilterType` 见 `src/metaui/metaui_filter.ts:32` |
| 菜单算子表 | `AG_MENU_STRING_OPERATORS` / `AG_MENU_NUMBER_OPERATORS` / `AG_MENU_DATE_OPERATORS`，`packages/vui-syncfusion/src/factory/utils.ts:110-143` |
| set 多值落盘 | `toSetFilter` / `toEnumInFilter` → `{filterType:'set', operator:'IN'\|'NOT_IN', values:[]}`，`utils.ts:426-452` |
| BETWEEN 双值 | 上下界都在 → `{filterType, operator:'BETWEEN', value, valueTo}`，`utils.ts:500-524` |
| 多叶叠加 | 比较叶 + set 叶 → `{filterType:'multi', filterModels:[…]}`，`utils.ts:559-564` |
| 无值算子 | `isNoValueFilterOperator(IS_NULL/IS_NOT_NULL/IS_BLANK/IS_NOT_BLANK)`，`src/models/entity_search.ts:192-201` |

**值形态规则（搜索页与表头过滤共用）**

| kind | 算子 | 值 |
|---|---|---|
| `set`（含 enum / ref / hasOne） | `IN` / `NOT_IN` | 多值 `values[]` |
| `boolean` | `IS_TRUE` / `IS_FALSE` / `IS_NULL` / `IS_NOT_NULL` | **无值控件** |
| `range`（number / date） | `EQ NEQ GT GE LT LE`（+ 空值） | 单值；上下界都填 → `BETWEEN` 双值 |
| `text` | `CONTAINS NOT_CONTAINS EQ NEQ STARTS_WITH ENDS_WITH`（+ `IS_BLANK` / `IS_NOT_BLANK`） | 单值；后两个无值 |
| `multi` | — | 同字段多行合并 |
| 日期 `WITHIN` | `WITHIN` | 单值 = 周期 token（`DATE_RANGE_FILTER_KINDS`），落 `FieldFilter.dateKind` |

即：**只有 `BETWEEN` 要两个值，`IN/NOT_IN` 是 set 过滤器（多值），其余单值或零值**。

配套改动：把 `filter_kind.ts` 上移 core（现在两个皮肤各一份），core 新增 **`getColumnFilterOps(field)`**（按 kind 给列过滤算子）。**不复用 `MetaUiFilterOperatorEnum.*FilterOperators`**：那几组把 set 类算子混进比较算子组（`textFilterOperators` 里的 `IN/NOT_IN/BETWEEN`），是 SQL 片段口径。**`getFieldFilterOps` / `getSqlOperator().parameters` 不用于搜索页**。

## 3. core 契约

新增 `packages/core/src/ui/builder/search_view.ts`（与 `builder/filter_bar.ts` 同层）：

```ts
/** 一个搜索条件行：字段 + 操作符 + 值。行状态就是 FieldFilter，没有第二个模型。 */
export interface UiSearchFieldProps extends UiProps {
  /** 当前条件；空行 undefined。 */
  filter?: FieldFilter
  /** 值变化回写；清空回 undefined。 */
  onFilterChange?: (filter: FieldFilter | undefined) => void
  /** 限定操作符；缺省按 kind 给（见 §2）。 */
  operators?: MetaUiFilterOpCode[]
  disabled?: boolean
}

export interface UiSearchViewProps extends UiProps {
  /** 默认行字段；缺省按 §4 装配。 */
  fields?: MetaUiField[]
  /** 可添加的候选字段；缺省 = listed fields 去掉已在列的。 */
  candidates?: MetaUiField[]
  /** 承载：auto = 皮肤按视口判定（compact → 路由页，桌面 → 右侧抽屉）。 */
  placement?: 'auto' | 'page' | 'drawer'
  /** 模糊搜框：auto = 移动端显示 / 桌面隐藏。 */
  showSearchWord?: boolean | 'auto'
  /** 确定。 */
  onConfirm?: () => void | Promise<unknown>
  /** 重置草稿。 */
  onReset?: () => void
}

export interface UiSearchViewSlots<TNode = any> {
  /** 追加在字段行之后的自定义内容（如 customSearchFields）。 */
  default?: () => TNode | TNode[]
  /** 底部动作行覆盖。 */
  actions?: () => TNode | TNode[]
}
```

`src/ui/builder.ts` 改两处（`:233-244` 那段）：

```ts
/** 搜索页：字段行（Column）+ 动作行；承载由 placement 决定。 */
buildSearchView(context: UiContext, props?: UiSearchViewProps, slots?: UiSearchViewSlots<TNode>): TNode

/** 单个搜索条件行：字段 + 操作符 + 值。 */
buildSearchField(field: MetaUiField, context: UiContext, props?: UiSearchFieldProps): TNode
```

- `buildSearchField` 保持 3 参形状（与 `editFor(field, context)` 同构），第一参从死类型 `UiSearchField` 换成 `MetaUiField`，值与回写进 props。
- 删 `UiSearchField`（`:45-48`）。

## 4. 字段装配

真源顺序：

1. **Logic 声明**：`beforeSearch()` 返回的 `fields`（`MetaUiFieldLogic<E>[]`）就是搜索字段，顺序即行序。程序员可：
   - 全部重写：`beforeSearch() { const r = super.beforeSearch(); r.fields.length = 0; …这样不写搜索页字段 }`
   - 增：`fields.push(this.field('materialCode'))`
   - 删：`fields.splice(indexOf(field('x')), 1)`
2. **回落**：`beforeSearch().fields` 为空 → `metaUi.getListedFields()`（`src/metaui/metaui_group.ts:243`）里 `field.sortable === true` 的字段，按 listed 顺序。
3. **候选池（「其他字段可添加」）**：`listed fields` 去掉已在列的字段（`listedFields` 兜底写法见 `packages/vui-syncfusion/src/factory/utils.ts:23-30`）。
4. **必留行**：草稿里已有条件的字段无条件在列（表头过滤 / 命名查询带进来的字段，即使不在 1/2 的清单里）。

落地要点：搜索视图的 context（`view === search`）跑 `beforeSearch()` 后，字段清单要能被页面读到。今天 `applyTo → bindLogics` 只把它们塞进 `fieldLogics`（`src/ui/context_base.ts`），需要一条保序的会话级读法（建议 `UiContext.searchFields: MetaUiField[]`，只在 `view === search` 时由 `bindLogics` 写入），core `init()` 已拿到 `logicResult`（`packages/core/src/ui/context_base.ts`）。

## 5. 状态与提交（草稿 + 多行同字段）

- 页面内部行模型（**不进 core 契约**）：`{ fieldName: string; filter?: FieldFilter }[]`。
- 进页：`draft = FilterModel.clone(indexContext.searchParam.filterModel)`（`src/models/entity_search.ts:414`），按 §4 补默认空行。
- 值变化：只改行内 `filter`；空行用 `FieldFilter.isEmpty`（`:288`）判定。
- 确定：同字段多叶 → `FieldFilter.multi([叶…])`（`:395`；单叶退化成叶子）→ `writeListFilterModel(indexContext.searchParam, model)`（`src/ui/builder/list_query.ts:33`，自带 `pageNo = 1`）→ `indexContext.search()` → 关承载（抽屉收起 / 路由回列表）。
- 重置：清草稿；返回：不写。
- `customSearchFields`（`beforeSearch` 声明的自定义搜索字段）继续走既有渲染器，挂在 `slots.default`。

**读写的搜索参数属于 index 会话**：搜索页（One 态）自己跑 `beforeSearch` 拿字段，提交写回保活的 index 会话 `searchParam`。vui 的工作区 `VueModuleContext` 已存着 index 会话（`registerIndex`，`packages/vui/src/contexts/vue_module_context.ts:67-69`）但没暴露读法 —— 补一个 `indexContext(): VuiContext | null`，与 `applyCurrentRow` / `removeById` 同属「工作区同步」。

**字段选项也从 index 会话取，不叠模型实例的 `refWhere`**（拍板 6）：`context.searchRelative(field, word)`（`src/ui/context_base.ts:1382`）内部 `const row = model ?? (Array.isArray(this.model) ? undefined : this.model)`（`:1387`）——列表会话 `model` 是行数组 → `row` 为 `undefined` → 不拼 `queryParams.filter`（`:1400-1403`），正是搜索要的「全量 / 只按 searchWord 收窄」。**所以取选项必须走 index 会话，不要走 search 视图会话**：后者的 `model` 是 `{ id: route.params.id }`（`packages/vui/src/components/EntityView.ts:236`，`many === false` 分支），会被当成「有一行」传进 `buildRefWhere`。enum / 已穷尽的 ref 直接读 `field.reference.refOptions`；远程 ref / hasOne 才按 word 走 `searchRelative`。

## 6. 拼屏与分工

```
buildSearchView(context, props, slots)          ← core AbstractUiBuilder，两个运行时共享
  layout.layoutPage({
    toolbar: 返回 + t('action.search') + 模糊搜框(buildModuleSearchbar，写 searchParam.searchWord)
    primary: [ layout.column([...字段行]) , slots.default?.() ]
    footer : slots.actions?.() ?? buttonGroup([重置, 确定])
  })
```

- 字段行 = `buildSearchField(field, context, { filter, onFilterChange })` + 字段标签（`builder.labelFor`）+ 行尾清除按钮；行控件落点是 `factory.dropDownList`(算子) 与按 kind 选的值控件（`factory.textInput` / `numberInput` / `datePicker` / `dateRangePicker` / `comboBox` / `multiSelect`）—— 都是厂商原生控件，core 写一次默认实现，皮肤可覆写。
- 皮肤覆写点：`buildSearchField`（整行）、承载（页面壳 / `factory.drawer({ position: 'Right', closeOnDocumentClick: true })`）。
- vui 接线：
  - 放大镜（compact 档）改 `context.routeToSearch()`（照 `packages/rui/src/ui/builder.ts:785-794`），删 `onSearchPage` 穿参（`topbar.ts:623-626`、`list_view.ts:510-522`、`:1197-1205`）。
  - `EntityWorkspace` 的 covering 叠层（`packages/vui/src/components/EntityView.ts:421-460`）天然承载路由页；`resolveEntityView`（`:96-104`）补 `/Search` 分支，app 路由补 `Search` 子路由（`packages/app/src/router.ts:66-71`）。
  - 桌面端「高级搜索」入口打开右侧抽屉。
- rui 对齐：`RuiBuilder` 实装 `buildSearchView` / 重写 `buildSearchField`（今天它拿 `editFor` 当筛选值编辑器，见 `packages/rui/src/ui/builder.ts:648-658`）。

## 7. 删除清单

代码 14 处：core `src/ui/builder.ts:45-48`；vui `ui/factory/filter.ts:161-253`、`logic/logic.ts:40-45`、`contexts/mixins/data.ts:46/107/151-160/176-184`、`ui/builder.ts:266-272/881/884`、`__tests__/test_builder.ts`；vui-syncfusion `builder/module_bar.ts:21-85`、`builder/index.ts:278`；vui-primevue `prime_builder.ts:301-360`；vui-agnaive `agnaive_builder.ts:495/751`；rui `ui/builder.ts:648-658`；mes `CompleteShipment.ts:84-97`。
文档：`REFACTOR.md:96`、`docs/naming.md:721-723`、`packages/vui/docs/list.md`。

## 8. 落地顺序与验证

1. core：`builder/search_view.ts` 契约 + `UiBuilder` 两方法 + `filter_kind` 上移 + 列过滤算子入口 + `UiContext.searchFields`。
   `cd packages/core && ./node_modules/.bin/vitest run`（含架构门禁）。
2. core：`AbstractUiBuilder.buildSearchView` / `buildSearchField` 默认实现（行 = Column，值控件按 kind）。
3. vui：放大镜 `routeToSearch`、删 `onSearchPage`、`resolveEntityView` + 路由 + 封面承载、`VueModuleContext.indexContext()`。
   `cd packages/vui && ./node_modules/.bin/tsc -p tsconfig.typecheck.json --noEmit && ./node_modules/.bin/vitest run`。
4. vui-syncfusion：行控件用 ej2 原生组件（算子下拉 + 值控件，set → MultiSelect）。
   `cd packages/vui-syncfusion && ./node_modules/.bin/tsc -p tsconfig.typecheck.json --noEmit && ./node_modules/.bin/vitest run`。
5. rui / rui-syncfusion 对齐；vui-primevue / vui-agnaive 声明待对齐（未覆写则走 core 默认行）。
6. app 路由 + 桌面抽屉入口；`docs/naming.md` / `REFACTOR.md` / 本文回改。

## 9. 待实测风险点

- **远程 ref 字段取值**（已定：不叠 `refWhere`，见 §5 与拍板 6）——**实测结论**：`buildRefWhere` 在无行时**不保证安全**（`packages/mes/src/modules/equipments/EquipmentLogic.ts:279-291` 直接读 `model.lineID`），但**当前搜索页默认实现不会踩到**：core 行控件只给 `options`（`reference.refOptions`）+ `allowFiltering`，**不传 `suggest`**，而皮肤的远程搜只由 `props.suggest` 触发（`packages/vui-syncfusion/src/factory/drop_down_list.ts:20`）→ 搜索页不发 `searchRelative`。给搜索页的远程 ref 加「按词搜」前，先把「无行」表达出来（别偷偷拿 `row === undefined` 调 `buildRefWhere`）。`loadReferenceOptions` 的「搜索页不走这里」注释（`:1415-1418`）保留：它是给行模型预热全量选项的。
- **桌面抽屉挂载点 / 窄屏排法 —— 已真浏览器实测通过**（探针 `packages/playground/.tmp_search_probe.*`、`.tmp_search_route_probe.*`，vite dev + 预览窗格回读）：
  - 桌面抽屉（agnaive 皮肤）：`factory.drawer` 输出 `{x:180,w:420,right:600}`（视口 600）→ 贴右侧、宽 420、白底 `position:absolute` 覆盖在上层；抽屉内含 6 行 + 确认按钮。
  - 窄屏（380px 容器走 `page` 承载）：外壳宽 379；首行 label 独占一行（y=1202）、算子下拉（y=1225）、值输入（y=1301）**竖排**，`scrollWidth === clientWidth === 379`（无横向溢出）；布尔行（无值控件）行高更矮。
  - 真路由：compact 顶栏放大镜 `router.push: ["/DEMO/Products/Search"]`（缺省 `routeToSearch()`，不再调不存在的 `buildSearchView`）；进页后 `.mmda-view--covering` 生效、列表页 `aria-hidden="true"` 保活、覆盖层 rect 与工作区 rect 完全一致（`{x:272,y:12,w:361,h:1018}`）、搜索页 6 行（回落 `sortable`）、行内是厂商原生控件、模糊搜框在（compact = 页面承载）。
  - 交互回写：重置 → 6 行保留、值清空；确认 → `searchParam.filterModel = {code:{filterType:'text',operator:'EQ',value:'P-9'}}`、`pageNo = 1`、关承载回调被调。
- **`multi` 行的回显**：既有 `multi`（比较 + set）拆成两行后重编，避免每次打开搜索页都改写模型。

## 10. 非目标

- 不改 `searchAll` 的 POST JSON 形状与 `EntitySearchParam`。
- 不动 `QueryBuilder` / `AdvancedFilterModel`（高级树仍归 QueryBuilder）。
- 不改 `Module.defaultFilter`（`t.status=1` 那套）与命名查询的读写。
- 不把搜索页做成弹层（`dialog`）。

## 11. 落地实况（代码落点 + 与本文设计的偏差）

| 设计 | 落地 |
|---|---|
| 契约 | `packages/core/src/ui/builder/search_view.ts`（新）：`UiSearchRow` / `UiSearchFieldProps` / `UiSearchViewProps` / `UiSearchViewSlots` / `UiSearchViewPlacement` |
| 装配与换算 | 同文件：`defaultSearchFields`、`searchFieldCandidates`、`searchModelOf`（行→模型，多叶按 `join` 或 `multi` 收）、`searchRowsOf`（模型→行，`multi`/`join` 摊平）、`seedSearchRows`、`resetSearchRows`、`applySearchDraft` |
| 入口 | `UiBuilder.buildSearchView` / `buildSearchField`（`src/ui/builder.ts`），默认实现在 `AbstractUiBuilder`（`src/ui/builder_base.ts`）——**两个运行时共用**；行控件只用 `factory.*`（厂商原生控件） |
| 草稿 | `UiContext.searchRows`（`src/ui/context.ts` + `context_base.ts`，惰性 `rx` 响应式；赋值原地 splice 保引用）。**不是**另存一份 `FilterModel`：行是叶子列表，确认时才 `searchModelOf` 收成模型 |
| 默认行 | `bindLogics`（`context_base.ts`）：`UiViewOne.Search` → `beforeSearch().fields` 有就用（含顺序），空则回落 `defaultSearchFields`（listed fields 里 `sortable === true`）；**many 视图（index/select）也播默认行**，桌面抽屉直接用列表会话当草稿 |
| 列过滤算子 | `getColumnFilterOps` + `resolveColumnFilterTypes` / `hasFilterType` / `simpleFilterTypeOf` 落在 `metaui/metaui_field.ts`（表数据 `defaultColumnFilterOps` 在 `metaui/metaui_filter.ts`） |
| 叶子构造 | `FieldFilter.leaf(field, operator, draft)` + `FieldFilter.draftOf(filter)`（`models/entity_search.ts`）；`isNoValueFilterOperator` 由私有改导出 |
| 承载 | vui `ui/builder/search_view_page.ts`（新）：compact → `layout.layoutPage`；桌面 → `factory.drawer({ position: 'Right' })`。路由统一 `/Search`（app `router.ts` 加子路由 + vui `resolveEntityView` 加分支 + `EntityOneView` 覆盖层渲染），`VueModuleContext.indexContext()` 让搜索页拿到保活的列表会话 |
| 入口按钮 | 顶栏放大镜缺省 `context.routeToSearch()`（`vui/ui/builder/topbar.ts`，照 rui 早先的写法）；删掉 `list_view` 两处 `onSearchPage` 穿参 |
| 入口可达性 | 顶栏档位 `resolvedIndexTopbarLayout(props, dense)`（`vui/ui/builder/topbar.ts`）：`layout` 显式给了就钉死，没给才按视口定档；`list_view.ts:509` / `:1171` 去掉 `?? "full"` 兜底（否则窄屏永远 full 档、放大镜不渲染 → 移动端点不到搜索页）。详见 §12 |

与本文设计的三处偏差（都是落地时判定的更小改动）：

1. **没有整体上移 `filter_kind.ts`**：只上移了掩码三件套 + 新增 `getColumnFilterOps`；`columnFilterKindOf`（带 `range` 这个词）与 `simpleFilterTypeOf` 的皮肤副本仍留皮肤 —— core 没有 `range` 概念（原注释就写着「不是 core 词汇」），`getColumnFilterOps` 按 `MetaUiFilterType` 位直接出表，不进 `kind` 词。
2. **行状态是 `UiSearchRow`**（字段名 + 叶子 + 可选 `join`），不是「每行一个 `FieldFilter` map 项」：同字段多行必须能各自持叶，`FilterModel` 的键不够用。仍是 `FieldFilter` 独占叶子，没有第二套值模型。
3. **`buildSearchView` 不出页壳**：只产「模糊搜 + 字段列 + 动作行」，页壳（`layoutPage`）与抽屉由承载方加 —— 一份内容两种承载。

已验（实跑）：`core` tsc lib/vitest/node 全 0 错 + 新增 24 条测试绿（`search_view.test.ts` / `column_filter_ops.test.ts` / `search_view_builder.test.ts`）；`vui` typecheck 0 错 + 411 测试绿；`vui-syncfusion` typecheck 0 错 + 200 测试绿；`vui-agnaive` / `vui-primevue` / `rui` / `rui-syncfusion` typecheck 0 错；`rui` 33 测试绿；`pnpm --filter @mmda/app build` 成功。
`core` 的 `architecture_gate.test.ts` **any 门禁红**（317 > 272）—— 归因：`context_base.ts` 在本轮开始前已有 +43 个 `any`（并行会话在途改动，HEAD 272 = 门限 272），本工作新增 1（`UiSearchViewSlots<TNode = any>`，与同族插槽接口一致）。

## 12. 入口可达性：顶栏档位必须按视口定档（本次修的第二个洞）

搜索页做完了不等于点得到。放大镜**只画在 index 顶栏的 compact 档**（`packages/vui/src/ui/builder/topbar.ts` 的 compact 分支），而 `list_view.ts` 两处把 `layout: props.topbarLayout ?? "full"` 兜死了 → 窄视口永远 full 档 → 真机上根本没有放大镜这个入口（jsdom 全绿，看不出）。

落地：`resolvedIndexTopbarLayout(props, dense)`（`vui/src/ui/builder/topbar.ts:259`）—— **`layout` 显式给了就钉死（`full` 也算显式），没给才按视口定档**（`dense` = 顶栏宿主组件的 `useCompactViewport()`）；`list_view.ts:509` / `:1171` 改条件展开 `...(props.topbarLayout ? { layout: props.topbarLayout } : {})`。

真浏览器实测（视口 666×1046，探针 `.tmp_search_route_probe.*`）：顶栏 class = `mmda-index-topbar--compact --with-center --dense` → 放大镜在 → 点击 → `router.push('/DEMO/Products/Search')` → 覆盖态生效、列表 `aria-hidden="true"` 保活、覆盖层与工作区同框 `{x:272,y:12,w:378,h:1018}`、搜索页 6 行、行内无横向溢出、模糊搜框在。

**缺口（已知、未做）**：rui（React 运行时）没有视口钩子，`indexTopbarLayoutOf(props)` 仍是显式钉死 → React 端窄屏拿不到移动端入口（`packages/rui/src/ui/builder.ts:733`）。要给入口得先给 rui 一条视口信号。

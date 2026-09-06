import {
  MetaUi,
  MetaUiField,
  MetaUiGroup,
  MetaUiFieldLogic,
  MetaUiGroupLogic,
  MetaModel,
  defaultFieldSearchOptions,
  emptyPagedList,
  assignPagedList,
  isPagedList,
  applyEntityQuery,
  assignSearchParam,
  parseDefaultSort,
  defineEntity,
  defineValidation,
  validateFieldResult,
  isPromise,
  pluralize,
  type Entity,
  type EntityAction,
  type EntitySelectParam,
  type EntityFieldFilter,
  type EntitySearchParam,
  type FieldSearchOptions,
  type MetaUiFilter,
  type MetaUiFilterCondition,
  type Module,
  type ModuleAuth,
  type Pager,
  type SelectableFn,
  type SubGroupItemTransformParam,
  type Translatable,
  type TranslateFn,
  type UiBuilder,
  type UiContext,
  type UiSubGroupView,
  type UiFieldValidation,
  type UiValidation,
} from "@mmda/core";
import { reactive, ref, unref, shallowReactive, computed, toRaw, type Ref } from "vue";
import { rx } from "../rx";
import {
  UiViewMany,
  UiViewOne,
  createDefaultSearchParam,
  type UiViewOneType,
  type UiViewType,
} from "./view";
import type { MmdaVueApp } from "../app/app";
import type { UiLogic, UiSearchForm } from "../logic/logic";
import {
  UiCustomSearchField,
  UiFilter,
  quickFiltersToSQL,
  type UiSearchField,
} from "../ui/factory/filter";
import type { UiAction } from "../ui/factory/action";
import { canDoFromExecutableExpression } from "../ui/factory/action";
import type { UiColorRole } from "../app/material";
import { schedulePersistListPack } from "../ui/builder/list_layout";
import { attachContextValidate } from "./validate";
import { attachContextReference } from "./reference";
import { attachContextSubgroup } from "./subgroup";

type ContextCache = Map<string, UiViewContext<any>>;
type FieldLogicMap = Record<string, MetaUiFieldLogic<any>>;
type GroupLogicMap = Record<string, MetaUiGroupLogic<any, any>>;

export type CustomManyActionHandleFn = (
  context: UiViewContext<any>,
  selected: any[],
) => unknown;

export interface UiViewContextOptions<E extends object> {
  model: E;
  metaui: MetaUi;
  view?: UiViewType;
  locale?: string;
  translate?: TranslateFn;
  loader?: () => Promise<E>;
  fieldLogics?: FieldLogicMap;
  groupLogics?: GroupLogicMap;
  app?: MmdaVueApp;
  logic?: UiLogic<any>;
}

interface ChildContextOptions {
  parent: UiViewContext<any>;
  cache: ContextCache;
  cachePath: string;
  validation?: UiValidation;
}

const identityTranslate: TranslateFn = (message) =>
  typeof message === "string" ? message : message.message;

/**
 * Vue 表单交互会话。
 *
 * 一个实例只绑定一个实体（或一个子表集合）。主表、子表集合和每一条子表行
 * 都有各自的实例；字段搜索状态与校验状态不跨实例共享。
 */
export class UiViewContext<E extends object = Record<string, any>>
  implements UiContext<E>
{
  readonly model: E;
  metaui: MetaUi;
  readonly view: UiViewType;
  readonly locale: string;
  readonly loading: Ref<boolean>;
  readonly app?: MmdaVueApp;
  logic?: UiLogic<any>;
  filters: UiFilter[] = [];
  searchFields: UiSearchField[] = [];
  customSearchFields: UiCustomSearchField[] = [];
  customActions: EntityAction[] = [];
  actionLoadings: Record<string, boolean> = reactive({});
  executing = false;
  isEditDialog = false;
  showDialog = false;
  /** 与 Selector / beforeSearch 一致：pager、searchWord 等需可被视图追踪 */
  searchParam = rx(createDefaultSearchParam());
  /** 列布局变更后递增，驱动 Index Grid 重建 */
  listLayoutRev = ref(0);
  private readonly initializedState: Ref<boolean>;

  private readonly parent?: UiViewContext<any>;
  private readonly cache: ContextCache;
  private readonly cachePath: string;
  private readonly translateFn: TranslateFn;
  private readonly loader?: () => Promise<E>;
  private fieldLogics: FieldLogicMap;
  private groupLogics: GroupLogicMap;
  /** 编辑态子表 header 工具栏动作（add/clear/custom） */
  private _groupActions: Record<string, UiAction[]> = {};
  private readonly fieldOptions = reactive<Record<string, FieldSearchOptions>>(
    {},
  );
  private readonly referenceOptionLoads = new Map<string, Promise<any[]>>();
  private readonly validationState: UiValidation;
  private baseFilter = "";
  private readonly unsavedRows = new WeakMap<object, string>();
  private unsavedRowSequence = 0;
  private selection: any[] = [];
  private selectableKey = "default";
  private readonly selectableFns = new Map<string, SelectableFn<any>>();
  private customManyActionKey = "default";
  private readonly customManyActionFns = new Map<
    string,
    CustomManyActionHandleFn
  >();
  private selectionModeValue: "single" | "multiple" | null = null;

  constructor(options: UiViewContextOptions<E>, child?: ChildContextOptions) {
    this.view = options.view ?? UiViewOne.Details;
    const editing =
      this.view === UiViewOne.Edit ||
      this.view === UiViewOne.Create ||
      this.view === UiViewMany.EditMany;
    // index 等列表：list/pagination 需可追踪，否则 splice 改分页后视图不更新；
    // list 用 shallowReactive，避免行对象被深 Proxy（Syncfusion Grid 会空白）。
    if (!editing && isPagedList(options.model)) {
      const paged = options.model as { list: unknown[]; pagination: object };
      this.model = shallowReactive({
        list: shallowReactive([...paged.list]),
        pagination: reactive({ ...paged.pagination }),
      }) as E;
    } else {
      this.model = (
        editing ? reactive(options.model) : shallowReactive(options.model)
      ) as E;
    }
    this.metaui = options.metaui;
    this.locale = options.locale ?? options.metaui.locale ?? "zh";
    const app = options.app ?? child?.parent?.app;
    this.translateFn =
      options.translate ??
      child?.parent?.translateFn ??
      (app
        ? (message) => {
            const value =
              typeof message === "string" ? message : message.message;
            const param =
              typeof message === "string" ? undefined : message.param;
            return String(((app as any).i18n?.global.t as any)(value, param));
          }
        : identityTranslate);
    this.loader = options.loader;
    this.fieldLogics = options.fieldLogics ?? {};
    this.groupLogics = options.groupLogics ?? {};
    this.app = app;
    this.logic = options.logic ?? child?.parent?.logic;
    this.parent = child?.parent;
    this.cache = child?.cache ?? new Map<string, UiViewContext<any>>();
    this.cachePath = child?.cachePath ?? "@root";
    this.validationState = reactive(
      child?.validation ?? defineValidation(this.metaui, this.model as Entity),
    );
    this.loading = ref(false);
    this.initializedState = ref(!this.loader);
    this.cache.set(this.cachePath, this);
  }

  get title() {
    return this.getModelTitle();
  }

  get module(): Module | undefined {
    return this.logic?.module;
  }

  get selectionMode(): "single" | "multiple" | null {
    return this.selectionModeValue;
  }

  set selectionMode(mode: "single" | "multiple" | null) {
    this.selectionModeValue = mode;
  }

  getModuleAuth(
    entity: Record<string, any> = this.model as Record<string, any>,
  ): ModuleAuth | undefined {
    const authority = this.module?.authority;
    if (!authority) return undefined;
    return {
      ...authority,
      allowEdit: authority.allowEdit && entity.editable !== false,
      allowDelete: authority.allowDelete && entity.deletable !== false,
    };
  }

  get editing() {
    return this.view === UiViewOne.Edit || this.view === UiViewOne.Create;
  }

  /** 与旧版 UiContext.name 一致：根上下文为 `.` */
  get name(): string {
    return this.parent ? this.cachePath : ".";
  }

  get initialized() {
    return this.initializedState.value;
  }

  get $v() {
    return this.validationState;
  }

  get selectedItems() {
    return this.selection;
  }

  set selectedItems(items: any[]) {
    this.selection = items;
  }

  setSelectableFn(key: string, selectableFn: SelectableFn<any>) {
    this.selectableFns.set(key, selectableFn);
    this.selectableKey = key;
  }

  getSelectableFn() {
    return (
      this.selectableFns.get(this.selectableKey) ??
      this.logic?.selectableList?.[this.selectableKey]
    );
  }

  getSelectableKey() {
    return this.selectableKey;
  }

  setSelectableKey(key: string) {
    this.selectableKey = key;
  }

  setCustomManyActionHandleFn(key: string, handleFn: CustomManyActionHandleFn) {
    this.customManyActionFns.set(key, handleFn);
    this.customManyActionKey = key;
  }

  getCustomManyActionHandleFnKey() {
    return this.customManyActionKey;
  }

  runCustomManyAction(key = this.customManyActionKey) {
    return this.customManyActionFns.get(key)?.(this, this.selectedItems);
  }

  get prev(): UiViewContext<any> {
    return this.parent ?? this;
  }

  get root(): UiViewContext<any> {
    return this.parent?.root ?? this;
  }

  get isRoot() {
    return !this.parent;
  }

  get uiBuilder(): UiBuilder | undefined {
    return this.app?.ui;
  }

  /**
   * 与 `logic.apiClient` 同一实例。会话/UI 助手用；实体 CRUD 仍走 Logic 方法或 `this.apiClient`。
   */
  get apiClient() {
    return this.logic?.apiClient;
  }

  /**
   * 宿主注入袋（`$app` / `$ui` / `$t` / `$router` / `$toast`）。
   * 不在 core `UiContext` 上：Logic 回调不要依赖本袋。`$api` 只挂应用壳。
   */
  get globalProps() {
    return {
      $app: this.app,
      $ui: this.app?.ui,
      $t: (message: string, param?: Record<string, any>) =>
        this.translate(message, param),
      $router: this.logic?.router,
      $toast: {
        add: (props: Record<string, any>) => this.app?.ui.toast(this, props),
      },
    };
  }

  /**
   * 导航至 HAS_ONE 关联对象
   * @param relativeField 关联字段
   * @param item 主实体对象，若不传入则使用 model
   */
  routeToRelative(
    relativeField: MetaUiField | string,
    item?: any,
  ): string | null {
    const field =
      typeof relativeField === "string"
        ? this.metaui.getField(relativeField)
        : relativeField;
    if (!field?.reference) return null;

    const m = item ?? this.model;
    let relativeId = (m as Record<string, any>)[field.fieldName];
    if (
      (relativeId == null || relativeId === "") &&
      field.reference.hasOne &&
      field.reference.alias
    ) {
      const related = (m as Record<string, any>)[field.reference.alias];
      if (related) relativeId = field.reference.valueFn(related);
    }
    if (relativeId != null && typeof relativeId === "object") {
      relativeId = field.reference.valueFn(relativeId);
    }
    if (relativeId == null || relativeId === "") return null;

    const logic = this.logic;
    // Prefer Logic.serviceName / apiService; shell app.api only as fallback (not exposed on UiContext).
    const service =
      logic?.serviceName ??
      logic?.apiService ??
      this.app?.api?.config?.service;
    if (!service) return null;

    const refDbName = field.reference.refDbName;
    const baseUrl = this.app?.api?.http?.baseUrl;
    if (refDbName && refDbName !== service && baseUrl) {
      return (
        baseUrl.replace("api", "") +
        refDbName.toLocaleUpperCase() +
        "/" +
        field.reference.refRepository +
        "/" +
        relativeId
      );
    }

    const repository = field.reference.refRepository;
    if (!repository) return null;

    // Prefer the page's apiService (mes|base), never host app.name.
    const appService = service.toUpperCase();
    const idSegment = encodeURIComponent(String(relativeId));
    const path = `/${appService}/${repository}/${idSegment}`;
    const router = this.globalProps.$router;
    if (!router) return path;

    const byPath = router.resolve(path);
    if (byPath.matched.length > 0) return byPath.href;

    // 旧版按实体名注册命名路由（如 MaterialPackage）
    try {
      const byName = router.resolve({
        name: field.reference.refObjName,
        params: { id: String(relativeId) },
      });
      if (byName.matched.length > 0) return byName.href;
    } catch {
      // 新路由表无该命名路由时忽略
    }

    return path;
  }

  getModelTitle(model: Record<string, any> = this.model) {
    const key = this.metaui.labelField ?? this.metaui.primaryKey;
    const label = key ? model[key] : undefined;
    return label == null || label === ""
      ? this.metaui.displayLabel
      : `${this.metaui.displayLabel}【${String(label)}】`;
  }

  translate(message: string, param?: Record<string, any>) {
    const translated = this.translateFn({ message, param });
    return translated === message && !param
      ? this.translateFn(message)
      : translated;
  }

  t(message: string | Translatable | undefined, param?: Record<string, any>) {
    if (message == null || message === "") return "";
    if (typeof message === "string") return this.translate(message, param);
    return this.translateFn(message);
  }

  async load() {
    if (!this.loader) {
      this.initializedState.value = true;
      return;
    }
    this.loading.value = true;
    try {
      this.setModel(await this.loader());
      this.initializedState.value = true;
    } finally {
      this.loading.value = false;
    }
  }

  setModel(model: E) {
    const target = this.model as Record<string, any>;
    if (isPagedList(target) && isPagedList(model)) {
      assignPagedList(target as any, model as any);
      return;
    }
    for (const key of Object.keys(target)) {
      if (!(key in (model as object))) delete target[key];
    }
    Object.assign(target, model);
  }

  getFieldLogic(field: MetaUiField | string) {
    const name = typeof field === "string" ? field : field.fieldName;
    return this.fieldLogics[name] ?? this.root.fieldLogics[name];
  }

  getGroupLogic(group: MetaUiGroup | string) {
    const name = typeof group === "string" ? group : group.groupName;
    const parentGroup =
      (this.logic as { groupName?: string; repository?: string } | undefined)
        ?.groupName ?? this.logic?.repository;
    if (this.logic?.isChild && parentGroup) {
      const scoped = `${parentGroup}.${name}`;
      return (
        this.groupLogics[scoped] ??
        this.root.groupLogics[scoped] ??
        this.groupLogics[name]
      );
    }
    return this.groupLogics[name] ?? this.root.groupLogics[name];
  }

  bindLogics(
    fields: MetaUiFieldLogic<any>[] = [],
    groups: MetaUiGroupLogic<any, any>[] = [],
    customActions: EntityAction[] = [],
  ) {
    for (const field of fields) this.setupFieldLogic(field);
    for (const group of groups) this.setupGroupLogic(group);
    this.customActions = customActions;
  }

  setupFieldLogic(logic: MetaUiFieldLogic<any>) {
    this.fieldLogics[logic.field.fieldName] = logic;
  }

  setupGroupLogic(logic: MetaUiGroupLogic<any, any>) {
    this.groupLogics[logic.group.groupName] = logic;
    // 逻辑变更后重建该组动作缓存
    delete this._groupActions[logic.group.groupName];
  }

  /**
   * 子表卡片 header 工具栏动作（对齐老代码 Panel icons 槽）。
   * 仅在 edit/create 且组可编辑时返回 add/clear/customActions。
   */
  getGroupActions(grp: MetaUiGroup) {
    this.setupGroupActions(grp);
    return (this._groupActions[grp.groupName] ?? []).filter((a) => {
      if (a.view && a.view !== UiViewOne.Create && a.view !== UiViewOne.Edit) {
        return false;
      }
      const visible = a.visible;
      if (visible == null) return true;
      if (typeof visible === "function") return true;
      return Boolean(unref(visible));
    });
  }

  private setupGroupActions(grp: MetaUiGroup) {
    const name = grp.groupName;
    if (this._groupActions[name]) return;

    const actions: UiAction[] = [];
    this._groupActions[name] = actions;

    if (!this.editing) return;

    const grpLogic = this.getGroupLogic(grp);
    if (!grpLogic) return;

    const visibles = this.logic?.groupActionVisibles?.[name];
    const context = this;

    const liveCanDo = (action: EntityAction) => {
      return (model: unknown, ctx?: unknown) => {
        if (this.isGroupReadonly(grp)) return false;
        const pred = canDoFromExecutableExpression(this as any, action);
        return pred ? pred(model, ctx as any) !== false : true;
      };
    };

    const visibleOf = (actionName: string) =>
      visibles?.[actionName]
        ? computed(() => !!visibles[actionName]!(this.model, this))
        : undefined;

    for (const std of grpLogic.stdActions ?? []) {
      if (std.name === "clear") {
        actions.push({
          name: "clear",
          icon: std.icon ?? "clear",
          label: std.label ?? this.t("action.clear"),
          colorRole: "danger",
          onAction: () => this.removeSubGroupItems(grp),
          view: UiViewOne.Edit,
          canDo: liveCanDo(std),
          visible: visibleOf("clear"),
        });
      } else if (std.name === "add") {
        actions.push({
          name: "add",
          role: "secondary",
          icon: std.icon ?? "plus",
          label: std.label ?? this.t("action.add"),
          colorRole: "primary",
          onAction: () => this.runGroupAdd(grp, grpLogic),
          view: UiViewOne.Edit,
          canDo: liveCanDo(std),
          visible: visibleOf("add"),
        });
      }
    }

    if (grpLogic.customActions?.length) {
      for (const a of grpLogic.customActions) {
        const uiAction: UiAction = {
          name: a.name,
          icon: a.icon,
          label: a.label,
          colorRole: a.role as UiColorRole,
          onAction: () =>
            a.onAction!.apply(this.logic, [context, context.model]),
          tooltip: a.description,
          view: a.view ?? context.view,
          canDo: liveCanDo(a),
        };
        if (a.visible) {
          uiAction.visible = computed(() => !!a.visible!(context.model));
        }
        actions.push(uiAction);
      }
    }
  }

  private async runGroupAdd(
    grp: MetaUiGroup,
    grpLogic: MetaUiGroupLogic<any, any>,
  ) {
    if (typeof grpLogic.defaultAddFn === "function") {
      return grpLogic.defaultAddFn.apply(this.logic, [this, this.model]);
    }
    const items = (this.model as Record<string, any>)[grp.groupName] ?? [];
    if (typeof grpLogic.beforeAddFn === "function") {
      const ok = await grpLogic.beforeAddFn(this, this.model, items);
      if (ok === false) return;
    }
    const created = await this.createSubGroupItems({
      group: grp,
      target: this.model as Entity,
    });
    const list = Array.isArray(created) ? created : [created];
    for (const item of list) this.addSubGroupItem(grp, item);
  }

  getFieldValue(field: MetaUiField | string, model: E = this.model) {
    const fld = this.resolveField(field);
    return MetaModel.getFieldValue(model, fld);
  }

  beginEdit(item: object, cacheKey?: string) {
    return this.with(item, cacheKey);
  }

  endEdit(item: object, cacheKey?: string) {
    this.release(item, cacheKey);
  }

  setFieldValue(field: MetaUiField | string, value: any) {
    const fld = this.resolveField(field);
    const model = this.model as Record<string, any>;
    const oldValue = MetaModel.getFieldValue(model, fld);
    const normalized = typeof value === "string" ? value.trim() : value;
    const validationValue =
      normalized && typeof normalized === "object" && fld.reference
        ? fld.reference.valueOf(normalized)
        : normalized;
    this.validateSingleField(fld, validationValue, model, this.validationState);
    const modified = MetaModel.setFieldValue(model, fld, normalized);
    if (!modified) return;
    const options = this.getFieldOptions(fld);
    if (fld.reference && normalized && typeof normalized === "object") {
      options.currentSelectOption = normalized;
      if (!options.selectOptions.includes(normalized)) {
        options.selectOptions.push(normalized);
      }
    }
    this.getFieldLogic(fld)?.onChangeFn?.(
      this,
      this.model,
      value,
      oldValue,
    );
  }

  displayField(field: MetaUiField | string, model: E = this.model) {
    const fld = this.resolveField(field);
    return MetaModel.displayField(model, fld);
  }

  getFieldOptions(field: MetaUiField | string) {
    const fld = this.resolveField(field);
    return (this.fieldOptions[fld.fieldName] ??= defaultFieldSearchOptions(
      this.getFieldValue(fld),
    ));
  }

  getFieldCurrentOption(field: MetaUiField | string) {
    return this.getFieldOptions(field).currentSelectOption;
  }

  setFieldQueryParams(
    field: MetaUiField | string,
    queryParams: Record<string, any>,
  ) {
    this.getFieldOptions(field).searchParam.queryParams = queryParams;
  }

  setFieldPager(field: MetaUiField | string, pager: Pager) {
    this.getFieldOptions(field).searchParam.pager = pager;
  }

  batchSetFieldValue(values: Record<string, any>) {
    for (const [field, value] of Object.entries(values)) {
      this.setFieldValue(field, value);
    }
  }

  clearFieldValue(field: MetaUiField | string) {
    const fld = this.resolveField(field);
    const options = this.getFieldOptions(fld);
    options.searchParam.searchWord = "";
    options.currentSelectOption = undefined;
    this.setFieldValue(fld, null);
    const ref = fld.reference;
    if (ref) {
      const model = this.model as Record<string, any>;
      MetaModel.setRefProp(model, fld.fieldName, null);
      ref.refFlds.forEach((rf, index) => {
        if (index > 0) MetaModel.delCustomProp(model, rf);
      });
      if (ref.hasOne && ref.alias) model[ref.alias] = null;
    }
  }

  clearFilters() {
    this.searchParam.searchWord = "";
    this.searchParam.filterModel = undefined;
    for (const filter of this.filters) filter.selectedConditions.value = [];
    for (const searchField of this.searchFields) {
      searchField.searchWord = null;
      searchField.searchVal.value = null;
    }
    for (const customField of this.customSearchFields) {
      customField.searchWord = null;
      customField.searchVal.value = null;
      delete this.getQueryParam()[customField.searchParam];
    }
    this.syncQuickFilters();
    this.listLayoutRev.value += 1;
    schedulePersistListPack(this);
  }

  resetFilters(): boolean | Promise<boolean> {
    this.clearFilters();
    return true;
  }

  getQueryParam() {
    return (this.searchParam.queryParams ??= {});
  }

  addQueryParam(name: string, value: any) {
    this.getQueryParam()[name] = value;
    if (name === "filter") this.baseFilter = String(value ?? "");
  }

  configureSearch(filters: MetaUiFilter[] = [], form?: UiSearchForm) {
    this.filters = filters.map((filter) => {
      const uiFilter = new UiFilter(filter);
      uiFilter.selectedConditions.value = filter.filterConditions.filter(
        (condition) =>
          condition.active === true ||
          (condition.active == null && condition.fallback),
      );
      return uiFilter;
    });
    if (form?.searchParam)
      assignSearchParam(this.searchParam, form.searchParam);
    const lastQuery = (this.logic as UiLogic<any> | undefined)?.meta?.lastQuery;
    if (lastQuery) applyEntityQuery(this.searchParam, lastQuery);
    else {
      const defaultSort = this.logic?.module?.defaultSort;
      if (defaultSort && !this.searchParam.pager.sorts?.length) {
        this.searchParam.pager.sorts = parseDefaultSort(defaultSort);
      }
    }
    if (form?.queryParams) {
      Object.assign(this.getQueryParam(), form.queryParams);
      if (form.queryParams.filter) {
        this.baseFilter = String(form.queryParams.filter);
      }
    }
    this.searchFields = form?.searchFields ?? [];
    this.customSearchFields = form?.customSearchFields ?? [];
    if (!this.baseFilter && this.searchParam.queryParams?.filter) {
      this.baseFilter = String(this.searchParam.queryParams.filter);
    }
    this.syncSearchState();
  }

  setFieldFilter(field: MetaUiField | string, filter?: EntityFieldFilter) {
    const name = this.resolveField(field).fieldName;
    const model = (this.searchParam.filterModel ??= {});
    if (filter) model[name] = filter;
    else delete model[name];
    if (Object.keys(model).length === 0)
      this.searchParam.filterModel = undefined;
  }

  toggleQuickFilter(
    filter: UiFilter,
    condition: MetaUiFilterCondition,
    single = false,
  ) {
    filter.toggle(condition, single);
    this.syncQuickFilters();
    schedulePersistListPack(this);
  }

  syncQuickFilters() {
    const quick = quickFiltersToSQL(this.filters);
    const query = this.getQueryParam();
    const combined =
      this.baseFilter && quick
        ? `(${this.baseFilter}) AND (${quick})`
        : this.baseFilter || quick;
    if (combined) query.filter = combined;
    else delete query.filter;
  }

  syncSearchState() {
    for (const field of this.searchFields) {
      this.setFieldFilter(field.field, field.toFilterModel());
    }
    for (const field of this.customSearchFields) {
      if (field.hasVal)
        this.getQueryParam()[field.searchParam] = field.searchValue;
      else delete this.getQueryParam()[field.searchParam];
    }
    this.syncQuickFilters();
  }

  applySearchParam(param: EntitySearchParam) {
    assignSearchParam(this.searchParam, param);
    this.baseFilter = String(this.searchParam.queryParams?.filter ?? "");
    for (const filter of this.filters) filter.selectedConditions.value = [];
    this.syncSearchState();
  }

  isFieldReadonly(field: MetaUiField | string): boolean {
    const fld = this.resolveField(field);
    return (
      !!fld.readOnly ||
      !!this.getFieldLogic(fld)?.readonlyFn?.(this.model, this)
    );
  }

  isFieldHidden(field: MetaUiField | string): boolean {
    const fld = this.resolveField(field);
    return (
      !!fld.hidden || !!this.getFieldLogic(fld)?.hiddenFn?.(this.model, this)
    );
  }

  isFieldRequired(field: MetaUiField | string): boolean {
    const fld = this.resolveField(field);
    return (
      !fld.nullable ||
      !!this.getFieldLogic(fld)?.requiredFn?.(this.model, this)
    );
  }

  isGroupReadonly(group: MetaUiGroup | string): boolean {
    const grp = this.resolveGroup(group);
    return (
      !!grp.readOnly ||
      !!this.getGroupLogic(grp)?.readonlyFn?.(this.model, this)
    );
  }

  isGroupHidden(group: MetaUiGroup | string) {
    const grp = this.resolveGroup(group);
    if (this.getGroupLogic(grp)?.hiddenFn?.(this.model, this)) return true;
    // 子表 canHave：按主表对应布尔字段控制整组可见（如 featuredSku）
    if (grp.canHave) {
      const master = ((this.root ?? this).model ?? {}) as Record<string, any>;
      return !master[grp.canHave];
    }
    return false;
  }

  isSubGroupItemDeletable(group: MetaUiGroup | string, item: Entity): boolean {
    if (item.deletable === false) return false;
    const grp = this.resolveGroup(group);
    const fn = this.getGroupLogic(grp)?.itemDeletableFunc;
    if (!fn) return true;
    const master = ((this.root ?? this).model ?? {}) as Record<string, any>;
    return fn(item, master, this) !== false;
  }


  with<G extends object>(model: G, cacheKey = "id") {
    const rowKey = this.rowCacheKey(model, cacheKey, this.metaui.primaryKey);
    const path = `${this.cachePath}/@row/${rowKey}`;
    const cached = this.cache.get(path);
    if (cached) {
      // 同一业务键若拿到不同对象（如 Grid Batch 副本），丢弃旧缓存，避免写到副本上
      if (toRaw(cached.model as object) !== toRaw(model as object)) {
        this.cache.delete(path);
      } else {
        return cached as UiViewContext<G>;
      }
    }
    return this.createChild(
      model,
      this.metaui,
      path,
      this.view,
    ) as UiViewContext<G>;
  }

  /** 释放按需创建的行上下文（用于表格编辑结束或虚拟行卸载）。 */
  release(model: object, cacheKey = "id") {
    const rowKey = this.rowCacheKey(model, cacheKey, this.metaui.primaryKey);
    this.cache.delete(`${this.cachePath}/@row/${rowKey}`);
  }

  treeWith<G extends object>(model: G, cacheKey = "id") {
    return this.with(model, cacheKey);
  }

  getCache(cacheKey = "@root") {
    return this.cache.get(
      cacheKey.startsWith("@") ? cacheKey : `${this.cachePath}/${cacheKey}`,
    );
  }

  /** 诊断上下文树规模；索引页渲染不应增加此计数。 */
  get contextCount() {
    return this.cache.size;
  }

  getCacheByID(id: string) {
    for (const context of this.cache.values()) {
      const model = context.model as Record<string, any>;
      const key = context.metaui.primaryKey ?? "id";
      if (String(model[key] ?? model.id) === String(id)) return context;
    }
    return undefined;
  }


  private listRepository() {
    const fromApi = (this.app as { api?: { config?: { repository?: string } } } | undefined)
      ?.api?.config?.repository;
    if (fromApi) return fromApi;
    const fromLogic = (this.logic as { repository?: string } | undefined)?.repository;
    if (fromLogic) return fromLogic;
    return pluralize(this.metaui.objName);
  }


  private createChild<G extends object>(
    model: G,
    metaui: MetaUi,
    cachePath: string,
    view: UiViewType,
    fieldLogics = this.fieldLogics,
    logic = this.logic,
  ) {
    return new UiViewContext(
      {
        model,
        metaui,
        view,
        locale: this.locale,
        translate: this.translateFn,
        fieldLogics,
        groupLogics: this.root.groupLogics,
        app: this.app,
        logic,
      },
      {
        parent: this,
        cache: this.cache,
        cachePath,
      },
    );
  }

  private resolveSubGroupTransform<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ) {
    return {
      metaUiGroup: this.resolveGroup(param.group),
      source: param.source,
      target: param.target ?? this.model,
      creator: param.creator ?? ((o: object) => o as G),
      propsMapper: param.propsMapper,
      ignoreMapper: param.ignoreMapper,
      sequenceKey: param.sequenceKey,
    };
  }

  private resolveField(field: MetaUiField | string) {
    if (typeof field !== "string") return field;
    const resolved = this.metaui.getField(field);
    if (!resolved) throw new Error(`Field "${field}" not found.`);
    return resolved;
  }

  private validateSingleField(
    field: MetaUiField,
    value: any,
    model: Record<string, any>,
    validation: UiValidation,
  ) {
    if (this.isFieldHidden(field) || this.isFieldReadonly(field)) return 0;
    const result = validateFieldResult(
      field,
      value,
      model,
      this,
    );
    const state = (validation[field.fieldName] ??= {
      touched: false,
      message: "",
      warning: "",
    }) as UiFieldValidation;
    state.touched = true;
    state.message = result.errors.join("；");
    state.warning = result.warnings.join("；");
    return result.errors.length ? 1 : 0;
  }

  private countValidationErrors(value: unknown): number {
    if (!value || typeof value !== "object") return 0;
    if ("touched" in value && "message" in value) {
      return (value as UiFieldValidation).message ? 1 : 0;
    }
    return Object.entries(value).reduce(
      (count, [key, child]) =>
        key === "summary" ? count : count + this.countValidationErrors(child),
      0,
    );
  }

  private resolveGroup(group: MetaUiGroup | string) {
    if (typeof group !== "string") return group;
    const resolved = this.metaui.getGroup(group);
    if (!resolved) throw new Error(`Group "${group}" not found.`);
    return resolved;
  }

  private rowCacheKey(model: object, cacheKey: string, fallbackKey?: string) {
    const record = model as Record<string, any>;
    const value =
      record[cacheKey] ?? (fallbackKey ? record[fallbackKey] : undefined);
    if (value != null && value !== "") return String(value);
    let generated = this.root.unsavedRows.get(model);
    if (!generated) {
      generated = `new-${++this.root.unsavedRowSequence}`;
      this.root.unsavedRows.set(model, generated);
    }
    return generated;
  }

  declare validate: () => Promise<boolean>;
  declare validateField: (
    field: MetaUiField | string,
    value?: any,
  ) => number;
  declare validateGroup: (group: MetaUiGroup | string) => Promise<number>;
  declare resetValidation: () => void;
  declare hasFieldError: (field: MetaUiField | string) => boolean;
  declare isInvalid: (field: MetaUiField | string) => boolean;
  declare getInvalidMessage: (field: MetaUiField | string) => string;
  declare getFieldError: (field: MetaUiField | string) => string;
  declare setFieldError: (field: MetaUiField | string, error: string) => void;
  declare hasGroupError: (group: MetaUiGroup | string) => boolean;
  declare getSelectedGroupItems: (group: MetaUiGroup | string) => any[];
  declare subGroupContext: (group: MetaUiGroup | string) => UiViewContext<any>;
  declare subGroupItemContext: <G extends Entity>(
    group: MetaUiGroup | string,
    item: G,
    groupMode?: UiSubGroupView,
    cacheKey?: string,
  ) => UiViewContext<G>;
  declare searchRelative: (
    field: MetaUiField,
    searchWord?: string,
    model?: E,
  ) => Promise<FieldSearchOptions>;
  declare loadReferenceOptions: (field: MetaUiField) => Promise<any[]>;
  declare select: {
    (field: MetaUiField | string): Promise<any>
    <T>(param: EntitySelectParam<T>): Promise<boolean | T[]>
  };
  declare addSubGroupItem: <G extends Entity>(
    group: MetaUiGroup | string,
    item: G,
  ) => void;
  declare addSubGroupItems: <G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ) => void;
  declare createSubGroupItems: <G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ) => Promise<G | G[]>;
  declare removeSubGroupItem: <G extends Entity>(
    group: MetaUiGroup | string,
    item: G,
  ) => void | Promise<void>;
  declare removeSubGroupItems: <G extends Entity>(
    group: MetaUiGroup | string,
  ) => void;
  declare subGroupItem: <G>(
    group: MetaUiGroup | string,
    item: G,
    props?: { groupMode?: UiSubGroupView },
  ) => Promise<false | G>;
  declare newSubGroupItem: <G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ) => Promise<false | G>;
}

attachContextValidate(UiViewContext);
attachContextReference(UiViewContext);
attachContextSubgroup(UiViewContext);

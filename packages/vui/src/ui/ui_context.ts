import {
  MetaUi,
  MetaUiField,
  MetaUiGroup,
  MetaUiFieldLogic,
  MetaUiGroupLogic,
  MetaModel,
  defaultFieldSearchOptions,
  defaultSearchParam,
  emptyPagedList,
  assignSearchParam,
  defineEntity,
  defineValidation,
  validateField,
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
  type UiSubGroupMode,
  type UiFieldValidation,
  type UiValidation,
} from "@mmda/core";
import { reactive, ref, shallowReactive, type Ref } from "vue";
import {
  UiViewMany,
  UiViewOne,
  type UiViewOneType,
  type UiViewType,
} from "./ui_view";
import type { MmdaApplication } from "./ui_app";
import type { UiLogic, UiSearchForm } from "./ui_logic";
import {
  UiCustomSearchField,
  UiFilter,
  quickFiltersToSQL,
  type UiSearchField,
} from "./ui_filter";
import type { UiBuilder } from "./ui_builder";

type UiContext = UiViewContext<any>;
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
  app?: MmdaApplication;
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
export class UiViewContext<
  E extends object = Record<string, any>,
> {
  readonly model: E;
  readonly metaui: MetaUi;
  readonly view: UiViewType;
  readonly locale: string;
  readonly loading: Ref<boolean>;
  readonly app?: MmdaApplication;
  logic?: UiLogic<any>;
  filters: UiFilter[] = [];
  searchFields: UiSearchField[] = [];
  customSearchFields: UiCustomSearchField[] = [];
  customActions: EntityAction[] = [];
  actionLoadings: Record<string, boolean> = reactive({});
  executing = false;
  isEditDialog = false;
  showDialog = false;
  searchParam = defaultSearchParam();
  private readonly initializedState: Ref<boolean>;

  private readonly parent?: UiViewContext<any>;
  private readonly cache: ContextCache;
  private readonly cachePath: string;
  private readonly translateFn: TranslateFn;
  private readonly loader?: () => Promise<E>;
  private fieldLogics: FieldLogicMap;
  private groupLogics: GroupLogicMap;
  private readonly fieldOptions = reactive<Record<string, FieldSearchOptions>>(
    {},
  );
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
    this.model = (
      editing ? reactive(options.model) : shallowReactive(options.model)
    ) as E;
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
            return String((app.i18n.global.t as any)(value, param));
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

  get globalProps() {
    const context = this as unknown as UiContext;
    return {
      $app: this.app,
      $api: this.app?.api,
      $ui: this.app?.ui,
      $t: (message: string, param?: Record<string, any>) =>
        this.translate(message, param),
      $router: this.logic?.router,
      $toast: {
        add: (props: Record<string, any>) => this.app?.ui.toast(context, props),
      },
    };
  }

  get apiClient() {
    return this.app?.api;
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

    const api = this.apiClient;
    if (!api) return null;

    const refDbName = field.reference.refDbName;
    const { service } = api.config;
    const { baseUrl } = api.http;
    if (refDbName && refDbName !== service) {
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

    const appService = (this.app?.name ?? service).toUpperCase();
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

  t(message: string | Translatable | undefined) {
    return message == null || message === "" ? "" : this.translateFn(message);
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
    for (const key of Object.keys(target)) {
      if (!(key in model)) delete target[key];
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
      this as unknown as UiContext,
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
    const options = this.getFieldOptions(field);
    options.searchParam.searchWord = "";
    options.currentSelectOption = undefined;
    this.setFieldValue(field, null);
  }

  resetFilters(): boolean | Promise<boolean> {
    this.searchParam.searchWord = "";
    this.searchParam.searchParams = undefined;
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
        (condition) => condition.fallback,
      );
      return uiFilter;
    });
    if (form?.searchParam)
      assignSearchParam(this.searchParam, form.searchParam);
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
    const model = (this.searchParam.searchParams ??= {});
    if (filter) model[name] = filter;
    else delete model[name];
    if (Object.keys(model).length === 0)
      this.searchParam.searchParams = undefined;
  }

  toggleQuickFilter(
    filter: UiFilter,
    condition: MetaUiFilterCondition,
    single = false,
  ) {
    filter.toggle(condition, single);
    this.syncQuickFilters();
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

  isFieldReadonly(field: MetaUiField | string) {
    const fld = this.resolveField(field);
    return (
      this.getFieldLogic(fld)?.readonlyFn?.(this.model, this) ?? !!fld.readOnly
    );
  }

  isFieldHidden(field: MetaUiField | string) {
    const fld = this.resolveField(field);
    return (
      this.getFieldLogic(fld)?.hiddenFn?.(this.model, this) ?? !!fld.hidden
    );
  }

  isFieldRequired(field: MetaUiField | string) {
    const fld = this.resolveField(field);
    return (
      this.getFieldLogic(fld)?.requiredFn?.(this.model, this) ?? !fld.nullable
    );
  }

  isGroupReadonly(group: MetaUiGroup | string) {
    const grp = this.resolveGroup(group);
    return (
      this.getGroupLogic(grp)?.readonlyFn?.(this.model, this) ?? !!grp.readOnly
    );
  }

  isGroupHidden(group: MetaUiGroup | string) {
    const grp = this.resolveGroup(group);
    return this.getGroupLogic(grp)?.hiddenFn?.(this.model, this) ?? false;
  }

  isGroupEditable(group: MetaUiGroup | string) {
    const grp = this.resolveGroup(group);
    return (
      this.getGroupLogic(grp)?.editIfFn?.(this.model, this) ??
      !this.isGroupReadonly(grp)
    );
  }

  async validate() {
    let valid = true;
    for (const group of this.metaui.groups) {
      if ((await this.validateGroup(group)) > 0) valid = false;
    }
    const summary = (this.validationState.summary ??= { errorNum: 0 });
    summary.errorNum = valid
      ? 0
      : this.countValidationErrors(this.validationState);
    return valid;
  }

  validateField(
    field: MetaUiField | string,
    value = this.getFieldValue(field),
  ) {
    const fld = this.resolveField(field);
    return this.validateSingleField(
      fld,
      value,
      this.model as Record<string, any>,
      this.validationState,
    );
  }

  async validateGroup(group: MetaUiGroup | string) {
    const grp = this.resolveGroup(group);
    if (this.isGroupHidden(grp)) return 0;
    if (!grp.many) {
      return grp.fields.reduce(
        (count, field) =>
          count +
          this.validateSingleField(
            field,
            this.getFieldValue(field),
            this.model as Record<string, any>,
            this.validationState,
          ),
        0,
      );
    }

    const rows =
      ((this.model as Record<string, any>)[grp.groupName] as Record<
        string,
        any
      >[]) ?? [];
    const groupState = (this.validationState[grp.groupName] ??=
      {}) as UiValidation;
    let errorCount = grp.requiredAny && rows.length === 0 ? 1 : 0;
    rows.forEach((row, index) => {
      const rowKey = String(row.rowNum ?? row.id ?? index);
      const rowState = (groupState[rowKey] ??= {
        rowNum: rowKey,
        summary: { errorNum: 0 },
      }) as UiValidation;
      const rowContext = this.subGroupItemContext(grp, row as Entity);
      let rowErrors = 0;
      for (const field of grp.groupUi?.groups.flatMap((g) => g.fields) ?? []) {
        rowErrors += rowContext.validateSingleField(
          field,
          rowContext.getFieldValue(field),
          row,
          rowState,
        );
      }
      const summary = (rowState.summary ??= { errorNum: 0 });
      summary.errorNum = rowErrors;
      errorCount += rowErrors;
    });
    return errorCount;
  }

  resetValidation() {
    for (const state of Object.values(this.validationState)) {
      if (state && typeof state === "object" && "touched" in state) {
        state.touched = false;
        state.message = "";
      }
    }
  }

  hasFieldError(field: MetaUiField | string) {
    return this.getInvalidMessage(field) !== "";
  }

  isInvalid(field: MetaUiField | string) {
    const state = this.validationState[this.resolveField(field).fieldName];
    return !!(
      state &&
      typeof state === "object" &&
      "touched" in state &&
      state.touched &&
      state.message
    );
  }

  getInvalidMessage(field: MetaUiField | string) {
    const state = this.validationState[this.resolveField(field).fieldName];
    return state &&
      typeof state === "object" &&
      "message" in state &&
      typeof state.message === "string"
      ? state.message
      : "";
  }

  getFieldError(field: MetaUiField | string) {
    return this.getInvalidMessage(field);
  }

  setFieldError(field: MetaUiField | string, error: string) {
    const name = this.resolveField(field).fieldName;
    const state = (this.validationState[name] ??= {
      touched: true,
      message: "",
    }) as UiFieldValidation;
    state.touched = true;
    state.message = error;
  }

  getSelectedGroupItems(group: MetaUiGroup | string) {
    return this.subGroupContext(group).selectedItems;
  }

  hasGroupError(group: MetaUiGroup | string) {
    const state = this.validationState[this.resolveGroup(group).groupName];
    return this.countValidationErrors(state) > 0;
  }

  subGroupContext(group: MetaUiGroup | string) {
    const grp = this.resolveGroup(group);
    if (!grp.groupUi)
      throw new Error(`Group "${grp.groupName}" has no groupUi.`);
    const path = `${this.cachePath}/${grp.groupName}`;
    const cached = this.cache.get(path);
    if (cached) return cached;
    const rows =
      ((this.model as Record<string, any>)[grp.groupName] as
        object[] | undefined) ?? [];
    return this.createChild(rows, grp.groupUi, path, this.view);
  }

  subGroupItemContext<G extends Entity>(
    group: MetaUiGroup | string,
    item: G,
    groupMode: UiSubGroupMode = this.editing ? "edit" : "details",
    cacheKey = "id",
  ) {
    const grp = this.resolveGroup(group);
    if (!grp.groupUi)
      throw new Error(`Group "${grp.groupName}" has no groupUi.`);
    const rowKey = this.rowCacheKey(item, cacheKey, grp.groupUi.primaryKey);
    const path = `${this.cachePath}/${grp.groupName}/${rowKey}`;
    const cached = this.cache.get(path);
    if (cached) return cached as UiViewContext<G>;
    const fieldLogics: FieldLogicMap = {};
    const groupLogic = this.getGroupLogic(grp);
    for (const fieldLogic of groupLogic?.fields ?? []) {
      fieldLogics[fieldLogic.field.fieldName] = fieldLogic;
    }
    return this.createChild(
      item,
      grp.groupUi,
      path,
      groupMode as UiViewOneType,
      fieldLogics,
      this.logic?.createRelativeLogic?.(grp.groupName, this.model as Entity) ??
        this.logic,
    ) as UiViewContext<G>;
  }

  with<G extends object>(model: G, cacheKey = "id") {
    const rowKey = this.rowCacheKey(model, cacheKey, this.metaui.primaryKey);
    const path = `${this.cachePath}/@row/${rowKey}`;
    const cached = this.cache.get(path);
    if (cached) return cached as UiViewContext<G>;
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

  async searchRelative(
    field: MetaUiField,
    searchWord = "",
    model = this.model,
  ) {
    const options = this.getFieldOptions(field);
    options.searching = true;
    options.searchParam.searchWord = searchWord;
    try {
      if (field.reference?.isEnum) {
        options.selectOptions = field.reference.refOptions ?? [];
        return options;
      }
      const ref = field.reference;
      if (!ref || !this.app) return options;
      const filter = ref.buildSearchFilter(model, {
        searchWord,
        ctx: this as any,
        filterFn: this.getFieldLogic(field)?.filterFn ?? ref.filterFn,
      });
      const extra = this.getFieldLogic(field)?.setSearchParamFn?.(
        this as unknown as UiContext,
        model,
        field,
      );
      options.searchParam.queryParams = {
        ...(options.searchParam.queryParams ?? {}),
        ...(extra ?? {}),
        ...(filter ? { filter } : {}),
      };
      if (ref.refRepository) {
        const picked = await this.select({
          repository: ref.refRepository,
          service: ref.service,
          searchParam: options.searchParam,
          selectionMode: "single",
        });
        if (Array.isArray(picked) && picked[0]) {
          options.selectOptions = picked;
          const item = picked[0] as Record<string, any>;
          const valueKey = ref.refFlds?.[0];
          if (valueKey) {
            (model as Record<string, any>)[field.fieldName] =
              item[valueKey] ?? item.id;
          }
        }
        return options;
      }
      const page = await this.app.api.searchEntities(options.searchParam, {
        repository: ref.refRepository,
        service: ref.service,
      });
      options.selectOptions = page.list;
      options.pagination = page.pagination;
      return options;
    } finally {
      options.searching = false;
    }
  }

  addSubGroupItem<G extends Entity>(group: MetaUiGroup | string, item: G) {
    const grp = this.resolveGroup(group);
    const items = ((this.model as Record<string, any>)[grp.groupName] ??= []);
    items.push(item);
    MetaModel.modify(this.model as Entity);
    this.getGroupLogic(grp)?.onChangeFn?.(
      this as unknown as UiContext,
      this.model,
      items,
    );
  }

  addSubGroupItems<G extends Entity>(param: SubGroupItemTransformParam<G>) {
    MetaModel.addSubGroupItems(this.resolveSubGroupTransform(param));
    MetaModel.modify(this.model as Entity);
    const group = this.resolveGroup(param.group);
    this.getGroupLogic(group)?.onChangeFn?.(
      this as unknown as UiContext,
      this.model,
      (this.model as Record<string, any>)[group.groupName],
    );
  }

  createSubGroupItems<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ): Promise<G | G[]> {
    return Promise.resolve(
      MetaModel.createSubGroupItems(this.resolveSubGroupTransform(param)),
    );
  }

  removeSubGroupItem<G extends Entity>(group: MetaUiGroup | string, item: G) {
    const grp = this.resolveGroup(group);
    const items = (this.model as Record<string, any>)[grp.groupName] ?? [];
    MetaModel.deleteItem(items, item);
    this.getGroupLogic(grp)?.onChangeFn?.(
      this as unknown as UiContext,
      this.model,
      items,
    );
  }

  removeSubGroupItems<G extends Entity>(group: MetaUiGroup | string) {
    const grp = this.resolveGroup(group);
    const items = (this.model as Record<string, any>)[grp.groupName] ?? [];
    MetaModel.clearItems(items);
    this.getGroupLogic(grp)?.onChangeFn?.(
      this as unknown as UiContext,
      this.model,
      items,
    );
  }

  async select<T>(param: EntitySelectParam<T>): Promise<boolean | T[]> {
    if (!this.app) return false;
    const pack = await this.app.meta.getPack({
      repository: param.repository,
      service: param.service,
    });
    const ctor =
      param.ctor ??
      ((source: object) =>
        MetaModel.createEntity(pack.metaui, defineEntity, source) as T);
    const { GenericUiLogic } = await import("./ui_logic");
    const { UiBuildContext } = await import("./ui_build_context");
    const logic = new GenericUiLogic(ctor as any, {
      service: this.app.meta,
      repository: param.repository,
      meta: pack,
      router: this.logic?.router,
      transService: param.service,
    });
    const selectionMode = param.selectionMode ?? "multiple";
    const selectCtx = new UiBuildContext({
      model: emptyPagedList<T>() as any,
      metaui: pack.metaui,
      view:
        selectionMode === "single"
          ? UiViewMany.SelectOne
          : UiViewMany.SelectMany,
      locale: this.locale,
      translate: this.translateFn,
      app: this.app,
      logic,
    });
    if (param.searchParam) {
      assignSearchParam(selectCtx.searchParam, param.searchParam);
    }
    if (param.selectableFn) {
      selectCtx.setSelectableFn("select", param.selectableFn);
    }
    selectCtx.selectedItems = [];
    await selectCtx.init();
    const accepted = await this.app.confirmDialog(
      this.app.ui.buildListView(selectCtx, { selectionMode }),
      selectCtx as unknown as UiContext,
      { name: "select" },
    );
    return accepted ? (selectCtx.selectedItems as T[]) : false;
  }

  async subGroupItem<G>(
    group: MetaUiGroup | string,
    item: G,
    props: { groupMode?: UiSubGroupMode } = {},
  ): Promise<false | G> {
    const ctx = this.subGroupItemContext(
      group,
      item as Entity,
      props.groupMode,
    );
    if (!this.app) return item;
    this.root.showDialog = ctx.isEditDialog = true;
    try {
      const accepted = await this.app.confirmDialog(
        this.app.ui.buildView(ctx as unknown as UiContext),
        ctx as unknown as UiContext,
        { name: this.resolveGroup(group).groupName },
      );
      return accepted ? (ctx.model as G) : false;
    } finally {
      this.root.showDialog = ctx.isEditDialog = false;
    }
  }

  async newSubGroupItem<G extends Entity>(
    param: SubGroupItemTransformParam<G>,
  ) {
    const created = (await this.createSubGroupItems(param)) as G;
    return this.subGroupItem(param.group, created, { groupMode: "create" });
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
    const message = validateField(
      field,
      value,
      model,
      this as unknown as UiContext,
    );
    const state = (validation[field.fieldName] ??= {
      touched: false,
      message: "",
    }) as UiFieldValidation;
    state.touched = true;
    state.message = message;
    return message ? 1 : 0;
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
}

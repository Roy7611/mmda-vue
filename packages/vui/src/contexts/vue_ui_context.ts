import {
  MetaUi,
  MetaUiField,
  MetaUiGroup,
  MetaUiFieldLogic,
  MetaUiGroupLogic,
  MetaModel,
  defaultFieldSearchOptions,
  assignPagedList,
  isPagedList,
  defineValidation,
  validateFieldResult,
  pluralize,
  type Entity,
  type EntityAction,
  type FieldSearchOptions,
  type Module,
  type ModuleAuth,
  type Pager,
  type SelectableFn,
  type SubGroupItemTransformParam,
  type Translatable,
  type TranslateFn,
  type UiBuilder,
  type UiContext,
  type UiFieldValidation,
  type UiValidation,
} from "@mmda/core";
import { reactive, ref, shallowReactive, toRaw, type Ref } from "vue";
import {
  UiViewMany,
  UiViewOne,
  type UiViewType,
} from "./view";
import type { MmdaVueApp } from "../app/app";
import type { EntityLogic } from "@mmda/core";
import type { UiAction } from "../ui/factory/action";
import type { Router } from "vue-router";
import { WithSubgroup } from "./mixins/subgroup";
import { WithValidate } from "./mixins/validate";
import { WithReference } from "./mixins/reference";
import { WithData } from "./mixins/data";
import { WithNavigate } from "./mixins/navigate";
import { createSession, setSessionFactory } from "./mixins/session";
import type { ChildContextOptions } from "./mixins/types";
import type { UiIndexTableHost } from "../ui/factory/list";

type ContextCache = Map<string, VueUiContextBase<any>>;
type FieldLogicMap = Record<string, MetaUiFieldLogic<any>>;
type GroupLogicMap = Record<string, MetaUiGroupLogic<any, any>>;

export type CustomManyActionHandleFn = (
  context: VueUiContext<any>,
  selected: any[],
) => unknown;

export interface VueUiContextOptions<E extends object> {
  model: E;
  metaUi: MetaUi;
  view?: UiViewType;
  locale?: string;
  translate?: TranslateFn;
  loader?: () => Promise<E>;
  fieldLogics?: FieldLogicMap;
  groupLogics?: GroupLogicMap;
  app?: MmdaVueApp;
  logic?: EntityLogic<any>;
  /** vue-router；导航用，不放在 Logic 上。 */
  router?: Router | any;
}

/** @deprecated 使用 VueUiContextOptions；logic 在有 IO 时传入即可。 */
export type UiViewContextOptions<E extends object> = VueUiContextOptions<E>;

export interface UiBuildContextOptions<E extends Entity>
  extends VueUiContextOptions<E> {
  logic: EntityLogic<E>;
}

const identityTranslate: TranslateFn = (message) =>
  typeof message === "string" ? message : message.message;

/**
 * 会话本体：构造、model、Logic 绑定、选择态、i18n、会话树。
 * 能力 mixin 叠在导出类 `VueUiContext` 上。
 */
class VueUiContextBase<E extends object = Record<string, any>>
  implements UiContext<E>
{
  readonly model: E;
  metaUi: MetaUi;
  readonly view: UiViewType;
  readonly locale: string;
  readonly loading: Ref<boolean>;
  readonly app?: MmdaVueApp;
  logic?: EntityLogic<any>;
  router?: Router | any;
  customActions: EntityAction[] = [];
  actionLoadings: Record<string, boolean> = reactive({});
  executing = false;
  isEditDialog = false;
  showDialog = false;
  readonly initializedState: Ref<boolean>;
  readonly parent?: VueUiContextBase<any>;
  readonly cache: ContextCache;
  readonly cachePath: string;
  readonly translateFn: TranslateFn;
  readonly loader?: () => Promise<E>;
  fieldLogics: FieldLogicMap;
  groupLogics: GroupLogicMap;
  _groupActions: Record<string, UiAction[]> = {};
  readonly fieldOptions = reactive<Record<string, FieldSearchOptions>>({});
  readonly referenceOptionLoads = new Map<string, Promise<any[]>>();
  readonly validationState: UiValidation;
  readonly unsavedRows = new WeakMap<object, string>();
  unsavedRowSequence = 0;
  #selection: any[] = [];
  /** 列表进详情/编辑的当前行；与勾选 selectedItems 分开。 */
  currentItem: any | null = null;
  currentIndex = -1;
  indexTableHost?: UiIndexTableHost;
  #selectableKey = "default";
  readonly #selectableFns = new Map<string, SelectableFn<any>>();
  #customManyActionKey = "default";
  readonly #customManyActionFns = new Map<string, CustomManyActionHandleFn>();
  #selectionModeValue: "single" | "multiple" | null = null;

  constructor(options: VueUiContextOptions<E>, child?: ChildContextOptions) {
    this.view = options.view ?? UiViewOne.Details;
    const editing =
      this.view === UiViewOne.Edit ||
      this.view === UiViewOne.Create ||
      this.view === UiViewMany.EditMany;
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
    this.metaUi = options.metaUi;
    this.locale = options.locale ?? options.metaUi.locale ?? "zh";
    const app = options.app ?? (child?.parent as any)?.app;
    this.translateFn =
      options.translate ??
      (child?.parent as any)?.translateFn ??
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
    this.logic = options.logic ?? (child?.parent as any)?.logic;
    this.router =
      options.router ?? (child?.parent as any)?.router;
    this.parent = child?.parent as any;
    this.cache = (child?.cache as unknown as ContextCache | undefined) ?? new Map();
    this.cachePath = child?.cachePath ?? "@root";
    this.validationState = reactive(
      child?.validation ?? defineValidation(this.metaUi, this.model as Entity),
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
    return this.#selectionModeValue;
  }

  set selectionMode(mode: "single" | "multiple" | null) {
    this.#selectionModeValue = mode;
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
    return this.#selection;
  }

  set selectedItems(items: any[]) {
    this.#selection = items;
  }

  setSelectableFn(key: string, selectableFn: SelectableFn<any>) {
    this.#selectableFns.set(key, selectableFn);
    this.#selectableKey = key;
  }

  getSelectableFn() {
    return (
      this.#selectableFns.get(this.#selectableKey) ??
      this.logic?.selectableList?.[this.#selectableKey]
    );
  }

  getSelectableKey() {
    return this.#selectableKey;
  }

  setSelectableKey(key: string) {
    this.#selectableKey = key;
  }

  setCustomManyActionHandleFn(key: string, handleFn: CustomManyActionHandleFn) {
    this.#customManyActionFns.set(key, handleFn);
    this.#customManyActionKey = key;
  }

  getCustomManyActionHandleFnKey() {
    return this.#customManyActionKey;
  }

  runCustomManyAction(key = this.#customManyActionKey) {
    return this.#customManyActionFns.get(key)?.(this as any, this.selectedItems);
  }

  get prev(): VueUiContextBase<any> {
    return this.parent ?? this;
  }

  get root(): VueUiContextBase<any> {
    return this.parent?.root ?? this;
  }

  get isRoot() {
    return !this.parent;
  }

  get uiBuilder(): UiBuilder | undefined {
    return this.app?.ui;
  }

  get apiClient() {
    return this.logic?.apiClient;
  }

  get globalProps() {
    return {
      $app: this.app,
      $ui: this.app?.ui,
      $t: (message: string, param?: Record<string, any>) =>
        this.translate(message, param),
      $router: this.router,
    };
  }

  routeToRelative(
    relativeField: MetaUiField | string,
    item?: any,
  ): string | null {
    const field =
      typeof relativeField === "string"
        ? this.metaUi.getField(relativeField)
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

    const appService = service.toUpperCase();
    const idSegment = encodeURIComponent(String(relativeId));
    const path = `/${appService}/${repository}/${idSegment}`;
    const router = this.globalProps.$router;
    if (!router) return path;

    const byPath = router.resolve(path);
    if (byPath.matched.length > 0) return byPath.href;

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
    const key = this.metaUi.labelField ?? this.metaUi.primaryKey;
    const label = key ? model[key] : undefined;
    return label == null || label === ""
      ? this.metaUi.displayLabel
      : `${this.metaUi.displayLabel}【${String(label)}】`;
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
    delete this._groupActions[logic.group.groupName];
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
    this.getFieldLogic(fld)?.onChangeFn?.(this, this.model, value, oldValue);
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
      !fld.nullable || !!this.getFieldLogic(fld)?.requiredFn?.(this.model, this)
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
    const rowKey = this.rowCacheKey(model, cacheKey, this.metaUi.primaryKey);
    const path = `${this.cachePath}/@row/${rowKey}`;
    const cached = this.cache.get(path);
    if (cached) {
      if (toRaw(cached.model as object) !== toRaw(model as object)) {
        this.cache.delete(path);
      } else {
        return cached as any;
      }
    }
    return this.createChild(model, this.metaUi, path, this.view) as any;
  }

  release(model: object, cacheKey = "id") {
    const rowKey = this.rowCacheKey(model, cacheKey, this.metaUi.primaryKey);
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

  get contextCount() {
    return this.cache.size;
  }

  getCacheByID(id: string) {
    for (const context of this.cache.values()) {
      const model = context.model as Record<string, any>;
      const key = context.metaUi.primaryKey ?? "id";
      if (String(model[key] ?? model.id) === String(id)) return context;
    }
    return undefined;
  }

  listRepository() {
    const fromApi = (
      this.app as { api?: { config?: { repository?: string } } } | undefined
    )?.api?.config?.repository;
    if (fromApi) return fromApi;
    const fromLogic = (this.logic as { repository?: string } | undefined)
      ?.repository;
    if (fromLogic) return fromLogic;
    return pluralize(this.metaUi.objName);
  }

  createChild<G extends object>(
    model: G,
    metaUi: MetaUi,
    cachePath: string,
    view: UiViewType,
    fieldLogics = this.fieldLogics,
    logic = this.logic,
  ) {
    return createSession(
      {
        model,
        metaUi,
        view,
        locale: this.locale,
        translate: this.translateFn,
        fieldLogics,
        groupLogics: this.root.groupLogics,
        app: this.app,
        logic,
      },
      {
        parent: this as any,
        cache: this.cache as any,
        cachePath,
      },
    );
  }

  resolveSubGroupTransform<G extends Entity>(
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

  resolveField(field: MetaUiField | string) {
    if (typeof field !== "string") return field;
    const resolved = this.metaUi.getField(field);
    if (!resolved) throw new Error(`Field "${field}" not found.`);
    return resolved;
  }

  validateSingleField(
    field: MetaUiField,
    value: any,
    model: Record<string, any>,
    validation: UiValidation,
  ) {
    if (this.isFieldHidden(field) || this.isFieldReadonly(field)) return 0;
    const result = validateFieldResult(field, value, model, this);
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

  countValidationErrors(value: unknown): number {
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

  resolveGroup(group: MetaUiGroup | string) {
    if (typeof group !== "string") return group;
    const resolved = this.metaUi.getGroup(group);
    if (!resolved) throw new Error(`Group "${group}" not found.`);
    return resolved;
  }

  rowCacheKey(model: object, cacheKey: string, fallbackKey?: string) {
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

/**
 * Vue 表单交互会话。一个类叠能力 mixin；行为由 `view` + 可选 `logic` 门控。
 */
export class VueUiContext<E extends object = Record<string, any>> extends WithNavigate(
  WithData(WithReference(WithValidate(WithSubgroup(VueUiContextBase)))),
) {
  constructor(options: VueUiContextOptions<E>, child?: ChildContextOptions) {
    super(options, child);
  }
}

setSessionFactory(
  (options, child) => new VueUiContext(options as any, child),
);

/** @deprecated 与 VueUiContext 同值；新代码不要再用。 */
export { VueUiContext as UiViewContext, VueUiContext as UiBuildContext };

export type { ChildContextOptions };
export {
  deletableSelectedItems,
  type UiFileTransferOptions,
  type UiSessionIo,
} from "./mixins/data";

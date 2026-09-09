import type { MetaUi, MetaUiField, MetaUiGroup, UiValidation } from "@mmda/core";
import type { UiViewType } from "../view";

export type Constructor<T = any> = new (...args: any[]) => T;

export type GConstructor<T = {}> = new (...args: any[]) => T;

export interface ChildContextOptions {
  parent: ContextHost;
  cache: Map<string, ContextHost>;
  cachePath: string;
  validation?: UiValidation;
}

/** Mixin 可调用的会话宿主（本体 + 已叠内层能力）。 */
export interface ContextHost {
  model: any;
  metaUi: MetaUi;
  view: UiViewType;
  locale: string;
  logic?: any;
  app?: any;
  editing: boolean;
  loading: { value: boolean };
  showDialog: boolean;
  isEditDialog: boolean;
  root: ContextHost;
  prev: ContextHost;
  executing: boolean;
  actionLoadings: Record<string, boolean>;
  customActions: any[];
  filters: any[];
  searchFields: any[];
  customSearchFields: any[];
  searchParam: any;
  listLayoutRev: { value: number };
  selectedItems: any[];
  currentItem: any | null;
  currentIndex: number;
  indexTableHost?: import("../../ui/factory/list").UiIndexTableHost;
  selectionMode: "single" | "multiple" | null;
  $v: UiValidation;
  validationState: UiValidation;
  cache: Map<string, ContextHost>;
  cachePath: string;
  fieldLogics: Record<string, any>;
  translateFn: any;
  referenceOptionLoads: Map<string, Promise<any[]>>;
  baseFilter: string;

  t(message: any, param?: Record<string, any>): string;
  translate(message: string, param?: Record<string, any>): string;
  getFieldValue(field: MetaUiField | string, model?: any): any;
  setFieldValue(field: MetaUiField | string, value: any): void;
  getFieldLogic(field: MetaUiField | string): any;
  getGroupLogic(group: MetaUiGroup | string): any;
  getFieldOptions(field: MetaUiField | string): any;
  isFieldHidden(field: MetaUiField | string): boolean;
  isFieldReadonly(field: MetaUiField | string): boolean;
  isGroupHidden(group: MetaUiGroup | string): boolean;
  isGroupReadonly(group: MetaUiGroup | string): boolean;
  setModel(model: any): void;
  resolveField(field: MetaUiField | string): MetaUiField;
  resolveGroup(group: MetaUiGroup | string): MetaUiGroup;
  createChild(
    model: any,
    metaUi: MetaUi,
    cachePath: string,
    view: UiViewType,
    fieldLogics?: Record<string, any>,
    logic?: any,
  ): ContextHost;
  rowCacheKey(model: object, cacheKey: string, fallbackKey?: string): string;
  resolveSubGroupTransform(param: any): any;
  validateSingleField(
    field: MetaUiField,
    value: any,
    model: Record<string, any>,
    validation: UiValidation,
  ): number;
  countValidationErrors(value: unknown): number;
  listRepository(): string;
  setSelectableFn(key: string, selectableFn: any): void;
  setSelectableKey(key: string): void;
  setCustomManyActionHandleFn(key: string, handleFn: any): void;
  runCustomManyAction(key?: string): unknown;
  configureSearch(filters?: any[], form?: any): void;
  applySearchParam(param: any): void;
  syncSearchState(): void;
  clearFilters(): void;
  validate(): Promise<boolean>;
  save(): Promise<unknown>;
  search(param?: any): Promise<unknown>;
  subGroupItemContext(
    group: MetaUiGroup | string,
    item: any,
    groupMode?: any,
    cacheKey?: string,
  ): ContextHost;
}

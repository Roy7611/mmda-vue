import {
  MetaModel,
  type Attachment,
  type Entity,
  type EntityAction,
  type FieldFilter,
  EntitySearchParam,
  type EntityUrlParam,
  type MetaUiFilter,
  type MetaUiFilterCondition,
  type PagedList,
  type ReportTemplate,
  DefaultFieldFilter,
  EntityQuery,
} from "@mmda/core";
import { ref } from "vue";
import type { ImportOrExportParam } from "../../ui/builder/builder";
import {
  UiCustomSearchField,
  UiFilter,
  quickFiltersToSQL,
  type UiSearchField,
} from "../../ui/factory/filter";
import type { UiSearchForm } from "../../logic/logic";
import { getFileInfo } from "../../components/FileIcons";
import { loadLastQuery, saveLastQuery } from "../../ui/builder/list_last_query";
import {
  logListPaint,
  resetListPaintCount,
} from "../../ui/builder/list_query";
import { rx } from "../../rx";
import { getModuleContext } from "../vue_module_context";
import {
  UiViewMany,
  UiViewOne,
  createDefaultSearchParam,
  type UiViewType,
} from "../view";
import { readStoredPageSize } from "../../app/theme";
import type { Constructor } from "./types";

export interface UiFileTransferOptions extends ImportOrExportParam {
  file?: File;
  files?: File[];
  body?: any;
}

export interface UiSessionIo<E extends Entity = Entity> {
  search(param?: EntitySearchParam): Promise<unknown>;
  refresh(reloadMetadata?: boolean, setLoading?: boolean): Promise<void>;
  reload(): Promise<unknown> | unknown;
  save(): Promise<unknown>;
  delete(): Promise<unknown>;
  index(): void;
  details(idOrItem?: string | E): void;
  edit(id?: string): void;
  create(): void;
}

/** 列表多选里只有 deletable !== false 的行可以提交删除。 */
export function deletableSelectedItems<E extends Entity>(
  items: readonly E[] | undefined | null,
): E[] {
  return (items ?? []).filter((item) => {
    if (item == null) return false;
    const entity = item as Entity;
    if (entity.deletable === false) return false;
    return entity.id != null && String(entity.id) !== "";
  });
}

export function WithData<TBase extends Constructor>(Base: TBase) {
  return class Data extends Base {
    filters: UiFilter[] = [];
    searchFields: UiSearchField[] = [];
    customSearchFields: UiCustomSearchField[] = [];
    searchParam = rx(createDefaultSearchParam());
    lastQuery = ref<import("@mmda/core").EntityQuery | null>(null);
    #captureLastQuery = false;
    listLayoutRev = ref(0);
    searchMode: "fuzzy" | "named" = "fuzzy";
    pageLayoutRev = ref(0);
    joinListMode = false;
    currentTemplate: ReportTemplate | null = null;
    templates: ReportTemplate[] = [];
    uploading = ref(false);
    #selectionModeOverride: "single" | "multiple" | null | undefined;
    #baseFilter = "";

    // 注意：不要在子 context 构造时用 options.metaUi 覆盖共享 logic.metaUi。
    // subGroupContext 会传入子表 groupUi，若写回父 Logic，随后 createRelativeLogic→getGroup 会炸。

    get many() {
      return (
        this.view === UiViewMany.Index ||
        this.view === UiViewMany.SelectOne ||
        this.view === UiViewMany.SelectMany ||
        this.view === UiViewMany.EditMany
      );
    }

    get selectionMode(): "single" | "multiple" | null {
      if (this.view === UiViewMany.SelectOne) return "single";
      if (
        this.view === UiViewMany.SelectMany ||
        this.view === UiViewMany.EditMany
      ) {
        return "multiple";
      }
      if (this.#selectionModeOverride !== undefined) {
        return this.#selectionModeOverride;
      }
      return super.selectionMode as "single" | "multiple" | null;
    }

    set selectionMode(mode: "single" | "multiple" | null) {
      this.#selectionModeOverride = mode;
      super.selectionMode = mode;
    }

    getQueryParam() {
      return (this.searchParam.queryParams ??= {});
    }

    addQueryParam(name: string, value: any) {
      this.getQueryParam()[name] = value;
      if (name === "filter") this.#baseFilter = String(value ?? "");
    }

    rememberLastQuery() {
      this.#captureLastQuery = true;
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
        EntitySearchParam.assign(this.searchParam, form.searchParam);
      const defaultSort = this.logic?.module?.defaultSort;
      if (defaultSort && !this.searchParam.pager.sorts?.length) {
        this.searchParam.pager.sorts = EntityQuery.parseDefaultSort(defaultSort);
      }
      const defaults = DefaultFieldFilter.parse(
        this.logic?.module?.defaultFilter,
      );
      if (defaults.length) {
        this.searchParam.filterModel = DefaultFieldFilter.applySelfToModel(
          this.searchParam.filterModel,
          defaults,
          (name) => this.metaUi?.getField?.(name),
        );
      }
      // 每页条数全局共用 `mmda/pageSize`
      this.searchParam.pager.pageSize = readStoredPageSize();
      void loadLastQuery(this as any);
      if (form?.queryParams) {
        Object.assign(this.getQueryParam(), form.queryParams);
        if (form.queryParams.filter) {
          this.#baseFilter = String(form.queryParams.filter);
        }
      }
      this.searchFields = form?.searchFields ?? [];
      // Logic 里 push 的是 plain CustomSearchField；运行时需要带 searchVal 的 UiCustomSearchField
      this.customSearchFields = (form?.customSearchFields ?? []).map(
        (field: any, index: number, arr: any[]) => {
          if (field instanceof UiCustomSearchField) return field;
          const wrapped = new UiCustomSearchField({
            searchLabel: field.searchLabel ?? field.label ?? "",
            searchParam: field.searchParam,
            renderer: field.renderer,
            valueFn: field.valueFn,
            defaultValue: field.defaultValue,
          });
          arr[index] = wrapped;
          return wrapped;
        },
      );
      if (!this.#baseFilter && this.searchParam.queryParams?.filter) {
        this.#baseFilter = String(this.searchParam.queryParams.filter);
      }
      this.syncSearchState();
    }

    setFieldFilter(field: any, filter?: FieldFilter) {
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
      this.rememberLastQuery();
    }

    syncQuickFilters() {
      const quick = quickFiltersToSQL(this.filters);
      const query = this.getQueryParam();
      const combined =
        this.#baseFilter && quick
          ? `(${this.#baseFilter}) AND (${quick})`
          : this.#baseFilter || quick;
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
      EntitySearchParam.assign(this.searchParam, param);
      this.#baseFilter = String(this.searchParam.queryParams?.filter ?? "");
      for (const filter of this.filters) filter.selectedConditions.value = [];
      this.syncSearchState();
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
    }

    async init(params?: EntityUrlParam) {
      if (!this.logic) return;
      await this.logic.initMetadata(false, params);
      await this.logic.applyTo(this, this.view);
      if (this.many) {
        this.configureSearch(undefined, this.logic.beforeSearch());
      }
      if (this.many) return this.search();
      if (this.view === UiViewOne.Create) {
        const created = await this.logic.create(params?.queryParams ?? {});
        if (created) this.setModel(created);
        return created;
      }
      return this.refresh(false);
    }

    async refresh(reloadMetadata = false, setLoading = true) {
      if (!this.logic) return;
      if (setLoading) this.loading.value = true;
      try {
        if (reloadMetadata) await this.logic.initMetadata(true);
        if (this.logic.beforeLoad) {
          await this.logic.beforeLoad(this, this.model);
        }
        const id = (this.model as Entity).id;
        if (id) {
          const loaded = await this.logic.load(id);
          if (loaded) this.setModel(loaded);
        }
        await this.logic.afterLoad?.(this, this.model);
      } finally {
        this.loading.value = false;
      }
    }

    async initMetadata(reload = false, params?: EntityUrlParam) {
      if (!this.logic) return;
      const metaUi = await this.logic.initMetadata(reload, params);
      if (this.logic.metaUi) {
        this.metaUi = this.logic.metaUi;
      }
      if (this.many) {
        this.configureSearch(undefined, this.logic.beforeSearch());
      }
      return metaUi;
    }

    async save() {
      if (!this.logic) return;
      if (this.logic.beforeSave) {
        const ok = await this.logic.beforeSave(this, this.model);
        if (ok === false) return false;
      }
      if (this.logic.beforeValidate) {
        const ok = await this.logic.beforeValidate(this, this.model);
        if (ok === false) return false;
      }
      const valid = await this.validate();
      if (!valid) {
        const messages = this.collectInvalidMessages?.() ?? [];
        await this.uiBuilder?.message?.(this, {
          severity: "error",
          content:
            messages.length > 0
              ? messages.join("；")
              : this.translate("invalid.model"),
        });
        return false;
      }
      const remoteErrors = await this.logic.afterValidate?.(
        this,
        this.model,
        this.$v,
      );
      if (remoteErrors && remoteErrors > 0) {
        const messages = this.collectInvalidMessages?.() ?? [];
        await this.uiBuilder?.message?.(this, {
          severity: "error",
          content:
            messages.length > 0
              ? messages.join("；")
              : this.translate("failure.beforeSave"),
        });
        return false;
      }
      const result = await this.logic.save(this.model);
      if (result && typeof result === "object") this.setModel(result);
      await this.logic.afterSave?.(this, this.model, undefined, result);
      await this.uiBuilder?.message?.(this, {
        severity: "success",
        content: this.translate("success.saved"),
      });
      return result;
    }

    async delete() {
      if (!this.logic) return;
      if (this.logic.beforeDelete) {
        const ok = await this.logic.beforeDelete(this, this.model);
        if (ok === false) return false;
      }
      const id = (this.model as Entity).id;
      const result = await this.logic.delete(id);
      await this.logic.afterDelete?.(this, this.model, undefined, result);
      if (result !== false && !this.many && id != null && String(id) !== "") {
        getModuleContext(this)?.removeById(String(id));
        this.index();
      }
      return result;
    }

    async deleteAll(ids: string[]) {
      if (!this.logic) return;
      const idSet = new Set((ids ?? []).map((id) => String(id)));
      const selected = deletableSelectedItems(
        (this.selectedItems as Entity[]).length
          ? (this.selectedItems as Entity[])
          : (ids ?? []).map((id) => ({ id }) as unknown as Entity),
      ).filter((item) => idSet.has(String((item as Entity).id)));
      const deletableIds = selected.map((item) => String((item as Entity).id));
      if (!deletableIds.length) return false;

      if (deletableIds.length === 1) {
        const item = selected[0]!;
        if (this.logic.beforeDelete) {
          const ok = await this.logic.beforeDelete(this, item);
          if (ok === false) return false;
        }
        const result = await this.logic.delete(deletableIds[0]);
        await this.logic.afterDelete?.(this, item, undefined, result);
        this.selectedItems = [];
        await this.reload();
        return result;
      }

      if (this.logic.beforeDeleteAll) {
        const ok = await this.logic.beforeDeleteAll(this, selected);
        if (ok === false) return false;
      }
      const result = await this.logic.deleteAll(deletableIds);
      await this.logic.afterDeleteAll?.(this, selected);
      this.selectedItems = [];
      await this.reload();
      return result;
    }

    async search(param?: EntitySearchParam) {
      if (!this.logic) return;
      if (param) this.applySearchParam(param);
      this.syncSearchState();
      resetListPaintCount();
      const currentList = (this.model as { list?: unknown[] })?.list;
      logListPaint("search-start", {
        searchWord: this.searchParam.searchWord,
        pageNo: this.searchParam.pager?.pageNo,
        listLen: Array.isArray(currentList) ? currentList.length : undefined,
        loading: this.loading.value,
      });
      this.error.value = null;
      this.loading.value = true;
      try {
        const useJoinList = this.joinListMode && !!this.logic.viewUi;
        const page = useJoinList
          ? await this.logic.getJoinList(this.searchParam)
          : await this.logic.getAll(this.searchParam);
        const nextList = (page as { list?: unknown[] })?.list;
        logListPaint("search-setModel", {
          pageNo:
            (page as { pagination?: { pageNo?: number } })?.pagination
              ?.pageNo ?? this.searchParam.pager?.pageNo,
          listLen: Array.isArray(nextList) ? nextList.length : undefined,
        });
        if (page) this.setModel(page);
        if (this.#captureLastQuery) {
          this.#captureLastQuery = false;
          void saveLastQuery(this as any);
        }
        return page;
      } catch (e) {
        this.error.value = e;
        throw e;
      } finally {
        this.loading.value = false;
        logListPaint("search-end", { loading: this.loading.value });
      }
    }

    async resetFilters() {
      const selected = this.selectedItems;
      if (this.logic) {
        const ok = await this.logic.beforeResetFilters?.(this, selected);
        if (ok === false) return false;
      }
      this.clearFilters();
      if (this.logic) {
        await this.logic.afterResetFilters?.(this, selected);
        await this.search();
      }
      return true;
    }

    reload() {
      if (!this.logic) return;
      return this.many ? this.search() : this.refresh();
    }

    async doAction(action: EntityAction) {
      if (!this.logic) return;
      if (this.executing) return;
      this.executing = true;
      this.actionLoadings[action.name] = true;
      try {
        if (this.logic.beforeAction) {
          const ok = await this.logic.beforeAction(this, this.model, action);
          if (ok === false) return false;
        }
        const result = await this.logic.doAction(this.model, action);
        await this.logic.afterAction?.(this, this.model, action, result);
        if (action.redirectTo) {
          await this.doRedirectAction(action);
        } else if (result !== false && !this.many) {
          // 成功后停在 details/edit 看新数据；不改保活 Index 列表，等 back 再 assign
          await this.reload();
        }
        return result;
      } finally {
        this.executing = false;
        this.actionLoadings[action.name] = false;
      }
    }

    async doRedirectAction(action: EntityAction) {
      if (!action.redirectTo || !this.router) return;
      return this.router.push(action.redirectTo);
    }

    async print() {
      if (!this.logic) return;
      const ok = await this.logic.beforePrint?.(this, this.model);
      if (ok === false) return false;
      if (typeof window !== "undefined") window.print();
      await this.logic.afterPrint?.(this, this.model);
      return true;
    }

    async uploadFile(file: File, options: UiFileTransferOptions = {}) {
      if (!this.logic) return;
      const ok = await this.logic.beforeUpload?.(this, this.model, file);
      if (ok === false) return false;
      const result = await this.logic.uploadFile(file, options);
      await this.logic.afterUpload?.(this, this.model, undefined, result);
      return result;
    }

    async uploadFiles(files: File[], options: UiFileTransferOptions = {}) {
      if (!this.logic) return;
      const ok = await this.logic.beforeUpload?.(this, this.model, files);
      if (ok === false) return false;
      const result = await this.logic.uploadFiles(files, options);
      await this.logic.afterUpload?.(this, this.model, undefined, result);
      return result;
    }

    async importFile(options: UiFileTransferOptions = {}) {
      if (!this.logic) return;
      if (!options.file) throw new Error("importFile requires options.file.");
      const ok = await this.logic.beforeImport?.(this, this.model, options.file);
      if (ok === false) return false;
      const result = await this.logic.importFile(options.file, options);
      options.importFn?.(this as any, result);
      options.handlerFn?.(this as any, result);
      await this.logic.afterImport?.(this, this.model, undefined, result);
      await this.reload();
      return result;
    }

    async importFiles(options: UiFileTransferOptions = {}) {
      if (!this.logic) return;
      if (!options.files) throw new Error("importFiles requires options.files.");
      const ok = await this.logic.beforeImport?.(
        this,
        this.model,
        options.files,
      );
      if (ok === false) return false;
      const result = await this.logic.importFiles(options.files, options);
      options.importFn?.(this as any, result);
      options.handlerFn?.(this as any, result);
      await this.logic.afterImport?.(this, this.model, undefined, result);
      await this.reload();
      return result;
    }

    async exportFile(options: UiFileTransferOptions = {}) {
      if (!this.logic) return;
      const result = await this.logic.exportFile(
        this.model.id,
        options,
        options.body,
      );
      options.exportFn?.(this as any, result);
      options.handlerFn?.(this as any, result);
      return result;
    }

    async exportFiles(options: UiFileTransferOptions = {}) {
      if (!this.logic) return;
      const result = this.joinListMode
        ? await this.logic.exportJoinList(
            options,
            options.body ?? this.searchParam,
          )
        : await this.logic.exportFiles(options, options.body);
      options.exportFn?.(this as any, result);
      options.handlerFn?.(this as any, result);
      return result;
    }

    async getTemplates(repository = this.logic?.repository) {
      if (!this.logic) return this.templates;
      if (this.templates.length) return this.templates;
      const list = await this.logic.getReportTemplates?.(repository);
      this.templates = list ?? [];
      return this.templates;
    }

    async uploadAttachment(attachment: Attachment, options: EntityUrlParam = {}) {
      return this.#postFilesAction(
        options.action ?? "uploadAttachment",
        attachment,
        { ...options, path: options.path ?? this.model.id },
      );
    }

    async uploadAttachments(
      attachments: Attachment[],
      options: EntityUrlParam = {},
    ) {
      return this.#postFilesAction(
        options.action ?? "uploadAttachments",
        attachments,
        { ...options, path: options.path ?? this.model.id },
      );
    }

    async uploadTemplate(template: ReportTemplate, options: EntityUrlParam = {}) {
      this.currentTemplate = template;
      return this.#postFilesAction(
        options.action ?? "uploadTemplate",
        template,
        options,
      );
    }

    async uploadTemplates(
      templates: ReportTemplate[],
      options: EntityUrlParam = {},
    ) {
      return this.#postFilesAction(
        options.action ?? "uploadTemplates",
        templates,
        options,
      );
    }

    async downloadTemplate(
      template: ReportTemplate,
      options: EntityUrlParam = {},
    ) {
      if (!this.logic) return;
      const blob = await this.logic.postBlob({
        action: options.action ?? "downloadTemplate",
        repository: options.repository ?? this.logic.repository,
        service: options.service,
        queryParams: {
          templateID: template.templateID,
          ...(options.queryParams ?? {}),
        },
      });
      this.#triggerDownload(blob, getFileInfo(template.templateFile).fileName);
      return blob;
    }

    async #postFilesAction(
      action: string,
      body: unknown,
      options: EntityUrlParam,
    ) {
      if (!this.logic) return;
      const ok = await this.logic.beforeUpload?.(this, this.model, body);
      if (ok === false) return false;
      this.uploading.value = true;
      try {
        const result = await this.logic.invokeAction(
          {
            action,
            path: options.path,
            queryParams: options.queryParams,
            repository: options.repository ?? this.logic.repository,
            service: options.service ?? "files",
          },
          body,
        );
        await this.logic.afterUpload?.(this, this.model, undefined, result);
        return result;
      } finally {
        this.uploading.value = false;
      }
    }

    #triggerDownload(blob: Blob, fileName: string) {
      if (typeof document === "undefined") return;
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = "none";
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    }

    assignPaged(page: PagedList<any>) {
      this.setModel(page);
    }

    savable() {
      if (!this.logic) return false;
      return MetaModel.savable(
        this.metaUi,
        this.model,
        this.logic.getSimplifyOptions(),
      );
    }
  };
}

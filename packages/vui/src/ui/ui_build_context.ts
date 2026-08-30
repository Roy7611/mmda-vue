import {
  MetaModel,
  type Attachment,
  type Entity,
  type EntityAction,
  type EntitySearchParam,
  type EntityUrlParam,
  type PagedList,
  type ReportTemplate,
} from "@mmda/core";
import { ref } from "vue";
import type { ImportOrExportParam } from "./ui_builder";
import { UiViewContext, type UiViewContextOptions } from "./ui_context";
import type { CustomManyActionHandleFn } from "./ui_context";
import type { UiLogic } from "./ui_logic";
import { UiViewMany, UiViewOne, type UiViewType } from "./ui_view";
import { getFileInfo } from "./components/FileIcons";

export interface UiBuildContextOptions<
  E extends Entity,
> extends UiViewContextOptions<E> {
  logic: UiLogic<E>;
}

export interface UiFileTransferOptions extends ImportOrExportParam {
  file?: File;
  files?: File[];
  body?: any;
}

/**
 * 屏级运行时：在单实体会话之上增加 load/save/delete、列表刷新和路由动作。
 */
export class UiBuildContext<
  E extends Entity = Entity,
> extends UiViewContext<E> {
  declare logic: UiLogic<E>;
  currentTemplate: ReportTemplate | null = null;
  templates: ReportTemplate[] = [];
  uploading = ref(false);

  constructor(options: UiBuildContextOptions<E>) {
    super(options);
    this.logic = options.logic;
    // DI 里预创建的 Logic 往往还没有 pack；屏级会话若已带 metaui，先挂上。
    // 字段逻辑可能按视图异步加载，统一在 init() 中绑定。
    if (options.metaui) {
      this.logic.meta = {
        ...(this.logic.meta ?? {}),
        metaui: options.metaui,
      } as typeof this.logic.meta;
    }
  }

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
    return super.selectionMode;
  }

  set selectionMode(mode: "single" | "multiple" | null) {
    super.selectionMode = mode;
  }

  async init(params?: EntityUrlParam) {
    await this.logic.initMetadata(false, params);
    // initMetadata 之后再 apply：定制 Logic 的 field()/group() 依赖 metaui
    await this.logic.applyTo(this, this.view);
    if (this.many) {
      this.configureSearch(this.logic.meta.filters, this.logic.beforeSearch());
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
    if (setLoading) this.loading.value = true;
    try {
      if (reloadMetadata) await this.logic.initMetadata(true);
      if (this.logic.beforeLoad) {
        await this.logic.beforeLoad(this as any, this.model);
      }
      const id = (this.model as Entity).id;
      if (id) {
        const loaded = await this.logic.load(id);
        if (loaded) this.setModel(loaded);
      }
      await this.logic.afterLoad?.(this as any, this.model);
    } finally {
      this.loading.value = false;
    }
  }

  async initMetadata(reload = false, params?: EntityUrlParam) {
    const meta = await this.logic.initMetadata(reload, params);
    if (this.many) {
      this.configureSearch(this.logic.meta.filters, this.logic.beforeSearch());
    }
    return meta;
  }

  async save() {
    if (this.logic.beforeSave) {
      const ok = await this.logic.beforeSave(this as any, this.model);
      if (ok === false) return false;
    }
    if (this.logic.beforeValidate) {
      const ok = await this.logic.beforeValidate(this as any, this.model);
      if (ok === false) return false;
    }
    const valid = await this.validate();
    if (!valid) return false;
    const remoteErrors = await this.logic.afterValidate?.(
      this as any,
      this.model,
      this.$v,
    );
    if (remoteErrors && remoteErrors > 0) return false;
    const result = await this.logic.save(this.model);
    if (result && typeof result === "object") this.setModel(result as E);
    await this.logic.afterSave?.(this as any, this.model, undefined, result);
    await this.app?.toast(this as any, {
      severity: "success",
      detail: this.translate("success.saved"),
    });
    return result;
  }

  async delete() {
    if (this.logic.beforeDelete) {
      const ok = await this.logic.beforeDelete(this as any, this.model);
      if (ok === false) return false;
    }
    const result = await this.logic.delete((this.model as Entity).id);
    await this.logic.afterDelete?.(this as any, this.model, undefined, result);
    return result;
  }

  async deleteAll(ids: string[]) {
    if (this.logic.beforeDeleteAll) {
      const ok = await this.logic.beforeDeleteAll(this as any, [] as E[]);
      if (ok === false) return false;
    }
    const selected = this.selectedItems as E[];
    const result = await this.logic.deleteAll(ids);
    await this.logic.afterDeleteAll?.(this as any, selected);
    this.selectedItems = [];
    await this.reload();
    return result;
  }

  async search(param?: EntitySearchParam) {
    if (param) this.applySearchParam(param);
    this.syncSearchState();
    this.loading.value = true;
    try {
      const page = await this.logic.getAll(this.searchParam);
      if (page) this.setModel(page as unknown as E);
      return page;
    } finally {
      this.loading.value = false;
    }
  }

  async resetFilters() {
    const selected = this.selectedItems as E[];
    const ok = await this.logic.beforeResetFilters?.(this as any, selected);
    if (ok === false) return false;
    super.resetFilters();
    await this.logic.afterResetFilters?.(this as any, selected);
    await this.search();
    return true;
  }

  reload() {
    return this.many ? this.search() : this.refresh();
  }

  async doAction(action: EntityAction) {
    if (this.executing) return;
    this.executing = true;
    this.actionLoadings[action.name] = true;
    try {
      if (this.logic.beforeAction) {
        const ok = await this.logic.beforeAction(
          this as any,
          this.model,
          action,
        );
        if (ok === false) return false;
      }
      const result = await this.logic.doAction(this.model, action);
      await this.logic.afterAction?.(this as any, this.model, action, result);
      if (action.redirectTo) await this.doRedirectAction(action);
      return result;
    } finally {
      this.executing = false;
      this.actionLoadings[action.name] = false;
    }
  }

  async doRedirectAction(action: EntityAction) {
    if (!action.redirectTo || !this.logic.router) return;
    return this.logic.router.push(action.redirectTo);
  }

  async confirmAction() {
    if (
      this.view === UiViewMany.SelectMany ||
      this.view === UiViewMany.EditMany ||
      this.selectionMode === "multiple"
    ) {
      if (!this.selectedItems.length) {
        await this.app?.ui.toast(this as any, {
          severity: "error",
          detail: this.t("invalid.requiredSelectAny"),
        });
        return false;
      }
      const result = await this.runCustomManyAction();
      if (result === false) return false;
      this.cancel();
      await this.search();
      return result;
    }
    const result = await this.save();
    if (result !== false) this.cancel();
    return result;
  }

  cancel() {
    if (
      this.view === UiViewMany.SelectMany ||
      this.view === UiViewMany.EditMany
    ) {
      this.selectedItems = [];
      this.selectionMode = null;
      this.index();
      return;
    }
    const router = this.logic.router;
    if (router?.back) return router.back();
    return this.index();
  }

  async print() {
    const ok = await this.logic.beforePrint?.(this as any, this.model);
    if (ok === false) return false;
    if (typeof window !== "undefined") window.print();
    await this.logic.afterPrint?.(this as any, this.model);
    return true;
  }

  async uploadFile(file: File, options: UiFileTransferOptions = {}) {
    const ok = await this.logic.beforeUpload?.(this as any, this.model, file);
    if (ok === false) return false;
    const result = await this.logic.uploadFile(file, options);
    await this.logic.afterUpload?.(this as any, this.model, undefined, result);
    return result;
  }

  async uploadFiles(files: File[], options: UiFileTransferOptions = {}) {
    const ok = await this.logic.beforeUpload?.(this as any, this.model, files);
    if (ok === false) return false;
    const result = await this.logic.uploadFiles(files, options);
    await this.logic.afterUpload?.(this as any, this.model, undefined, result);
    return result;
  }

  async importFile(options: UiFileTransferOptions = {}) {
    if (!options.file) throw new Error("importFile requires options.file.");
    const ok = await this.logic.beforeImport?.(
      this as any,
      this.model,
      options.file,
    );
    if (ok === false) return false;
    const result = await this.logic.importFile(options.file, options);
    options.importFn?.(this as any, result);
    options.handlerFn?.(this as any, result);
    await this.logic.afterImport?.(this as any, this.model, undefined, result);
    await this.reload();
    return result;
  }

  async importFiles(options: UiFileTransferOptions = {}) {
    if (!options.files) throw new Error("importFiles requires options.files.");
    const ok = await this.logic.beforeImport?.(
      this as any,
      this.model,
      options.files,
    );
    if (ok === false) return false;
    const result = await this.logic.importFiles(options.files, options);
    options.importFn?.(this as any, result);
    options.handlerFn?.(this as any, result);
    await this.logic.afterImport?.(this as any, this.model, undefined, result);
    await this.reload();
    return result;
  }

  async exportFile(options: UiFileTransferOptions = {}) {
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
    const result = await this.logic.exportFiles(options, options.body);
    options.exportFn?.(this as any, result);
    options.handlerFn?.(this as any, result);
    return result;
  }

  async getTemplates(repository = this.logic.repository) {
    if (this.templates.length) return this.templates;
    const list = await this.logic.metaUiService.getAllTemplate?.(repository);
    this.templates = list ?? [];
    return this.templates;
  }

  async uploadAttachment(attachment: Attachment, options: EntityUrlParam = {}) {
    return this.postFilesAction(
      options.action ?? "uploadAttachment",
      attachment,
      { ...options, path: options.path ?? this.model.id },
    );
  }

  async uploadAttachments(
    attachments: Attachment[],
    options: EntityUrlParam = {},
  ) {
    return this.postFilesAction(
      options.action ?? "uploadAttachments",
      attachments,
      { ...options, path: options.path ?? this.model.id },
    );
  }

  async uploadTemplate(template: ReportTemplate, options: EntityUrlParam = {}) {
    this.currentTemplate = template;
    return this.postFilesAction(
      options.action ?? "uploadTemplate",
      template,
      options,
    );
  }

  async uploadTemplates(
    templates: ReportTemplate[],
    options: EntityUrlParam = {},
  ) {
    return this.postFilesAction(
      options.action ?? "uploadTemplates",
      templates,
      options,
    );
  }

  async downloadTemplate(
    template: ReportTemplate,
    options: EntityUrlParam = {},
  ) {
    const url = this.logic.apiClient.buildEntityURL({
      action: options.action ?? "downloadTemplate",
      repository: options.repository ?? this.logic.repository,
      service: options.service,
      queryParams: {
        templateID: template.templateID,
        ...(options.queryParams ?? {}),
      },
    });
    const blob = await this.logic.apiClient.http.postBlob(url, {});
    this.triggerDownload(blob, getFileInfo(template.templateFile).fileName);
    return blob;
  }

  private async postFilesAction(
    action: string,
    body: unknown,
    options: EntityUrlParam,
  ) {
    const ok = await this.logic.beforeUpload?.(this as any, this.model, body);
    if (ok === false) return false;
    this.uploading.value = true;
    try {
      const result = await this.logic.apiClient.doAction(
        {
          action,
          path: options.path,
          queryParams: options.queryParams,
          repository: options.repository ?? this.logic.repository,
          service: options.service ?? "files",
        },
        body,
      );
      await this.logic.afterUpload?.(
        this as any,
        this.model,
        undefined,
        result,
      );
      return result;
    } finally {
      this.uploading.value = false;
    }
  }

  private triggerDownload(blob: Blob, fileName: string) {
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

  routeTo(view: UiViewType, id?: string) {
    const router = this.logic.router;
    if (!router) return;
    const service = (this.app?.name ?? "base").toUpperCase();
    const repo = this.logic.repository;
    const root = `/${service}/${repo}`;
    if (view === UiViewMany.Index || view === UiViewMany.SelectMany) {
      router.push({
        path: root,
        query: view === UiViewMany.SelectMany ? { view: "selectMany" } : {},
      });
      return;
    }
    if (view === UiViewOne.Create) {
      router.push(`${root}/Create`);
      return;
    }
    if (view === UiViewOne.Edit) {
      router.push(`${root}/Edit/${id}`);
      return;
    }
    router.push(`${root}/${id}`);
  }

  index() {
    this.routeTo(UiViewMany.Index);
  }

  toSelectManyIndex(selectableKey: string, handleFn: CustomManyActionHandleFn) {
    this.setSelectableKey(selectableKey);
    this.setCustomManyActionHandleFn(selectableKey, handleFn);
    this.routeTo(UiViewMany.SelectMany);
  }

  edit(id = (this.model as Entity).id) {
    this.routeTo(UiViewOne.Edit, id);
  }

  create() {
    this.routeTo(UiViewOne.Create);
  }

  details(idOrItem?: string | E) {
    if (idOrItem != null && typeof idOrItem === "object") {
      const entity = idOrItem as Entity;
      const key = this.metaui.primaryKey ?? "id";
      const id =
        entity.id ??
        (entity as Record<string, unknown>)[key];
      this.routeTo(UiViewOne.Details, String(id ?? ""));
      return;
    }
    this.routeTo(UiViewOne.Details, idOrItem ?? (this.model as Entity).id);
  }

  assignPaged(page: PagedList<E>) {
    this.setModel(page as unknown as E);
  }

  savable() {
    return MetaModel.savable(
      this.metaui,
      this.model,
      this.logic.getSimplifyOptions(),
    );
  }
}

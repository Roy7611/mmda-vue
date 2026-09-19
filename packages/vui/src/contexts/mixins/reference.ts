import {
  MetaUiFieldLogic,
  defaultChoicePager,
  defineEntity,
  pagedListIsComplete,
  type Entity,
  type MetaUiField,
  type EntitySelectParam,
  type Module,
  type ModuleAuth,
  EntitySearchParam,
} from "@mmda/core";
import type { Ref } from "vue";
import { UiViewMany } from "../view";
import { createSession } from "./session";
import type { Constructor } from "./types";

const SELECT_READONLY_AUTH: ModuleAuth = {
  allowRead: false,
  allowCreate: false,
  allowEdit: false,
  allowDelete: false,
  allowPrint: false,
  allowExport: false,
  allowImport: false,
  allowUpload: false,
  allowDownload: false,
};

function resolveSelectAuthority(
  param: EntitySelectParam<Entity>,
  module: Module | undefined,
): ModuleAuth {
  if (param.authority) {
    return {
      ...SELECT_READONLY_AUTH,
      ...(module?.authority ?? {}),
      ...param.authority,
    };
  }
  if (module?.authority) return { ...module.authority };
  return { ...SELECT_READONLY_AUTH };
}

export function WithReference<TBase extends Constructor>(
  Base: TBase,
) {
  return class Reference extends Base {
    async searchRelative(
      field: MetaUiField,
      searchWord = "",
      model?: Entity,
    ) {
      const row =
        model ?? (Array.isArray(this.model) ? undefined : this.model);
      const options = this.getFieldOptions(field);
      if (options.searching) return options;
      options.searching = true;
      options.searchParam.searchWord = searchWord;
      try {
        if (field.reference?.isEnum) {
          options.selectOptions = field.reference.refOptions ?? [];
          return options;
        }
        const ref = field.reference;
        if (!ref || !this.logic || !ref.refRepository) return options;
        const where = (
          this.getFieldLogic(field) ?? new MetaUiFieldLogic(field)
        ).buildRefWhere(row as Entity, this as any);
        const queryParams = { ...(options.searchParam.queryParams ?? {}) };
        if (where) queryParams.filter = where;
        else delete queryParams.filter;
        options.searchParam.queryParams = queryParams;
        const page = await this.logic.searchRelative(options.searchParam, {
          repository: ref.refRepository,
          service: ref.service,
        });
        options.selectOptions = page?.list ?? [];
        options.pagination = page?.pagination;
        return options;
      } finally {
        options.searching = false;
      }
    }

    /**
     * 首页 50 写入 refOptions。enum / 已有缓存直接返回；
     * ref 与 hasOne 同一套；搜索页不要走这里。
     */
    async loadReferenceOptions(field: MetaUiField): Promise<any[]> {
      const ref = field.reference;
      if (!ref) return [];
      if (ref.isEnum) return ref.refOptions;
      if (ref.refOptions.length > 0) {
        const cached = this.getFieldOptions(field);
        cached.selectOptions = ref.refOptions;
        cached.refOptionsComplete = ref.refOptionsComplete;
        return ref.refOptions;
      }
      if (
        !(ref.isRef || ref.hasOne) ||
        !this.logic ||
        !ref.refRepository
      ) {
        return ref.refOptions;
      }

      const cacheKey = `${ref.service ?? ""}:${ref.refRepository}:${field.fieldName}`;
      const pending = this.referenceOptionLoads.get(cacheKey);
      if (pending) return pending;

      const request = (async () => {
        const options = this.getFieldOptions(field);
        options.searchParam.pager = defaultChoicePager();
        options.searchParam.searchWord = "";
        const page = await this.logic!.searchRelative(options.searchParam, {
          repository: ref.refRepository!,
          service: ref.service,
        });
        const list = page?.list ?? [];
        ref.refOptions.splice(0, ref.refOptions.length, ...list);
        const complete = pagedListIsComplete({
          list,
          pagination: page?.pagination ?? defaultChoicePager(),
        });
        ref.refOptionsComplete = complete;
        options.refOptionsComplete = complete;
        options.selectOptions = ref.refOptions;
        if (page?.pagination) options.pagination = page.pagination;
        return ref.refOptions;
      })();

      this.referenceOptionLoads.set(cacheKey, request);
      try {
        return await request;
      } finally {
        this.referenceOptionLoads.delete(cacheKey);
      }
    }

    async select<T extends Entity>(
      fieldOrParam: MetaUiField | string | EntitySelectParam<T>,
    ): Promise<Entity | false | boolean | T[]> {
      if (
        typeof fieldOrParam === "string" ||
        (fieldOrParam &&
          typeof (fieldOrParam as MetaUiField).fieldName === "string" &&
          !("repository" in (fieldOrParam as object)))
      ) {
        const fld = this.resolveField(fieldOrParam as MetaUiField | string);
        const ref = fld.reference;
        if (!ref?.refRepository || !this.app) {
          void this.uiBuilder?.toast?.(this, {
            severity: "error",
            title: this.t("dialog.title.error"),
            message: this.t("invalid.fieldNoRef", { field: fld.fieldName }),
            life: 3000,
          });
          return false;
        }
        const options = this.getFieldOptions(fld);
        try {
          const picked = await this.select({
            repository: ref.refRepository,
            service: ref.service,
            searchParam: options.searchParam,
            selectionMode: "single",
          });
          if (!Array.isArray(picked) || !picked[0]) return false;
          this.setFieldValue(fld, picked[0]);
          options.currentSelectOption = picked[0];
          if (
            !options.selectOptions.some(
              (item: any) => ref.valueOf(item) === ref.valueOf(picked[0]),
            )
          ) {
            options.selectOptions.unshift(picked[0]);
          }
          return picked[0];
        } catch (error) {
          console.error(error);
          void this.uiBuilder?.toast?.(this, {
            severity: "error",
            title: this.t("dialog.title.error"),
            message: error instanceof Error ? error.message : String(error),
            life: 3000,
          });
          return false;
        }
      }
      const param = fieldOrParam as EntitySelectParam<T>;
      if (!this.app || !this.uiBuilder) return false;
      const service = param.service ?? this.app.name ?? "base";
      const metaUi = await this.app.meta.get(
        param.repository,
        param.service,
      );
      const objName = metaUi.objName;
      const foundModule =
        this.app.findModule?.(objName) ??
        this.app.meta.findModule?.(objName) ??
        undefined;
      const authority = resolveSelectAuthority(param, foundModule);
      const module: Module = foundModule
        ? { ...foundModule, authority: { ...foundModule.authority, ...authority } }
        : ({
            moduleCode: objName,
            moduleLabel: metaUi.displayLabel ?? param.repository,
            moduleType: "FEATURE",
            moduleVersion: 0,
            objName,
            authority,
          } as Module);

      const { VueEntityLogic } = await import("../../logic/logic");
      const logicToken = `${service}:${param.repository}Logic`;
      let logic: InstanceType<typeof VueEntityLogic> | undefined;
      try {
        logic = await this.app.di?.injectAsync?.(logicToken);
      } catch {
        // 未注册业务 Logic 时走通用实体 Logic
      }
      if (!logic) {
        logic = new VueEntityLogic(param.ctor ?? defineEntity, {
          metaUiService: this.app.meta,
          repository: param.repository,
          metaUi,
          module,
          apiService: param.service,
        });
      } else {
        logic.metaUi = metaUi;
        logic.module = module;
      }

      const selectionMode = param.selectionMode ?? "multiple";
      const selectCtx = createSession({
        model: [] as T[],
        metaUi,
        view:
          selectionMode === "single"
            ? UiViewMany.SelectOne
            : UiViewMany.SelectMany,
        locale: this.locale,
        translate: this.translateFn,
        app: this.app,
        logic,
        router: this.router,
      });
      if (param.searchParam) {
        EntitySearchParam.assign(selectCtx.searchParam, param.searchParam);
      }
      if (param.selectableFn) {
        selectCtx.setSelectableFn("select", param.selectableFn);
      }
      selectCtx.selectedItems = [];
      await selectCtx.init();

      const showActions =
        authority.allowCreate || authority.allowEdit || authority.allowDelete;
      const showActionColumn =
        authority.allowRead ||
        authority.allowEdit ||
        authority.allowDelete;
      let picked: T[] = [];
      const listProps = {
        selectionMode,
        showToolbar: true,
        showSearchbar: true,
        showBreadcrumb: false,
        showActions,
        showActionColumn,
        loading: selectCtx.loading as Ref<boolean>,
        onSelect: (selection: T[]) => {
          selectCtx.selectedItems = selection ?? [];
          if (selection?.length) picked = selection;
        },
        onItemDoubleClick:
          selectionMode === "single"
            ? (item: T) => {
                picked = item != null ? [item] : [];
                selectCtx.selectedItems = picked;
                void this.uiBuilder?.overlay?.closeTopDialog?.("ok");
              }
            : undefined,
      };

      this.root.showDialog = true;
      try {
        const entityLabel =
          metaUi.displayLabel ?? param.repository;
        const title = selectCtx.t(
          selectionMode === "single"
            ? "view.selectOneEntity"
            : "view.selectManyEntity",
          { entity: entityLabel },
        );
        const result = await this.uiBuilder.selectDialog(selectCtx, {
          dlgProps: {
            name: "select",
            title,
            width: "80vw",
            height: "80vh",
            maxHeight: "90vh",
          },
          viewProps: listProps,
        });
        if (result !== "ok") return false;
        if (!picked.length && selectCtx.selectedItems?.length) {
          picked = selectCtx.selectedItems as T[];
        }
        return picked;
      } finally {
        this.root.showDialog = false;
      }
    }
  };
}

import {
  MetaUiFieldLogic,
  emptyPagedList,
  assignSearchParam,
  defineEntity,
  MetaModel,
  type MetaUiField,
  type EntitySelectParam,
} from "@mmda/core";
import { UiViewMany } from "../view";
import { createSession } from "./session";
import type { Constructor } from "./types";

export function WithReference<TBase extends Constructor>(
  Base: TBase,
) {
  return class Reference extends Base {
    async searchRelative(
      field: MetaUiField,
      searchWord = "",
      model = this.model,
    ) {
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
        ).buildRefWhere(model, this as any);
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
     * 为下拉类控件按需加载 REF / 枚举选项，并写回共享 refOptions。
     * enum 或已有缓存直接返回；ref 无缓存走当前列表实体 pivotValues；hasOne 不一次灌全量。
     */
    async loadReferenceOptions(field: MetaUiField): Promise<any[]> {
      const ref = field.reference;
      if (!ref) return [];
      if (ref.isEnum || ref.refOptions.length > 0) return ref.refOptions;
      if (ref.hasOne && !ref.isRef) return ref.refOptions;
      if (!ref.isRef || !this.app) {
        return ref.refOptions;
      }

      const cacheKey = `${ref.service ?? ""}:${this.listRepository()}:${field.fieldName}`;
      const pending = this.referenceOptionLoads.get(cacheKey);
      if (pending) return pending;

      const request = (async () => {
        const api = this.app!.api as {
          getPivotValues?: (
            field: string,
            options?: Record<string, unknown>,
          ) => Promise<string[]>;
          config?: { repository?: string; service?: string };
        };
        const values =
          (await api.getPivotValues?.(field.fieldName, {
            repository: this.listRepository(),
            service: ref.service ?? api.config?.service,
          })) ?? [];
        const valueKey = ref.refFlds?.[0] ?? field.fieldName;
        const options = values.map((value) => ({ [valueKey]: value }));
        ref.refOptions.splice(0, ref.refOptions.length, ...options);
        this.getFieldOptions(field).selectOptions = ref.refOptions;
        return ref.refOptions;
      })();

      this.referenceOptionLoads.set(cacheKey, request);
      try {
        return await request;
      } finally {
        this.referenceOptionLoads.delete(cacheKey);
      }
    }

    async select<T>(
      fieldOrParam: MetaUiField | string | EntitySelectParam<T>,
    ): Promise<any> {
      if (
        typeof fieldOrParam === "string" ||
        (fieldOrParam &&
          typeof (fieldOrParam as MetaUiField).fieldName === "string" &&
          !("repository" in (fieldOrParam as object)))
      ) {
        const fld = this.resolveField(fieldOrParam as MetaUiField | string);
        const ref = fld.reference;
        if (!ref?.refRepository || !this.app) {
          this.app?.ui.toast(this, {
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
          this.app.ui.toast(this, {
            severity: "error",
            title: this.t("dialog.title.error"),
            message: error instanceof Error ? error.message : String(error),
            life: 3000,
          });
          return false;
        }
      }
      const param = fieldOrParam as EntitySelectParam<T>;
      if (!this.app) return false;
      const pack = await this.app.meta.getPack({
        repository: param.repository,
        service: param.service,
      });
      const ctor =
        param.ctor ??
        ((source: object) =>
          MetaModel.createEntity(pack.metaUi, defineEntity, source) as T);
      const { VueEntityLogic } = await import("../../logic/logic");
      const logic = new VueEntityLogic(ctor as any, {
        metaUiService: this.app.meta,
        repository: param.repository,
        meta: pack,
        apiService: param.service,
      });
      const selectionMode = param.selectionMode ?? "multiple";
      const selectCtx = createSession({
        model: emptyPagedList<T>() as any,
        metaUi: pack.metaUi,
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
        assignSearchParam(selectCtx.searchParam, param.searchParam);
      }
      if (param.selectableFn) {
        selectCtx.setSelectableFn("select", param.selectableFn);
      }
      selectCtx.selectedItems = [];
      await selectCtx.init();
      this.root.showDialog = true;
      let picked: T[] = [];
      try {
        const result = await this.app.ui.dialog(
          this.app.ui.buildView(selectCtx, {
            selectionMode,
            showToolbar: true,
            showSearchbar: true,
            showBreadcrumb: false,
            showActions: false,
            showActionColumn: false,
            onSelect: (selection: T[]) => {
              selectCtx.selectedItems = selection ?? [];
              if (selection?.length) picked = selection;
            },
            onItemDoubleClick:
              selectionMode === "single"
                ? (item: T) => {
                    picked = item != null ? [item] : [];
                    selectCtx.selectedItems = picked;
                    void this.app?.ui.overlay.closeTopDialog?.('ok');
                  }
                : undefined,
          }),
          selectCtx,
          {
            name: "select",
            title: pack.metaUi.displayLabel ?? param.repository,
            width: "80vw",
            height: "80vh",
            maxHeight: "90vh",
          },
        );
        if (result !== 'ok') return false;
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

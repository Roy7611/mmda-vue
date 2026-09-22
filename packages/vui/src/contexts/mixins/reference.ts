import {
  MetaUiFieldLogic,
  defineEntity,
  GenericEntityLogic,
  type Entity,
  type EntityLogic,
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
    select(field: MetaUiField | string): Promise<Entity | false>
    select<T extends Entity>(
      param: EntitySelectParam<T>,
    ): Promise<boolean | T[]>
    async select<T extends Entity>(
      fieldOrParam: MetaUiField | string | EntitySelectParam<T>,
    ): Promise<Entity | false | boolean | T[]> {
      if (this.isFieldSelect(fieldOrParam)) {
        return this.selectByField(fieldOrParam)
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

      const logicToken = `${service}:${param.repository}Logic`;
      let logic: EntityLogic<any> | undefined;
      try {
        logic = await this.app.di?.injectAsync?.(logicToken);
      } catch {
        // 未注册业务 Logic 时走通用实体 Logic
      }
      if (!logic) {
        logic = await GenericEntityLogic.resolve(
          this.app.di,
          logicToken,
          param.ctor ?? defineEntity,
          {
            metaUiService: this.app.meta,
            repository: param.repository,
            metaUi,
            module,
            apiService: param.service,
          },
        );
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
        router: this.vueRouter,
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

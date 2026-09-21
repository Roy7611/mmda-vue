import type { Entity } from "@mmda/core";
import { getModuleContext } from "../vue_module_context";
import { UiViewMany, UiViewOne, type UiViewType } from "../view";
import type { Constructor } from "./types";

function listIndexOf(context: any, row: Entity): number {
  const list = (context.model as { list?: Entity[] } | undefined)?.list;
  if (!Array.isArray(list)) return -1;
  const idx = list.indexOf(row);
  if (idx >= 0) return idx;
  const key = context.metaUi?.primaryKey ?? "id";
  const id = String(
    (row as Record<string, unknown>)[key] ?? row.id ?? "",
  );
  if (!id) return -1;
  return list.findIndex(
    (item) =>
      String((item as Record<string, unknown>)[key] ?? item.id) === id,
  );
}

export function WithNavigate<TBase extends Constructor>(
  Base: TBase,
) {
  return class Navigate extends Base {
    async confirmAction() {
      if (
        this.view === UiViewMany.SelectMany ||
        this.view === UiViewMany.EditMany ||
        this.selectionMode === "multiple"
      ) {
        if (!this.selectedItems.length) {
          await this.uiBuilder?.toast?.(this, {
            severity: "error",
            message: this.t("invalid.requiredSelectAny"),
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
        return this.routeToIndex();
      }
      // details → index：写回 currentItem（含 doAction），不 search
      if (this.view === UiViewOne.Details) {
        try {
          const model = this.model as Record<string, unknown> | undefined;
          if (model) getModuleContext(this)?.applyCurrentRow(model);
        } catch {
          // 写回失败仍回列表，避免「返回」无响应
        }
        return this.routeToIndex();
      }
      // create/edit 放弃：回列表，不写 index
      return this.routeToIndex();
    }

    routeTo(view: UiViewType, id?: string) {
      const router = this.router;
      if (!router || !this.logic) return;
      const service = (this.logic.serviceName ?? "base").toUpperCase();
      const repo = this.logic.repository;
      const root = `/${service}/${repo}`;
      const push = (target: string | { path: string; query?: Record<string, string> }) =>
        Promise.resolve(router.push(target)).catch(() => {
          if (typeof router.back === "function") return router.back();
        });
      if (view === UiViewMany.Index || view === UiViewMany.SelectMany) {
        return push({
          path: root,
          query: view === UiViewMany.SelectMany ? { view: "selectMany" } : {},
        });
      }
      if (view === UiViewOne.Create) {
        return push(`${root}/Create`);
      }
      if (view === UiViewOne.Edit) {
        return push(`${root}/Edit/${id}`);
      }
      if (view === UiViewOne.Search) {
        return push(`${root}/Search`);
      }
      return push(`${root}/${id}`);
    }

    /** 回列表：优先按当前 URL 剥掉末段（详情/编辑），避免 logic 拼径与路由不一致时 push 空转。 */
    routeToIndex() {
      const router = this.router as
        | { currentRoute?: { value?: { path?: string } }; push: (t: unknown) => unknown; back?: () => unknown }
        | undefined;
      const path = router?.currentRoute?.value?.path;
      if (path && router) {
        const parts = path.split("/").filter(Boolean);
        // /MES/Materials/xxx 或 /MES/Materials/Edit/xxx → /MES/Materials
        if (parts.length >= 3) {
          const listPath = `/${parts[0]}/${parts[1]}`;
          if (listPath !== path) {
            return Promise.resolve(router.push({ path: listPath })).catch(() =>
              typeof router.back === "function" ? router.back() : undefined,
            );
          }
        }
      }
      return this.routeTo(UiViewMany.Index);
    }

    selectMany(selectableKey: string, handleFn: (...args: any[]) => unknown) {
      this.setSelectableKey(selectableKey);
      this.setCustomManyActionHandleFn(selectableKey, handleFn);
      this.routeTo(UiViewMany.SelectMany);
    }

    routeToEdit(idOrItem?: string | Entity) {
      if (this.isInDialog) {
        const item =
          idOrItem != null && typeof idOrItem === "object"
            ? (idOrItem as Entity)
            : undefined;
        void this.uiBuilder?.openNestEntityDialog(this, "edit", item);
        return;
      }
      if (idOrItem != null && typeof idOrItem === "object") {
        const entity = idOrItem as Entity;
        const key = this.metaUi.primaryKey ?? "id";
        const id =
          entity.id ?? (entity as Record<string, unknown>)[key];
        if (this.many) {
          this.currentItem = entity;
          this.currentIndex = listIndexOf(this, entity);
          getModuleContext(this)?.setCurrent(entity, this.currentIndex);
        }
        this.routeTo(UiViewOne.Edit, String(id ?? ""));
        return;
      }
      this.routeTo(
        UiViewOne.Edit,
        (idOrItem as string | undefined) ?? (this.model as Entity).id,
      );
    }

    routeToCreate() {
      if (this.isInDialog) {
        void this.uiBuilder?.openNestEntityDialog(this, "create");
        return;
      }
      if (this.many) {
        this.currentItem = null;
        this.currentIndex = -1;
        getModuleContext(this)?.beginCreate();
      }
      this.routeTo(UiViewOne.Create);
    }

    routeToSearch() {
      this.routeTo(UiViewOne.Search);
    }

    routeToDetails(idOrItem?: string | Entity) {
      if (this.isInDialog) {
        const item =
          idOrItem != null && typeof idOrItem === "object"
            ? (idOrItem as Entity)
            : undefined;
        void this.uiBuilder?.openNestEntityDialog(this, "details", item);
        return;
      }
      if (idOrItem != null && typeof idOrItem === "object") {
        const entity = idOrItem as Entity;
        const key = this.metaUi.primaryKey ?? "id";
        const id =
          entity.id ?? (entity as Record<string, unknown>)[key];
        if (this.many) {
          this.currentItem = entity;
          this.currentIndex = listIndexOf(this, entity);
          getModuleContext(this)?.setCurrent(entity, this.currentIndex);
        }
        this.routeTo(UiViewOne.Details, String(id ?? ""));
        return;
      }
      this.routeTo(
        UiViewOne.Details,
        (idOrItem as string | undefined) ?? (this.model as Entity).id,
      );
    }
  };
}

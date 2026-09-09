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
          await this.app?.ui?.toast(this, {
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
        this.index();
        return;
      }
      // details → index：写回 currentItem（含 doAction），不 search
      if (this.view === UiViewOne.Details) {
        const model = this.model as Record<string, unknown> | undefined;
        if (model) getModuleContext(this)?.applyCurrentRow(model);
        return this.index();
      }
      // create/edit 放弃：回列表，不写 index
      return this.index();
    }

    routeTo(view: UiViewType, id?: string) {
      const router = this.router;
      if (!router || !this.logic) return;
      const service = (this.logic.serviceName ?? "base").toUpperCase();
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

    toSelectManyIndex(selectableKey: string, handleFn: (...args: any[]) => unknown) {
      this.setSelectableKey(selectableKey);
      this.setCustomManyActionHandleFn(selectableKey, handleFn);
      this.routeTo(UiViewMany.SelectMany);
    }

    edit(idOrItem?: string | Entity) {
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

    create() {
      if (this.many) {
        this.currentItem = null;
        this.currentIndex = -1;
        getModuleContext(this)?.beginCreate();
      }
      this.routeTo(UiViewOne.Create);
    }

    details(idOrItem?: string | Entity) {
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

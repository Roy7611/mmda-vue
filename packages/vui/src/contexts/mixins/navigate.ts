import type { Entity } from "@mmda/core";
import { UiViewMany, UiViewOne, type UiViewType } from "../view";
import type { Constructor } from "./types";

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
      const router = this.logic?.router;
      if (router?.back) return router.back();
      return this.index();
    }

    routeTo(view: UiViewType, id?: string) {
      const router = this.logic?.router;
      if (!router) return;
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

    edit(id = (this.model as Entity).id) {
      this.routeTo(UiViewOne.Edit, id);
    }

    create() {
      this.routeTo(UiViewOne.Create);
    }

    details(idOrItem?: string | Entity) {
      if (idOrItem != null && typeof idOrItem === "object") {
        const entity = idOrItem as Entity;
        const key = this.metaUi.primaryKey ?? "id";
        const id =
          entity.id ?? (entity as Record<string, unknown>)[key];
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

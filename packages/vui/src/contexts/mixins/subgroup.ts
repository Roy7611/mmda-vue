import {
  MetaModel,
  isPromise,
  type Entity,
  type MetaUi,
  type MetaUiFieldLogic,
  type MetaUiGroup,
  type MetaUiGroupLogic,
  type SubGroupItemTransformParam,
  type UiSubGroupView,
} from "@mmda/core";
import { computed, unref } from "vue";
import { canDoFromExecutableExpression, type UiAction } from "../../ui/factory/action";
import type { UiColorRole } from "../../app/material";
import { UiViewOne, type UiViewType } from "../view";
import type { Constructor } from "./types";

type FieldLogicMap = Record<string, MetaUiFieldLogic<any>>;

export function WithSubgroup<TBase extends Constructor>(Base: TBase) {
  return class Subgroup extends Base {
    getSelectedGroupItems(group: MetaUiGroup | string) {
      return this.subGroupContext(group).selectedItems;
    }

    subGroupContext(group: MetaUiGroup | string) {
      const grp = this.resolveGroup(group);
      if (!grp.groupUi)
        throw new Error(`Group "${grp.groupName}" has no groupUi.`);
      const path = `${this.cachePath}/${grp.groupName}`;
      const cached = this.cache.get(path);
      if (cached) return cached;
      const rows =
        ((this.model as Record<string, any>)[grp.groupName] as
          | object[]
          | undefined) ?? [];
      const fieldLogics: FieldLogicMap = {};
      const groupLogic = this.getGroupLogic(grp);
      for (const fieldLogic of groupLogic?.fields ?? []) {
        fieldLogics[fieldLogic.field.fieldName] = fieldLogic;
      }
      return this.createChild(rows, grp.groupUi, path, this.view, fieldLogics);
    }

    subGroupItemContext<G extends Entity>(
      group: MetaUiGroup | string,
      item: G,
      groupMode: UiSubGroupView = this.editing ? "edit" : "details",
      cacheKey = "id",
    ) {
      const grp = this.resolveGroup(group);
      if (!grp.groupUi)
        throw new Error(`Group "${grp.groupName}" has no groupUi.`);
      const rowKey = this.rowCacheKey(item, cacheKey, grp.groupUi.primaryKey);
      const path = `${this.cachePath}/${grp.groupName}/${rowKey}`;
      const cached = this.cache.get(path);
      if (cached) return cached as typeof this & { model: G };
      const fieldLogics: FieldLogicMap = {};
      const groupLogic = this.getGroupLogic(grp);
      for (const fieldLogic of groupLogic?.fields ?? []) {
        fieldLogics[fieldLogic.field.fieldName] = fieldLogic;
      }
      return this.createChild(
        item,
        grp.groupUi,
        path,
        groupMode as UiViewType,
        fieldLogics,
        this.logic?.createRelativeLogic?.(grp.groupName, this.model as Entity) ??
          this.logic,
      ) as typeof this & { model: G };
    }

    addSubGroupItem<G extends Entity>(group: MetaUiGroup | string, item: G) {
      const grp = this.resolveGroup(group);
      const items = ((this.model as Record<string, any>)[grp.groupName] ??= []);
      if (items.includes(item)) return;
      items.push(item);
      MetaModel.modify(this.model as Entity);
      this.getGroupLogic(grp)?.onChangeFn?.(this as any, this.model, items);
    }

    addSubGroupItems<G extends Entity>(param: SubGroupItemTransformParam<G>) {
      MetaModel.addSubGroupItems(this.resolveSubGroupTransform(param));
      MetaModel.modify(this.model as Entity);
      const group = this.resolveGroup(param.group);
      this.getGroupLogic(group)?.onChangeFn?.(
        this as any,
        this.model,
        (this.model as Record<string, any>)[group.groupName],
      );
    }

    createSubGroupItems<G extends Entity>(
      param: SubGroupItemTransformParam<G>,
    ): Promise<G | G[]> {
      return Promise.resolve(
        MetaModel.createSubGroupItems(this.resolveSubGroupTransform(param)),
      );
    }

    removeSubGroupItem<G extends Entity>(group: MetaUiGroup | string, item: G) {
      const grp = this.resolveGroup(group);
      const logic = this.getGroupLogic(grp);
      const items = (this.model as Record<string, any>)[grp.groupName] ?? [];
      const commit = () => {
        MetaModel.deleteItem(items, item);
        logic?.onChangeFn?.(this as any, this.model, items);
      };
      const intercept = logic?.beforeItemRemoveFunc;
      if (!intercept) {
        commit();
        return;
      }
      const master = ((this.root ?? this).model ?? {}) as Record<string, any>;
      const result = intercept(item, master, this as any);
      if (isPromise(result)) {
        return result.then((ok) => {
          if (ok !== false) commit();
        });
      }
      if (result !== false) commit();
    }

    removeSubGroupItems(group: MetaUiGroup | string) {
      const grp = this.resolveGroup(group);
      const items = (this.model as Record<string, any>)[grp.groupName] ?? [];
      MetaModel.clearItems(items);
      this.getGroupLogic(grp)?.onChangeFn?.(this as any, this.model, items);
    }

    async subGroupItem<G>(
      group: MetaUiGroup | string,
      item: G,
      props: { groupMode?: UiSubGroupView } = {},
    ): Promise<false | G> {
      const ctx = this.subGroupItemContext(
        group,
        item as Entity,
        props.groupMode,
      );
      if (!this.app) return item;
      this.root.showDialog = (ctx as any).isEditDialog = true;
      try {
        const result = await this.app.ui.dialog(
          this.app.ui.buildView(ctx),
          ctx,
          { name: this.resolveGroup(group).groupName },
        );
        return result === 'ok' ? (ctx.model as G) : false;
      } finally {
        this.root.showDialog = (ctx as any).isEditDialog = false;
      }
    }

    async newSubGroupItem<G extends Entity>(
      param: SubGroupItemTransformParam<G>,
    ) {
      const created = (await this.createSubGroupItems(param)) as G;
      this.addSubGroupItem(param.group, created);
      const accepted = await this.subGroupItem(param.group, created, {
        groupMode: "create",
      });
      if (!accepted) {
        this.removeSubGroupItem(param.group, created);
        return false;
      }
      return accepted;
    }

    getGroupActions(grp: MetaUiGroup) {
      this.setupGroupActions(grp);
      return ((this as any)._groupActions[grp.groupName] ?? []).filter(
        (a: UiAction) => {
          if (
            a.view &&
            a.view !== UiViewOne.Create &&
            a.view !== UiViewOne.Edit
          ) {
            return false;
          }
          const visible = a.visible;
          if (visible == null) return true;
          if (typeof visible === "function") return true;
          if (
            typeof visible === "object" &&
            visible !== null &&
            "value" in visible
          ) {
            return Boolean((visible as { value: boolean }).value);
          }
          return Boolean(visible);
        },
      );
    }

    setupGroupActions(grp: MetaUiGroup) {
      const name = grp.groupName;
      const actionsMap = (this as any)._groupActions as Record<string, UiAction[]>;
      if (actionsMap[name]) return;

      const actions: UiAction[] = [];
      actionsMap[name] = actions;
      if (!this.editing) return;

      const grpLogic = this.getGroupLogic(grp);
      if (!grpLogic) return;

      const visibles = this.logic?.groupActionVisibles?.[name];
      const context = this;

      const liveCanDo = (action: any) => {
        return (model: unknown, ctx?: unknown) => {
          if (this.isGroupReadonly(grp)) return false;
          const pred = canDoFromExecutableExpression(this as any, action);
          return pred ? pred(model, ctx as any) !== false : true;
        };
      };

      const visibleOf = (actionName: string) =>
        visibles?.[actionName]
          ? computed(() => !!visibles[actionName]!(this.model, this))
          : undefined;

      for (const std of grpLogic.stdActions ?? []) {
        if (std.name === "clear") {
          actions.push({
            name: "clear",
            icon: std.icon ?? "clear",
            label: std.label ?? this.t("action.clear"),
            colorRole: "danger",
            onAction: () => this.removeSubGroupItems(grp),
            view: UiViewOne.Edit,
            canDo: liveCanDo(std),
            visible: visibleOf("clear"),
          });
        } else if (std.name === "add") {
          actions.push({
            name: "add",
            role: "secondary",
            icon: std.icon ?? "plus",
            label: std.label ?? this.t("action.add"),
            colorRole: "primary",
            onAction: () => this.runGroupAdd(grp, grpLogic),
            view: UiViewOne.Edit,
            canDo: liveCanDo(std),
            visible: visibleOf("add"),
          });
        }
      }

      if (grpLogic.customActions?.length) {
        for (const a of grpLogic.customActions) {
          const uiAction: UiAction = {
            name: a.name,
            icon: a.icon,
            label: a.label,
            colorRole: a.role as UiColorRole,
            onAction: () =>
              a.onAction!.apply(this.logic, [context, context.model]),
            tooltip: a.description,
            view: a.view ?? context.view,
            canDo: liveCanDo(a),
          };
          if (a.visible) {
            uiAction.visible = computed(() => !!a.visible!(context.model));
          }
          actions.push(uiAction);
        }
      }
    }

    async runGroupAdd(grp: MetaUiGroup, grpLogic: MetaUiGroupLogic<any, any>) {
      if (typeof grpLogic.defaultAddFn === "function") {
        return grpLogic.defaultAddFn.apply(this.logic, [this, this.model]);
      }
      const items = (this.model as Record<string, any>)[grp.groupName] ?? [];
      if (typeof grpLogic.beforeAddFn === "function") {
        const ok = await grpLogic.beforeAddFn(this as any, this.model, items);
        if (ok === false) return;
      }
      const created = await this.createSubGroupItems({
        group: grp,
        target: this.model as Entity,
      });
      const list = Array.isArray(created) ? created : [created];
      for (const item of list) this.addSubGroupItem(grp, item);
    }
  };
}
